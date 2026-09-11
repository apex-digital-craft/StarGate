"use client";

import { useState, type FormEvent } from "react";

export type AdminMerchant = {
  id: string;
  slug: string;
  shop_name: string;
  freebie_title: string;
  feedbackCount: number;
  clickCount: number;
  owner_email: string | null;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const inputCls =
  "mt-1 w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-800">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export default function AdminClient({
  adminKey,
  baseUrl,
  initialMerchants,
}: {
  adminKey: string;
  baseUrl: string;
  initialMerchants: AdminMerchant[];
}) {
  const [merchants, setMerchants] = useState(initialMerchants);
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [googleUrl, setGoogleUrl] = useState("");
  const [freebieUrl, setFreebieUrl] = useState("");
  const [freebieTitle, setFreebieTitle] = useState("");
  const [chatId, setChatId] = useState("");
  const [brandColor, setBrandColor] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  function onNameChange(value: string) {
    setShopName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: adminKey,
          shop_name: shopName,
          slug: slug || undefined,
          google_review_url: googleUrl,
          freebie_url: freebieUrl,
          freebie_title: freebieTitle,
          telegram_chat_id: chatId,
          brand_color: brandColor || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setMerchants((prev) => [
        {
          id: data.merchant.id,
          slug: data.merchant.slug,
          shop_name: data.merchant.shop_name,
          freebie_title: freebieTitle,
          feedbackCount: 0,
          clickCount: 0,
          owner_email: null,
        },
        ...prev,
      ]);
      setShopName("");
      setSlug("");
      setSlugTouched(false);
      setGoogleUrl("");
      setFreebieUrl("");
      setFreebieTitle("");
      setChatId("");
      setBrandColor("");
      setStatus("idle");
      setMessage(`Created! Funnel: ${baseUrl}/s/${data.merchant.slug}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't create merchant.");
    }
  }

  async function copyQrUrl(slugValue: string) {
    try {
      await navigator.clipboard.writeText(`${baseUrl}/s/${slugValue}`);
      setCopied(slugValue);
      setTimeout(() => setCopied((c) => (c === slugValue ? null : c)), 2000);
    } catch {
      setMessage("Copy failed — long-press the funnel link instead.");
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-md px-6 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900">Stargate Admin</h1>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">New shop</h2>
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
            <Field label="Shop name">
              <input
                value={shopName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Cafe Aroma Kochi"
                required
                className={inputCls}
              />
            </Field>
            <Field label="Slug" hint="Auto-made from the name. Lowercase, unique.">
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="cafe-aroma-kochi"
                required
                className={inputCls}
              />
            </Field>
            <Field label="Google review URL">
              <input
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                placeholder="https://…"
                required
                inputMode="url"
                className={inputCls}
              />
            </Field>
            <Field label="Freebie URL" hint="V1 is URL-only: Drive link, menu PDF, coupon page.">
              <input
                value={freebieUrl}
                onChange={(e) => setFreebieUrl(e.target.value)}
                placeholder="https://…"
                required
                inputMode="url"
                className={inputCls}
              />
            </Field>
            <Field label="Freebie title">
              <input
                value={freebieTitle}
                onChange={(e) => setFreebieTitle(e.target.value)}
                placeholder="Free Chai"
                required
                className={inputCls}
              />
            </Field>
            <Field label="Telegram chat id" hint="Optional now — paste later via manual linking.">
              <input
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="8765636565"
                inputMode="numeric"
                className={inputCls}
              />
            </Field>
            <Field label="Brand color" hint="Optional #RRGGBB, used for buttons.">
              <input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#F59E0B"
                className={inputCls}
              />
            </Field>
            {message ? (
              <p role={status === "error" ? "alert" : "status"} className={`text-sm ${status === "error" ? "text-red-600" : "text-green-700"}`}>
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-14 w-full rounded-full bg-zinc-900 text-base font-semibold text-white disabled:opacity-60"
            >
              {status === "sending" ? "Creating…" : "Create shop"}
            </button>
          </form>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Shops ({merchants.length})
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {merchants.map((m) => (
              <ShopCard
                key={m.id}
                merchant={m}
                adminKey={adminKey}
                copied={copied === m.slug}
                onCopy={() => copyQrUrl(m.slug)}
                onOwnerChange={(email) =>
                  setMerchants((prev) =>
                    prev.map((p) =>
                      p.slug === m.slug ? { ...p, owner_email: email } : p
                    )
                  )
                }
              />
            ))}
            {merchants.length === 0 ? (
              <p className="text-sm text-zinc-500">No shops yet — create the first one above.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function ShopCard({
  merchant: m,
  adminKey,
  copied,
  onCopy,
  onOwnerChange,
}: {
  merchant: AdminMerchant;
  adminKey: string;
  copied: boolean;
  onCopy: () => void;
  onOwnerChange: (email: string | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function assign(unassign: boolean) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: adminKey,
          slug: m.slug,
          owner_email: unassign ? "" : email,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      onOwnerChange(data.owner ?? null);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update owner.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="font-semibold text-zinc-900">{m.shop_name}</p>
      <p className="text-sm text-zinc-500">
        /s/{m.slug} · {m.clickCount} review clicks · {m.feedbackCount} private feedbacks
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Owner: {m.owner_email ?? "unassigned"}
      </p>
      <div className="mt-3 flex gap-2">
        <a
          href={`/s/${m.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 flex-1 items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-800"
        >
          Funnel
        </a>
        <a
          href={`/admin/poster/${m.slug}?key=${encodeURIComponent(adminKey)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 flex-1 items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-800"
        >
          Poster
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="h-10 flex-1 rounded-full bg-zinc-900 text-sm font-semibold text-white"
        >
          {copied ? "Copied!" : "Copy QR URL"}
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@login.com"
          inputMode="email"
          className="h-10 min-w-0 flex-1 rounded-full border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
        />
        <button
          type="button"
          disabled={busy || !email.trim()}
          onClick={() => assign(false)}
          className="h-10 shrink-0 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          Assign
        </button>
        {m.owner_email ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => assign(true)}
            className="h-10 shrink-0 rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 disabled:opacity-60"
          >
            Unassign
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
