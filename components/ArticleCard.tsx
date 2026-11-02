import Link from "next/link";
import Image from "next/image";
import type { ArticleCardData } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { siteConfig } from "@/lib/site";

const BADGE_COLORS = ["#c026d3", "#2563eb", "#dc2626", "#047857", "#b45309", "#7c3aed", "#0e7490"];

function badgeColor(slug: string) {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return BADGE_COLORS[hash % BADGE_COLORS.length];
}

export function CategoryBadge({ category }: { category: { name: string; slug: string } }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      style={{ backgroundColor: badgeColor(category.slug) }}
      className="relative z-10 inline-block rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase leading-5 text-white"
    >
      {category.name}
    </Link>
  );
}

function Cover({ article, sizes, priority }: { article: ArticleCardData; sizes: string; priority?: boolean }) {
  if (!article.coverImage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-900 px-3 text-center text-sm font-bold text-white/40">
        {siteConfig.name}
      </div>
    );
  }
  return (
    <Image
      src={article.coverImage}
      alt={article.title}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );
}

function PostDate({ date, className = "text-muted" }: { date: Date | null; className?: string }) {
  if (!date) return null;
  return (
    <time dateTime={new Date(date).toISOString()} className={`text-xs ${className}`}>
      {formatDate(date)}
    </time>
  );
}

// Image with the headline laid over it; the headline link stretches across the whole card.
export function OverlayCard({
  article,
  sizes,
  priority,
  large,
  className = "",
}: {
  article: ArticleCardData;
  sizes: string;
  priority?: boolean;
  large?: boolean;
  className?: string;
}) {
  return (
    <article className={`group relative overflow-hidden bg-soft ${className}`}>
      <Cover article={article} sizes={sizes} priority={priority} />
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/75 via-45% to-black/5" />
      <div className={`absolute inset-x-0 bottom-0 ${large ? "p-4 md:p-6" : "p-4"}`}>
        {article.category && <CategoryBadge category={article.category} />}
        <h3
          className={`mt-2 font-bold text-white ${
            large ? "line-clamp-3 text-xl leading-snug md:text-3xl md:leading-snug" : "line-clamp-3 text-base leading-snug"
          }`}
        >
          <Link
            href={`/article/${article.slug}`}
            className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4"
          >
            {article.title}
          </Link>
        </h3>
        <div className="mt-2">
          <PostDate date={article.publishedAt} className="text-white/70" />
        </div>
      </div>
    </article>
  );
}

export function GridCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group">
      <Link href={`/article/${article.slug}`} tabIndex={-1} aria-hidden className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-soft">
          <Cover article={article} sizes="(max-width: 1024px) 50vw, 290px" />
        </div>
      </Link>
      <h3 className="mt-3 line-clamp-3 text-sm font-bold leading-relaxed text-ink md:text-[15px]">
        <Link href={`/article/${article.slug}`} className="group-hover:text-brand-text">
          {article.title}
        </Link>
      </h3>
      <div className="mt-1.5">
        <PostDate date={article.publishedAt} />
      </div>
    </article>
  );
}

export function ListCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group flex gap-3.5">
      <Link href={`/article/${article.slug}`} tabIndex={-1} aria-hidden className="block w-28 shrink-0 sm:w-32">
        <div className="relative aspect-[4/3] overflow-hidden bg-soft">
          <Cover article={article} sizes="130px" />
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-3 text-sm font-bold leading-relaxed text-ink">
          <Link href={`/article/${article.slug}`} className="group-hover:text-brand-text">
            {article.title}
          </Link>
        </h3>
        <div className="mt-1">
          <PostDate date={article.publishedAt} />
        </div>
      </div>
    </article>
  );
}

export function HeadlineItem({ article }: { article: ArticleCardData }) {
  return (
    <article className="group border-b border-line py-3.5 first:pt-0 last:border-b-0">
      <h3 className="line-clamp-3 text-[15px] font-bold leading-relaxed text-ink">
        <Link href={`/article/${article.slug}`} className="group-hover:text-brand-text">
          {article.title}
        </Link>
      </h3>
      <div className="mt-1.5 flex items-center gap-3">
        {article.category && (
          <Link
            href={`/category/${article.category.slug}`}
            className="text-[11px] font-bold uppercase text-brand-text hover:underline"
          >
            {article.category.name}
          </Link>
        )}
        <PostDate date={article.publishedAt} />
      </div>
    </article>
  );
}

// Listing card with a summary, used on category, search, and latest pages.
export function FeatureCard({ article, priority }: { article: ArticleCardData; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/article/${article.slug}`} tabIndex={-1} aria-hidden className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-soft">
          <Cover article={article} sizes="(max-width: 640px) 100vw, 400px" priority={priority} />
        </div>
      </Link>
      <h2 className="mt-3.5 line-clamp-3 text-lg font-bold leading-snug text-ink md:text-xl md:leading-snug">
        <Link href={`/article/${article.slug}`} className="group-hover:text-brand-text">
          {article.title}
        </Link>
      </h2>
      <div className="mt-2">
        <PostDate date={article.publishedAt} />
      </div>
      {article.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>}
    </article>
  );
}
