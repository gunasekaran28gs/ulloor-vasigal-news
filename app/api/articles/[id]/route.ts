import { NextResponse } from "next/server";
import { ArticleStatus, type Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWrite, canPublish } from "@/lib/permissions";
import { slugify } from "@/lib/slugify";

// PATCH /api/articles/:id — update / submit for review / publish
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  if (!session || !canWrite(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Writers can only edit their own articles; editors/admins can edit any
  if (article.authorId !== userId && !canPublish(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: Prisma.ArticleUncheckedUpdateInput = {
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    contentJson: body.contentJson ?? undefined,
    coverImage: body.coverImage,
    categoryId: body.categoryId,
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
  };

  // Stories saved while slugify dropped Tamil text have an empty slug and no working URL.
  if (!article.slug) {
    const base = slugify(body.title || article.title) || "article";
    const taken = await prisma.article.findUnique({ where: { slug: base } });
    data.slug = taken ? `${base}-${Date.now().toString(36)}` : base;
  }

  if (body.status && !Object.values(ArticleStatus).includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Only editors/admins can change publish status
  if (body.status && canPublish(role)) {
    data.status = body.status;
    if (body.status === "PUBLISHED" && !article.publishedAt) {
      data.publishedAt = new Date();
    }
  } else if (body.status === "IN_REVIEW") {
    data.status = "IN_REVIEW";
  }

  const updated = await prisma.article.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/articles/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (article.authorId !== userId && !canPublish(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
