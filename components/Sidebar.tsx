import { getLatest, getMostViewed } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { ListCard } from "./ArticleCard";
import SectionHeading from "./SectionHeading";

const POSTS_PER_BLOCK = 5;

export default async function Sidebar({ excludeId }: { excludeId?: string }) {
  const [mostViewed, latest, tags] = await Promise.all([
    getMostViewed(POSTS_PER_BLOCK + 1),
    getLatest(POSTS_PER_BLOCK * 2 + 2),
    prisma.tag.findMany({
      where: { articles: { some: { status: "PUBLISHED" } } },
      orderBy: { articles: { _count: "desc" } },
      take: 12,
    }),
  ]);

  const popular = mostViewed.filter((a) => a.id !== excludeId).slice(0, POSTS_PER_BLOCK);
  const shown = new Set([excludeId, ...popular.map((a) => a.id)]);
  const recommended = latest.filter((a) => !shown.has(a.id)).slice(0, POSTS_PER_BLOCK);

  return (
    <aside className="flex flex-col gap-10 print:hidden">
      {popular.length > 0 && (
        <section>
          <SectionHeading title="Popular Posts" />
          <div className="flex flex-col gap-5">
            {popular.map((a) => (
              <ListCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
      {recommended.length > 0 && (
        <section>
          <SectionHeading title="Recommended Posts" />
          <div className="flex flex-col gap-5">
            {recommended.map((a) => (
              <ListCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
      {tags.length > 0 && (
        <section>
          <SectionHeading title="Popular Tags" />
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t.id} className="bg-soft px-3 py-1.5 text-xs text-muted">
                {t.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}
