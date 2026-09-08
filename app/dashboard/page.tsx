import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPublish, canManageCategories } from "@/lib/permissions";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const articles = await prisma.article.findMany({
    where: canPublish(role) ? {} : { authorId: userId },
    include: { author: true, category: true },
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif-heading text-2xl font-black">
          {canPublish(role) ? "All Articles" : "My Articles"}
        </h1>
        <div className="flex gap-3">
          {canManageCategories(role) && (
            <Link
              href="/dashboard/categories"
              className="border border-gray-300 font-semibold text-sm px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Manage Categories
            </Link>
          )}
          <Link
            href="/dashboard/new"
            className="bg-red-700 hover:bg-red-800 text-white font-semibold text-sm px-4 py-2 rounded-md"
          >
            + New Article
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No articles yet. Create your first one.</p>
      ) : (
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="min-w-0">
                <Link href={`/dashboard/edit/${a.id}`} className="font-medium truncate hover:text-red-700 block">
                  {a.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.author.name} · {a.category?.name || "Uncategorized"} ·{" "}
                  {new Date(a.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-4 ${statusColor[a.status]}`}>
                {a.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
