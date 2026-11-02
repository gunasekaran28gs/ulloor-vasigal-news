import Link from "next/link";
import { getLatest, type ArticleCardData } from "@/lib/articles";
import { childrenOf, descendantIds, getCategories, publishedCount, topLevelByActivity, type CategoryNode } from "@/lib/categories";
import { siteConfig } from "@/lib/site";
import { FeatureCard, GridCard, HeadlineItem, ListCard, OverlayCard } from "@/components/ArticleCard";
import BreakingTicker from "@/components/BreakingTicker";
import JsonLd from "@/components/JsonLd";
import SectionHeading from "@/components/SectionHeading";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: re-fetch homepage every 60s

const MAX_SECTIONS = 12;
const SECTION_SIZE = 13;
const MOBILE_LIST_ITEMS = 3;

export const metadata: Metadata = {
  title: { absolute: siteConfig.name },
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

function CategorySection({
  category,
  subcategories,
  articles,
  layout,
}: {
  category: CategoryNode;
  subcategories: CategoryNode[];
  articles: ArticleCardData[];
  layout: "grid" | "mixed";
}) {
  const href = `/category/${category.slug}`;
  const tabs =
    subcategories.length > 0
      ? [
          { label: "All", href, active: true },
          ...subcategories.map((c) => ({ label: c.name, href: `/category/${c.slug}` })),
        ]
      : [{ label: "View all", href }];

  return (
    <section className="mb-14">
      <SectionHeading title={category.name} tabs={tabs} />
      {layout === "grid" ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
          {articles.slice(0, 8).map((a) => (
            <GridCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {articles.slice(0, 4).map((a) => (
              <OverlayCard
                key={a.id}
                article={a}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 290px"
                className="aspect-[16/10] sm:aspect-[5/6]"
              />
            ))}
          </div>
          {articles.length > 4 && (
            <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(4).map((a, i) => (
                <div key={a.id} className={i >= MOBILE_LIST_ITEMS ? "hidden md:block" : undefined}>
                  <ListCard article={a} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default async function HomePage() {
  const [latest, categories] = await Promise.all([getLatest(15), getCategories()]);

  const sections = await Promise.all(
    topLevelByActivity(categories)
      .filter((c) => publishedCount(categories, c.id) > 0)
      .slice(0, MAX_SECTIONS)
      .map(async (category) => ({
        category,
        subcategories: childrenOf(categories, category.id),
        articles: await getLatest(SECTION_SIZE, { categoryId: { in: descendantIds(categories, category.id) } }),
      }))
  );

  const [lead, ...rest] = latest;
  const secondary = rest.slice(0, 2);
  const headlines = rest.slice(2, 6);
  const latestPosts = rest.slice(6);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <JsonLd data={websiteJsonLd} />
      <h1 className="sr-only">{siteConfig.name}</h1>

      {!lead ? (
        <div className="py-24 text-center text-muted">
          <p className="text-lg">No articles published yet.</p>
          <p className="mt-1 text-sm">Once a writer publishes a story, it will appear here.</p>
        </div>
      ) : (
        <>
          <BreakingTicker items={latest.slice(0, 10).map(({ id, slug, title }) => ({ id, slug, title }))} />

          <section aria-label="Top stories" className="mb-14 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
            <OverlayCard
              article={lead}
              large
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="aspect-[16/10] md:col-span-2 lg:col-span-6 lg:aspect-auto lg:h-[460px]"
            />
            {secondary.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 md:col-span-2 lg:col-span-3 lg:h-[460px] lg:grid-cols-1 lg:gap-5">
                {secondary.map((a) => (
                  <OverlayCard
                    key={a.id}
                    article={a}
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="aspect-[16/10] lg:aspect-auto lg:min-h-0"
                  />
                ))}
              </div>
            )}
            {headlines.length > 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <h2 className="mb-3 text-2xl font-bold text-ink">Top Headlines</h2>
                {headlines.map((a) => (
                  <HeadlineItem key={a.id} article={a} />
                ))}
              </div>
            )}
          </section>

          {sections.map((section, i) => (
            <CategorySection key={section.category.id} {...section} layout={i % 2 === 0 ? "grid" : "mixed"} />
          ))}

          {latestPosts.length > 0 && (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
              <section>
                <SectionHeading title="Latest Posts" tabs={[{ label: "View all", href: "/latest" }]} />
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                  {latestPosts.map((a) => (
                    <FeatureCard key={a.id} article={a} />
                  ))}
                </div>
                <div className="mt-10 text-center">
                  <Link href="/latest" className="inline-block bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                    More stories
                  </Link>
                </div>
              </section>
              <Sidebar />
            </div>
          )}
        </>
      )}
    </div>
  );
}
