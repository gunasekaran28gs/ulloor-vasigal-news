import Link from "next/link";
import { auth } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";
import { childrenOf, getCategories, topLevelByActivity } from "@/lib/categories";
import { formatToday } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import HeaderSearch from "./HeaderSearch";
import MobileNav, { type NavItem } from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

const VISIBLE_NAV_ITEMS = 7;

const navLinkClass =
  "flex h-14 items-center gap-1 whitespace-nowrap px-3 text-[13px] font-bold uppercase text-white hover:text-brand";

function Chevron() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Dropdown({ items }: { items: { name: string; href: string }[] }) {
  return (
    <div className="invisible absolute left-0 top-full z-50 min-w-52 bg-masthead py-2 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="block px-4 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white">
          {item.name}
        </Link>
      ))}
    </div>
  );
}

export default async function Header() {
  const [session, categories] = await Promise.all([auth(), getCategories()]);
  const role = session?.user?.role;

  const items: NavItem[] = topLevelByActivity(categories).map((c) => ({
    name: c.name,
    href: `/category/${c.slug}`,
    children: childrenOf(categories, c.id).map((child) => ({
      name: child.name,
      href: `/category/${child.slug}`,
    })),
  }));
  const visible = items.slice(0, VISIBLE_NAV_ITEMS);
  const overflow = items.slice(VISIBLE_NAV_ITEMS);

  return (
    <>
      <div className="bg-surface print:hidden">
        <div className="mx-auto flex h-8 max-w-[1200px] items-center justify-between gap-4 px-4 text-xs text-muted">
          <span className="truncate">{formatToday()}</span>
          <div className="flex shrink-0 items-center gap-4">
            {session?.user && canWrite(role) && (
              <Link href="/dashboard" className="font-semibold text-ink hover:text-brand-text">
                Dashboard
              </Link>
            )}
            <UserMenu user={session?.user} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-masthead print:static">
        <div className="relative mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <MobileNav items={items} />
            <Link href="/" className="shrink-0 skew-x-[-8deg] bg-brand px-3 py-1 text-base font-extrabold tracking-tight text-white md:text-xl">
              <span className="inline-block skew-x-[8deg]">{siteConfig.name}</span>
            </Link>
            <nav aria-label="Main" className="hidden lg:flex">
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
              {visible.map((item) => (
                <div key={item.href} className="group relative">
                  <Link href={item.href} className={navLinkClass}>
                    {item.name}
                    {item.children.length > 0 && <Chevron />}
                  </Link>
                  {item.children.length > 0 && <Dropdown items={item.children} />}
                </div>
              ))}
              {overflow.length > 0 && (
                <div className="group relative">
                  <button type="button" className={navLinkClass}>
                    More
                    <Chevron />
                  </button>
                  <Dropdown items={overflow.flatMap((item) => [{ name: item.name, href: item.href }, ...item.children])} />
                </div>
              )}
            </nav>
          </div>
          <HeaderSearch />
        </div>
      </header>
    </>
  );
}
