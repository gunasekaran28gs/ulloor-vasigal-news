import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCategories } from "@/lib/permissions";
import { redirect } from "next/navigation";
import CategoryManager from "@/components/CategoryManager";

export default async function CategoriesPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!canManageCategories(role)) redirect("/dashboard");

  const categories = await prisma.category.findMany({
    include: { parent: true, _count: { select: { articles: true, children: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-6">Manage Categories</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
