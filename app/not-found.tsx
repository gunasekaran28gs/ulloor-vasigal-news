import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl font-extrabold text-brand-text">404</p>
      <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-muted">This story may have moved or been removed.</p>
      <Link href="/" className="mt-6 inline-block bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
        Back to home
      </Link>
    </div>
  );
}
