import Link from "next/link";
import { PER_PAGE } from "@/lib/articles";

export default function Pagination({
  page,
  total,
  basePath,
  query,
}: {
  page: number;
  total: number;
  basePath: string;
  query?: Record<string, string>;
}) {
  const totalPages = Math.ceil(total / PER_PAGE);
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass = "border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand-text";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          ← Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
