import Link from "next/link";

type Tab = { label: string; href: string; active?: boolean };

export default function SectionHeading({
  title,
  tabs = [],
  as: Heading = "h2",
  className = "mb-6",
}: {
  title: string;
  tabs?: Tab[];
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line ${className}`}>
      <Heading className="relative -mb-px border-b-2 border-brand pb-2.5 text-xl font-bold text-ink">{title}</Heading>
      {tabs.length > 0 && (
        <nav aria-label={`${title} sections`} className="flex flex-wrap gap-x-4 gap-y-1 pb-2.5 text-xs font-semibold">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={tab.active ? "text-brand-text" : "text-ink hover:text-brand-text"}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
