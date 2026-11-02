import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPublish } from "@/lib/permissions";
import ArticleForm from "@/components/ArticleForm";
import { notFound, redirect } from "next/navigation";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();
  if (article.authorId !== userId && !canPublish(role)) redirect("/dashboard");

  return (
    <ArticleForm
      categories={categories}
      canPublish={canPublish(role)}
      initial={{
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || "",
        content: article.content,
        coverImage: article.coverImage || "",
        categoryId: article.categoryId || "",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        status: article.status,
      }}
    />
  );
}
