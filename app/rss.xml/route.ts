import { getLatest } from "@/lib/articles";
import { siteConfig } from "@/lib/site";

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const articles = await getLatest(30);

  const items = articles
    .map((a) => {
      const link = `${siteConfig.url}/article/${encodeURIComponent(a.slug)}`;
      return `<item><title>${escapeXml(a.title)}</title><link>${link}</link><guid>${link}</guid>${
        a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ""
      }${a.publishedAt ? `<pubDate>${a.publishedAt.toUTCString()}</pubDate>` : ""}</item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteConfig.name)}</title><link>${siteConfig.url}</link><description>${escapeXml(siteConfig.description)}</description>${items}</channel></rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
