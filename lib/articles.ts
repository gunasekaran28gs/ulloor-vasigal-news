import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "./prisma";

export const articleCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ArticleSelect;

export type ArticleCardData = Prisma.ArticleGetPayload<{ select: typeof articleCardSelect }>;

export const PER_PAGE = 12;

export function getLatest(take: number, where: Prisma.ArticleWhereInput = {}) {
  return prisma.article.findMany({
    where: { ...where, status: "PUBLISHED" },
    select: articleCardSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getPaginated(where: Prisma.ArticleWhereInput, page: number) {
  const fullWhere: Prisma.ArticleWhereInput = { ...where, status: "PUBLISHED" };
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: fullWhere,
      select: articleCardSelect,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.article.count({ where: fullWhere }),
  ]);
  return { articles, total };
}

export const getMostViewed = cache((take: number) =>
  prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: articleCardSelect,
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take,
  })
);
