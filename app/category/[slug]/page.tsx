import { getPaginated } from "@/lib/articles";
import { ancestorsOf, childrenOf, descendantIds, getCategories } from "@/lib/categories";
import { parsePage } from "@/lib/format";
import { decodeSlug } from "@/lib/slugify";
import ArticleListing from "@/components/ArticleListing";
import Breadcrumb from "@/components/Breadcrumb";
import SectionHeading from "@/components/SectionHeading";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site";

export const revalidate = 120;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === decodeSlug(slug));
  if (!category) return {};

  return {
    title: category.name,
    description: category.description || `Latest ${category.name} news from ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/category/${encodeURIComponent(category.slug)}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { slug } = await params;
  const page = parsePage((await searchParams).page);
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === decodeSlug(slug));
  if (!category) notFound();

  const ancestors = ancestorsOf(categories, category);
  const parent = ancestors.at(-1);
  // A subcategory keeps its parent's tabs, so readers can move between sibling sections.
  const tabOwner = childrenOf(categories, category.id).length > 0 || !parent ? category : parent;
  const subcategories = childrenOf(categories, tabOwner.id);
  const tabs = subcategories.length
    ? [
        { label: "All", href: `/category/${tabOwner.slug}`, active: tabOwner.id === category.id },
        ...subcategories.map((c) => ({ label: c.name, href: `/category/${c.slug}`, active: c.id === category.id })),
      ]
    : [];

  const { articles, total } = await getPaginated({ categoryId: { in: descendantIds(categories, category.id) } }, page);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...ancestors.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
          { label: category.name },
        ]}
      />
      {tabs.length > 0 ? (
        <SectionHeading as="h1" title={category.name} tabs={tabs} />
      ) : (
        <h1 className="mb-6 text-3xl font-bold text-ink">{category.name}</h1>
      )}
      {category.description && <p className="-mt-3 mb-6 text-muted">{category.description}</p>}

      <ArticleListing
        articles={articles}
        total={total}
        page={page}
        basePath={`/category/${category.slug}`}
        emptyMessage="No articles in this category yet."
      />
    </div>
  );
}
