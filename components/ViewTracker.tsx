"use client";

import { useEffect, useRef } from "react";

// Counts a view from the reader's browser, so prefetches and server renders don't inflate the total.
export default function ViewTracker({ articleId }: { articleId: string }) {
  const counted = useRef<string | null>(null);

  useEffect(() => {
    if (counted.current === articleId) return;
    counted.current = articleId;
    fetch(`/api/articles/${articleId}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [articleId]);

  return null;
}
