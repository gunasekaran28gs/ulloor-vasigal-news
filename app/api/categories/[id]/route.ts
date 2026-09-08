import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCategories } from "@/lib/permissions";

// PATCH /api/categories/:id
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || !canManageCategories(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, parentId } = body;

  if (parentId === id) {
    return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name ? { name: name.trim() } : {}),
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
  const role = (session?.user as any)?.role;

  if (!session || !canManageCategories(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
