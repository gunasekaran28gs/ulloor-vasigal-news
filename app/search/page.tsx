import { getPaginated } from "@/lib/articles";
import { parsePage } from "@/lib/format";
import ArticleListing from "@/components/ArticleListing";
import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q || "").trim().slice(0, 100);
  const page = parsePage(params.page);

  const { articles, total } = q
    ? await getPaginated(
        {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
          ],
        },
        page
      )
    : { articles: [], total: 0 };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="mb-4 text-3xl font-bold text-ink">{q ? `Results for “${q}”` : "Search"}</h1>
      <form action="/search" role="search" className="mb-8 flex max-w-xl gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          required
          maxLength={100}
          placeholder="Search news…"
          aria-label="Search news"
          className="min-w-0 flex-1 border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button type="submit" className="bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
          Search
        </button>
      </form>
      <ArticleListing
        articles={articles}
        total={total}
        page={page}
        basePath="/search"
        query={{ q }}
        emptyMessage={q ? "No stories matched your search." : "Type a word above to find stories."}
      />
    </div>
  );
}
