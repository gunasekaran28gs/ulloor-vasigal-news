import type { ArticleCardData } from "@/lib/articles";
import { FeatureCard } from "./ArticleCard";
import Pagination from "./Pagination";
import Sidebar from "./Sidebar";

export default function ArticleListing({
  articles,
  total,
  page,
  basePath,
  query,
  emptyMessage,
}: {
  articles: ArticleCardData[];
  total: number;
  page: number;
  basePath: string;
  query?: Record<string, string>;
  emptyMessage: string;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-8">
      <div>
        {articles.length === 0 ? (
          <p className="py-16 text-center text-muted">{emptyMessage}</p>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
            {articles.map((a, i) => (
              <FeatureCard key={a.id} article={a} priority={i < 2} />
            ))}
          </div>
        )}
        <Pagination page={page} total={total} basePath={basePath} query={query} />
      </div>
      <Sidebar />
    </div>
  );
}
