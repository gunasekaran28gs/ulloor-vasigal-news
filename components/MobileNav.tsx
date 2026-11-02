"use client";

import Link from "next/link";
import { useState } from "react";

export type NavItem = { name: string; href: string; children: { name: string; href: string }[] };

export default function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center text-white"
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav aria-label="Mobile" className="absolute inset-x-0 top-full max-h-[80vh] overflow-y-auto bg-masthead px-4 pb-4 shadow-lg">
          <Link href="/" onClick={close} className="block border-b border-white/10 py-3 text-sm font-bold uppercase text-white">
            Home
          </Link>
          {items.map((item) => (
            <div key={item.href} className="border-b border-white/10 py-3">
              <Link href={item.href} onClick={close} className="block text-sm font-bold uppercase text-white">
                {item.name}
              </Link>
              {item.children.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 pl-3">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} onClick={close} className="text-sm text-white/70">
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
