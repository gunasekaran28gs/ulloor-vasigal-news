import { siteConfig } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="/about" className="hover:text-gray-800">About</a>
          <a href="/contact" className="hover:text-gray-800">Contact</a>
          <a href="/sitemap.xml" className="hover:text-gray-800">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
