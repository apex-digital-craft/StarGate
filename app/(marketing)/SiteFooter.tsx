import Link from "next/link";
import { WHATSAPP_URL } from "./whatsapp";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/demo", label: "Live demo" },
    ],
  },
  {
    title: "Owners",
    links: [
      { href: "/login", label: "Owner login" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white font-sans">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="text-sm font-bold tracking-widest text-zinc-900">
            STARGATE
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Review gating for local shops. Made in India.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-10 items-center rounded-full bg-[#1FA855] px-5 text-sm font-semibold text-white"
          >
            WhatsApp us
          </a>
        </div>
        {COLS.map((col) => (
          <nav key={col.title} aria-label={`Footer — ${col.title}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {col.title}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-600 hover:text-zinc-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
