import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWrite } from "@/lib/permissions";
import UserMenu from "./UserMenu";

export default async function Header() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 6,
  });

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-serif-heading text-2xl font-black tracking-tight">
            Ulloor Vasigal
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="hover:text-red-700 transition-colors">
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session?.user && canWrite(role) && (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded-md transition-colors"
              >
                Dashboard
              </Link>
            )}
            <UserMenu user={session?.user as any} />
          </div>
        </div>
      </div>
    </header>
  );
}
