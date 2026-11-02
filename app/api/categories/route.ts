import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { canManageCategories } from "@/lib/permissions";

// GET /api/categories — list all, with parent info
export async function GET() {
  const categories = await prisma.category.findMany({
    include: { parent: true, _count: { select: { articles: true, children: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

// POST /api/categories — create (admin/editor only)
export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session || !canManageCategories(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, parentId } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = slugify(name);
  if (!slug) {
    return NextResponse.json({ error: "Name must contain letters or numbers" }, { status: 400 });
  }

  const existing = await prisma.category.findFirst({ where: { OR: [{ slug }, { name: name.trim() }] } });
  if (existing) {
    return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      description: description || null,
      parentId: parentId || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
