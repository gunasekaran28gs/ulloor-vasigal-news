"use client";

export default function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked; the theme still applies to this page.
    }
  }

  return (
    <button type="button" onClick={toggle} aria-label="Toggle dark mode" className="text-ink hover:text-brand-text">
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current dark:hidden">
        <path d="M21 14.5A9 9 0 0 1 9.5 3a9 9 0 1 0 11.5 11.5z" />
      </svg>
      <svg aria-hidden viewBox="0 0 24 24" className="hidden h-4 w-4 fill-current dark:block">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
