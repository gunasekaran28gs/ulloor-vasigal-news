"use client";

const ICONS = {
  facebook: "M14 9h3V5h-3c-2.8 0-5 2.2-5 5v2H6v4h3v6h4v-6h3l1-4h-4v-2c0-.6.4-1 1-1z",
  x: "M18.2 3h3.1l-6.8 7.8L22.5 21h-6.3l-4.9-6.4L5.7 21H2.6l7.3-8.3L2.2 3h6.4l4.4 5.9L18.2 3zm-1.1 16.2h1.7L7.7 4.7H5.9l11.2 14.5z",
  linkedin: "M5 3a2 2 0 110 4 2 2 0 010-4zM3.3 8.8h3.4V21H3.3zM9 8.8h3.2v1.7c.5-.9 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.4v-6c0-1.4 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V21H9z",
  whatsapp: "M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm5 12.4c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.8-.3-1.4-.6-2.5-1.1-4.1-3.6-4.2-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.3.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1z",
  pinterest: "M12 2a10 10 0 00-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.1.2-.3.1-1.3-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.7-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.5-2.2 6.3-5.3 6.3-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.9-.8 2-1.2 2.7A10 10 0 1012 2z",
};

export default function ShareButtons({ url, title, image }: { url: string; title: string; image?: string | null }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "Facebook", icon: ICONS.facebook, color: "#3b5998", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X", icon: ICONS.x, color: "#111111", href: `https://x.com/intent/tweet?url=${u}&text=${t}` },
    { name: "LinkedIn", icon: ICONS.linkedin, color: "#0a66c2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "WhatsApp", icon: ICONS.whatsapp, color: "#128c4b", href: `https://api.whatsapp.com/send?text=${t}%20${u}` },
    {
      name: "Pinterest",
      icon: ICONS.pinterest,
      color: "#bd081c",
      href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}${image ? `&media=${encodeURIComponent(image)}` : ""}`,
    },
  ];

  const buttonClass = "flex h-9 w-10 items-center justify-center rounded-sm text-white hover:opacity-85";

  return (
    <div className="flex items-center justify-between gap-2 print:hidden">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            style={{ backgroundColor: link.color }}
            className={buttonClass}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d={link.icon} />
            </svg>
          </a>
        ))}
      </div>
      <button type="button" onClick={() => window.print()} aria-label="Print this article" className={`${buttonClass} bg-neutral-600`}>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="h-4 w-4">
          <path d="M7 8V3h10v5M7 17H4v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7h-3M7 14h10v7H7z" />
        </svg>
      </button>
    </div>
  );
}
