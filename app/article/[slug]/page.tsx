import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { cache } from "react";
import { articleCardSelect } from "@/lib/articles";
import { formatDateTime } from "@/lib/format";
import { decodeSlug } from "@/lib/slugify";
import { CategoryBadge, GridCard } from "@/components/ArticleCard";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import SectionHeading from "@/components/SectionHeading";
import ShareButtons from "@/components/ShareButtons";
import Sidebar from "@/components/Sidebar";
import ViewTracker from "@/components/ViewTracker";

export const revalidate = 120;

const getArticle = cache((param: string) =>
  prisma.article.findFirst({
    where: { slug: decodeSlug(param), status: "PUBLISHED" },
    include: { author: { select: { name: true } }, category: true, tags: true },
  })
);

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
  const url = `${siteConfig.url}/article/${encodeURIComponent(article.slug)}`;

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

  const related = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      ...(article.categoryId ? { categoryId: article.categoryId } : {}),
    },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
    take: 6,
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
      "@id": `${siteConfig.url}/article/${encodeURIComponent(article.slug)}`,
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
              item: `${siteConfig.url}/category/${encodeURIComponent(article.category.slug)}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: article.category ? 3 : 2,
        name: article.title,
        item: `${siteConfig.url}/article/${encodeURIComponent(article.slug)}`,
      },
    ],
  };

  const canonicalUrl = `${siteConfig.url}/article/${encodeURIComponent(article.slug)}`;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ViewTracker articleId={article.id} />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...(article.category ? [{ label: article.category.name, href: `/category/${article.category.slug}` }] : []),
          { label: article.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
        <div className="min-w-0">
          <article>
            {article.category && <CategoryBadge category={article.category} />}

            <h1 className="mb-4 mt-3 text-2xl font-bold leading-snug text-ink md:text-4xl md:leading-snug">
              {article.title}
            </h1>

            {article.excerpt && <p className="mb-4 text-base leading-relaxed text-body md:text-lg md:leading-relaxed">{article.excerpt}</p>}

            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="font-semibold text-body">{article.author?.name || "Staff Writer"}</span>
              <time dateTime={article.publishedAt?.toISOString()}>{formatDateTime(article.publishedAt)}</time>
              <span>{article.views} views</span>
            </div>

            <div className="mb-6">
              <ShareButtons url={canonicalUrl} title={article.title} image={article.coverImage} />
            </div>

            {article.coverImage && (
              <div className="relative mb-7 aspect-[16/9] w-full overflow-hidden bg-soft">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 780px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.content }} />

            {article.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <span key={t.id} className="bg-soft px-3 py-1.5 text-xs text-muted">
                    #{t.name}
                  </span>
                ))}
              </div>
            )}
          </article>

          {related.length > 0 && (
            <section className="mt-14 print:hidden">
              <SectionHeading title="Related Posts" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">
                {related.map((a) => (
                  <GridCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </div>

        <Sidebar excludeId={article.id} />
      </div>
    </div>
  );
}
