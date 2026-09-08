import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: re-fetch homepage every 60s

export const metadata: Metadata = {
  title: "Home",
  description: siteConfig.description,
};

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { author: true, category: true },
    orderBy: { publishedAt: "desc" },
    take: 13,
  });

  const [featured, ...rest] = articles;

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {!featured ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg">No articles published yet.</p>
          <p className="text-sm mt-1">Once a writer publishes a story, it will appear here.</p>
        </div>
      ) : (
        <>
          <section className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <ArticleCard article={featured} size="large" />
            </div>
            <div className="flex flex-col gap-6">
              {rest.slice(0, 3).map((a) => (
                <ArticleCard key={a.id} article={a} size="medium" />
              ))}
            </div>
          </section>

          <hr className="border-gray-200 mb-10" />

          <section>
            <h2 className="font-serif-heading text-xl font-bold mb-6">Latest Stories</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {rest.slice(3).map((a) => (
                <ArticleCard key={a.id} article={a} size="medium" />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
