import Link from "next/link";
import { getMostViewed } from "@/lib/articles";
import { getCategories, topLevelByActivity } from "@/lib/categories";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export default async function Footer() {
  const [mostViewed, categories] = await Promise.all([getMostViewed(3), getCategories()]);

  return (
    <footer className="mt-16 bg-masthead text-white/70 print:hidden">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Link href="/" className="text-xl font-extrabold text-white">
            {siteConfig.name}
          </Link>
          <p className="mt-3 text-sm leading-relaxed">{siteConfig.description}</p>
        </div>

        <div>
          <h2 className="mb-4 font-bold text-white">Most Viewed Posts</h2>
          <ul className="flex flex-col gap-4">
            {mostViewed.map((a) => (
              <li key={a.id}>
                <Link href={`/article/${a.slug}`} className="line-clamp-2 text-sm font-semibold leading-relaxed text-white/90 hover:text-brand">
                  {a.title}
                </Link>
                <span className="text-xs">{formatDate(a.publishedAt)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-bold text-white">Categories</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {topLevelByActivity(categories).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-2 px-4 py-4 text-xs md:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/latest" className="hover:text-white">Latest</Link>
            <a href="/rss.xml" className="hover:text-white">RSS</a>
            <a href="/sitemap.xml" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
