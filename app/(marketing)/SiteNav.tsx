"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Demo" },
  { href: "/contact", label: "Contact" },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-5 w-5 flex-col justify-center gap-1">
      <span
        className={`h-0.5 w-full rounded bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`}
      />
      <span
        className={`h-0.5 w-full rounded bg-current transition-opacity ${open ? "opacity-0" : ""}`}
      />
      <span
        className={`h-0.5 w-full rounded bg-current transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
      />
    </span>
  );
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 font-sans backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-3">
        <Link href="/" className="text-sm font-bold tracking-widest text-zinc-900">
          STARGATE
        </Link>
        {/* Desktop links */}
        <nav className="hidden flex-1 items-center gap-5 md:flex" aria-label="Site">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`text-sm font-medium hover:text-zinc-900 ${
                pathname === l.href ? "text-zinc-900" : "text-zinc-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/login"
            className="flex h-10 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Login
          </Link>
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-zinc-800 md:hidden"
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      {open ? (
        <nav
          className="border-t border-zinc-200 bg-white px-6 py-2 md:hidden"
          aria-label="Site mobile"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`flex h-12 items-center border-b border-zinc-100 text-base font-medium last:border-0 ${
                pathname === l.href ? "text-zinc-900" : "text-zinc-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
