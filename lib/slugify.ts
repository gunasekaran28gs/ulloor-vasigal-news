const MAX_SLUG_LENGTH = 80;

// Keeps letters and combining marks from every script. An ASCII-only filter
// turns Tamil headlines into empty slugs, because Tamil vowel signs are marks.
export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/g, "");
}

// Next.js can hand back non-ASCII route params percent-encoded.
export function decodeSlug(param: string): string {
  try {
    return decodeURIComponent(param).normalize("NFC");
  } catch {
    return param;
  }
}
