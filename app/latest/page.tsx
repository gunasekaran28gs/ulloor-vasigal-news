import { getPaginated } from "@/lib/articles";
import { parsePage } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import ArticleListing from "@/components/ArticleListing";
import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Posts",
  description: `The latest news from ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/latest` },
};

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = parsePage((await searchParams).page);
  const { articles, total } = await getPaginated({}, page);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Latest Posts" }]} />
      <h1 className="mb-6 text-3xl font-bold text-ink">Latest Posts</h1>
      <ArticleListing articles={articles} total={total} page={page} basePath="/latest" emptyMessage="No articles published yet." />
    </div>
  );
}
