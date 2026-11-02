import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPublish } from "@/lib/permissions";
import ArticleForm from "@/components/ArticleForm";

export default async function NewArticlePage() {
  const session = await auth();
  const role = session?.user?.role;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return <ArticleForm categories={categories} canPublish={canPublish(role)} />;
}
