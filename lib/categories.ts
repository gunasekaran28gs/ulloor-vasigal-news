import { cache } from "react";
import { prisma } from "./prisma";

export const getCategories = cache(() =>
  prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      parentId: true,
      _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { name: "asc" },
  })
);

export type CategoryNode = Awaited<ReturnType<typeof getCategories>>[number];

type TreeNode = { id: string; parentId: string | null };

// The category itself plus everything below it.
export function descendantIds(all: TreeNode[], id: string): string[] {
  const seen = new Set([id]);
  for (const current of seen) {
    for (const c of all) {
      if (c.parentId === current) seen.add(c.id);
    }
  }
  return [...seen];
}

export function childrenOf<T extends TreeNode>(all: T[], id: string): T[] {
  return all.filter((c) => c.parentId === id);
}

export function publishedCount(all: CategoryNode[], id: string): number {
  const ids = descendantIds(all, id);
  return all.filter((c) => ids.includes(c.id)).reduce((sum, c) => sum + c._count.articles, 0);
}

// Top-level categories with the busiest first, so the nav and homepage lead with real content.
export function topLevelByActivity(all: CategoryNode[]): CategoryNode[] {
  return all
    .filter((c) => !c.parentId)
    .map((c) => ({ c, count: publishedCount(all, c.id) }))
    .sort((a, b) => b.count - a.count || a.c.name.localeCompare(b.c.name))
    .map(({ c }) => c);
}

export function ancestorsOf(all: CategoryNode[], category: CategoryNode): CategoryNode[] {
  const chain: CategoryNode[] = [];
  const seen = new Set([category.id]);
  let parentId = category.parentId;
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = all.find((c) => c.id === parentId);
    if (!parent) break;
    chain.unshift(parent);
    parentId = parent.parentId;
  }
  return chain;
}
