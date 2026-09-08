import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 120;

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: true, category: true, tags: true },
  });
}

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    take: 50, // pre-render most recent 50; rest render on-demand via ISR
    orderBy: { publishedAt: "desc" },
  });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt || undefined;
  const url = `${siteConfig.url}/article/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author?.name ? [article.author.name] : undefined,
      images: article.coverImage ? [{ url: article.coverImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // fire-and-forget view count increment
  prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const related = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      ...(article.categoryId ? { categoryId: article.categoryId } : {}),
    },
    include: { author: true, category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: [
      {
        "@type": "Person",
        name: article.author?.name || "Staff Writer",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/article/${article.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      ...(article.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: article.category.name,
              item: `${siteConfig.url}/category/${article.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: article.category ? 3 : 2,
        name: article.title,
        item: `${siteConfig.url}/article/${article.slug}`,
      },
    ],
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="text-xs text-gray-400 mb-4 flex gap-1.5" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        {article.category && (
          <>
            <span>/</span>
            <Link href={`/category/${article.category.slug}`} className="hover:text-gray-700">
              {article.category.name}
            </Link>
          </>
        )}
      </nav>

      {article.category && (
        <Link
          href={`/category/${article.category.slug}`}
          className="text-xs font-bold uppercase tracking-wide text-red-700"
        >
          {article.category.name}
        </Link>
      )}

      <h1 className="font-serif-heading text-3xl md:text-4xl font-black mt-2 mb-4 leading-tight">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="text-lg text-gray-600 mb-6">{article.excerpt}</p>
      )}

      <div className="flex items-center gap-3 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
        <span className="font-semibold text-gray-800">{article.author?.name || "Staff Writer"}</span>
        <span>·</span>
        <time dateTime={article.publishedAt?.toISOString()}>
          {article.publishedAt &&
            new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
        </time>
        <span>·</span>
        <span>{article.views} views</span>
      </div>

      {article.coverImage && (
        <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-gray-100">
          <Image src={article.coverImage} alt={article.title} fill className="object-cover" priority />
        </div>
      )}

      <div
        className="prose-article text-gray-800"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10">
          {article.tags.map((t) => (
            <span key={t.id} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              #{t.name}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="font-serif-heading text-xl font-bold mb-6">Related Stories</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} size="medium" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
