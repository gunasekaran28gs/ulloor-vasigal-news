import { prisma } from "@/lib/prisma";

// POST /api/articles/:id/view — count one reader view of a published article
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.article.updateMany({
    where: { id, status: "PUBLISHED" },
    data: { views: { increment: 1 } },
  });
  return new Response(null, { status: 204 });
}
