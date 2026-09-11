"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/shop", label: "Shop" },
  { href: "/dashboard/analytics", label: "Trends" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Dashboard"
      className="flex gap-1 overflow-x-auto p-2"
    >
      {TABS.map((t) => {
        const active =
          t.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 shrink-0 items-center rounded-full px-5 text-sm font-semibold ${
              active
                ? "bg-brand-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
