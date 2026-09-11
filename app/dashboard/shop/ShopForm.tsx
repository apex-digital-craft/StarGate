"use client";

import { useState, type FormEvent } from "react";

export type ShopSettings = {
  shop_name: string;
  google_review_url: string;
  freebie_url: string;
  freebie_title: string;
  brand_color: string;
  logo_url: string;
};

const inputCls =
  "mt-1 w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none";

export default function ShopForm({ initial }: { initial: ShopSettings }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  function set<K extends keyof ShopSettings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setStatus("idle");
      setMessage("Saved. Your funnel and poster update instantly.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't save.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
      <label className="block text-sm font-medium text-zinc-800">
        Shop name
        <input
          value={form.shop_name}
          onChange={(e) => set("shop_name", e.target.value)}
          required
          className={inputCls}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Google review URL
        <input
          value={form.google_review_url}
          onChange={(e) => set("google_review_url", e.target.value)}
          required
          inputMode="url"
          className={inputCls}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Freebie URL
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          URL-only: Drive link, menu PDF, coupon page.
        </span>
        <input
          value={form.freebie_url}
          onChange={(e) => set("freebie_url", e.target.value)}
          required
          inputMode="url"
          className={inputCls}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Freebie title
        <input
          value={form.freebie_title}
          onChange={(e) => set("freebie_title", e.target.value)}
          required
          className={inputCls}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Brand color
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          Optional #RRGGBB, used for funnel buttons.
        </span>
        <input
          value={form.brand_color}
          onChange={(e) => set("brand_color", e.target.value)}
          placeholder="#F59E0B"
          className={inputCls}
        />
      </label>
      <label className="block text-sm font-medium text-zinc-800">
        Logo URL
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          Optional image link, shown on your funnel page.
        </span>
        <input
          value={form.logo_url}
          onChange={(e) => set("logo_url", e.target.value)}
          placeholder="https://…"
          inputMode="url"
          className={inputCls}
        />
      </label>
      {message ? (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`text-sm ${status === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "saving"}
        className="h-14 w-full rounded-full bg-zinc-900 text-base font-semibold text-white disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
