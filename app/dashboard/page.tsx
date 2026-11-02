import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPublish, canManageCategories } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const articles = await prisma.article.findMany({
    where: canPublish(role) ? {} : { authorId: userId },
    include: { author: { select: { name: true } }, category: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold text-ink">
          {canPublish(role) ? "All Articles" : "My Articles"}
        </h1>
        <div className="flex flex-wrap gap-3">
          {canManageCategories(role) && (
            <Link
              href="/dashboard/categories"
              className="border border-line font-semibold text-sm px-4 py-2 rounded-md hover:bg-soft"
            >
              Manage Categories
            </Link>
          )}
          <Link
            href="/dashboard/new"
            className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-4 py-2 rounded-md"
          >
            + New Article
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted text-center py-16">No articles yet. Create your first one.</p>
      ) : (
        <div className="divide-y divide-line border border-line rounded-lg overflow-hidden">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-soft">
              <div className="min-w-0">
                <Link href={`/dashboard/edit/${a.id}`} className="font-medium truncate hover:text-brand-text block">
                  {a.title}
                </Link>
                <p className="text-xs text-muted mt-0.5">
                  {a.author.name} · {a.category?.name || "Uncategorized"} ·{" "}
                  {formatDate(a.updatedAt)}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                {a.status === "PUBLISHED" && a.slug && (
                  <Link href={`/article/${a.slug}`} className="text-xs font-semibold text-muted hover:text-brand-text">
                    View
                  </Link>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor[a.status]}`}>
                  {a.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
