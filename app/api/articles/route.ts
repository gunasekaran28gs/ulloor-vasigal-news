import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { canWrite, canPublish } from "@/lib/permissions";

// GET /api/articles?status=PUBLISHED&category=tech
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PUBLISHED";
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const articles = await prisma.article.findMany({
    where: {
      status: status as any,
      ...(category ? { category: { slug: category } } : {}),
    },
    include: { author: true, category: true, tags: true },
    orderBy: { publishedAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json(articles);
}

// POST /api/articles — create a new draft (writer, editor, admin)
export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || !canWrite(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, excerpt, content, contentJson, coverImage, categoryId, metaTitle, metaDescription } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  let slug = slugify(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  // Writers create drafts; editors/admins can publish directly if they pass status
  const requestedStatus = body.status === "PUBLISHED" && canPublish(role) ? "PUBLISHED" : "DRAFT";

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      contentJson,
      coverImage,
      categoryId: categoryId || null,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      status: requestedStatus,
      publishedAt: requestedStatus === "PUBLISHED" ? new Date() : null,
      authorId: (session!.user as any).id,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
