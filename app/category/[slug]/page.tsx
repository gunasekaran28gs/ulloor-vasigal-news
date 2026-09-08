import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site";

export const revalidate = 120;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};

  return {
    title: category.name,
    description: category.description || `Latest ${category.name} news from ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
    include: { author: true, category: true },
    orderBy: { publishedAt: "desc" },
    take: 24,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-serif-heading text-3xl font-black mb-2">{category.name}</h1>
      {category.description && <p className="text-gray-500 mb-8">{category.description}</p>}

      {articles.length === 0 ? (
        <p className="text-gray-400 py-16 text-center">No articles in this category yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} size="medium" />
          ))}
        </div>
      )}
    </div>
  );
}
