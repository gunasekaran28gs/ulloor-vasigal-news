import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCategories } from "@/lib/permissions";
import { descendantIds } from "@/lib/categories";

// PATCH /api/categories/:id
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role;

  if (!session || !canManageCategories(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, parentId } = body;

  if (parentId === id) {
    return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
  }

  if (parentId) {
    const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
    if (descendantIds(all, id).includes(parentId)) {
      return NextResponse.json({ error: "A category cannot be moved under its own subcategory" }, { status: 400 });
    }
  }

  if (name?.trim()) {
    const duplicate = await prisma.category.findFirst({ where: { name: name.trim(), NOT: { id } } });
    if (duplicate) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      description,
      parentId: parentId || null,
    },
  });

  return NextResponse.json(category);
}

// DELETE /api/categories/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role;

  if (!session || !canManageCategories(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
