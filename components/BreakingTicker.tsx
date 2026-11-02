"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ROTATE_MS = 5000;

export default function BreakingTicker({ items }: { items: { id: string; slug: string; title: string }[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, items.length]);

  if (items.length === 0) return null;
  const current = items[index % items.length];
  const step = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <section
      aria-label="Breaking news"
      className="mb-6 flex items-center gap-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="flex shrink-0 items-center gap-1.5 bg-masthead px-3 py-1.5 text-xs font-semibold text-white">
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
          <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
        </svg>
        <span className="hidden sm:inline">Breaking News</span>
      </span>
      <Link
        key={current.id}
        href={`/article/${current.slug}`}
        className="min-w-0 flex-1 truncate text-sm font-semibold text-ink hover:text-brand-text"
      >
        {current.title}
      </Link>
      {items.length > 1 && (
        <div className="hidden shrink-0 gap-1 sm:flex">
          <button type="button" aria-label="Previous headline" onClick={() => step(-1)} className="h-7 w-7 border border-line text-muted hover:text-ink">
            ‹
          </button>
          <button type="button" aria-label="Next headline" onClick={() => step(1)} className="h-7 w-7 border border-line text-muted hover:text-ink">
            ›
          </button>
        </div>
      )}
    </section>
  );
}
