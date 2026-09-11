"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  const activeHref =
    TABS.find((t) =>
      t.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(t.href)
    )?.label ?? "Menu";

  return (
    <div className="p-2">
      {/* Hamburger (mobile only) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close dashboard menu" : "Open dashboard menu"}
        className="flex h-10 w-full items-center justify-between rounded-full border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 md:hidden"
      >
        <span>{activeHref}</span>
        <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {/* Tabs: collapsible on mobile, inline from sm up */}
      <nav
        aria-label="Dashboard"
        className={`${open ? "flex" : "hidden"} flex-col gap-1 pt-2 md:flex md:flex-row md:gap-1 md:overflow-x-auto md:pt-0`}
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
              onClick={() => setOpen(false)}
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
    </div>
  );
}
