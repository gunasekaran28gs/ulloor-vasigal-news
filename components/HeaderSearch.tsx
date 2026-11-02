"use client";

import { useState } from "react";

export default function HeaderSearch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Search"
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 items-center justify-center text-white hover:text-brand"
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      {open && (
        <form action="/search" role="search" className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-md">
          <div className="mx-auto flex max-w-[1200px] gap-2 px-4 py-3">
            <input
              name="q"
              type="search"
              autoFocus
              required
              maxLength={100}
              placeholder="Search news…"
              aria-label="Search news"
              className="min-w-0 flex-1 border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
            <button type="submit" className="bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
              Search
            </button>
          </div>
        </form>
      )}
    </>
  );
}
