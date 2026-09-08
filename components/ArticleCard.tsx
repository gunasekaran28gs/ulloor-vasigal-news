import Link from "next/link";
import Image from "next/image";

type ArticleCardProps = {
  article: {
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImage?: string | null;
    publishedAt?: Date | null;
    author?: { name?: string | null } | null;
    category?: { name: string; slug: string } | null;
  };
  size?: "large" | "medium" | "small";
};

export default function ArticleCard({ article, size = "medium" }: ArticleCardProps) {
  const isLarge = size === "large";

  return (
    <article className={`group ${isLarge ? "" : "flex gap-4"}`}>
      <Link href={`/article/${article.slug}`} className={isLarge ? "block" : "flex-shrink-0 w-32 sm:w-40"}>
        <div className={`relative bg-gray-100 rounded-md overflow-hidden ${isLarge ? "aspect-[16/9] mb-4" : "aspect-[4/3]"}`}>
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes={isLarge ? "(max-width: 768px) 100vw, 800px" : "160px"}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif-heading text-xl">
              News
            </div>
          )}
        </div>
      </Link>

      <div className={isLarge ? "" : "flex-1 min-w-0"}>
        {article.category && (
          <Link
            href={`/category/${article.category.slug}`}
            className="text-xs font-bold uppercase tracking-wide text-red-700"
          >
            {article.category.name}
          </Link>
        )}
        <Link href={`/article/${article.slug}`}>
          <h3
            className={`font-serif-heading font-bold group-hover:text-red-700 transition-colors ${
              isLarge ? "text-2xl md:text-3xl mt-2" : "text-base mt-1 line-clamp-2"
            }`}
          >
            {article.title}
          </h3>
        </Link>
        {isLarge && article.excerpt && (
          <p className="text-gray-600 mt-2 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="text-xs text-gray-400 mt-2">
          {article.author?.name && <span>{article.author.name}</span>}
          {article.publishedAt && (
            <span>
              {article.author?.name ? " · " : ""}
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
