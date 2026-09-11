import Link from "next/link";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Demo" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 font-sans backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4">
        <Link href="/" className="text-sm font-bold tracking-widest text-zinc-900">
          STARGATE
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1" aria-label="Site">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="flex h-10 items-center rounded-full bg-brand-600 hover:bg-brand-700 px-5 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
