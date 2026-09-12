"use client";

import { useState, type FormEvent } from "react";

export type AdminMerchant = {
  id: string;
  slug: string;
  shop_name: string;
  freebie_title: string;
  google_review_url: string;
  freebie_url: string;
  telegram_chat_id: string;
  brand_color: string | null;
  logo_url: string | null;
  feedbackCount: number;
  clickCount: number;
  avgRating: number | null;
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
      {children}
    </span>
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
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function copyQrUrl(slugValue: string) {
    try {
      await navigator.clipboard.writeText(`${baseUrl}/s/${slugValue}`);
      setCopied(slugValue);
      setTimeout(() => setCopied((c) => (c === slugValue ? null : c)), 2000);
    } catch {
      setNotice("Copy failed — long-press the funnel link instead.");
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Stargate Admin</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {merchants.length} shop{merchants.length === 1 ? "" : "s"} live
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((s) => !s)}
            className="h-11 shrink-0 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {showCreate ? "Close" : "+ New shop"}
          </button>
        </div>

        {notice ? (
          <p role="status" className="mt-3 text-sm text-zinc-600">
            {notice}
          </p>
        ) : null}

        {showCreate ? (
          <CreateForm
            adminKey={adminKey}
            onCreated={(m) => {
              setMerchants((prev) => [m, ...prev]);
              setShowCreate(false);
            }}
          />
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          {merchants.map((m) => (
            <ShopRow
              key={m.id}
              merchant={m}
              adminKey={adminKey}
              copied={copied === m.slug}
              onCopy={() => copyQrUrl(m.slug)}
              onChanged={(patch) =>
                setMerchants((prev) =>
                  prev.map((p) => (p.id === m.id ? { ...p, ...patch } : p))
                )
              }
              onDeleted={() =>
                setMerchants((prev) => prev.filter((p) => p.id !== m.id))
              }
            />
          ))}
          {merchants.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No shops yet — hit “+ New shop” above.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function CreateForm({
  adminKey,
  onCreated,
}: {
  adminKey: string;
  onCreated: (m: AdminMerchant) => void;
}) {
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
      onCreated({
        id: data.merchant.id,
        slug: data.merchant.slug,
        shop_name: data.merchant.shop_name,
        freebie_title: freebieTitle,
        google_review_url: googleUrl,
        freebie_url: freebieUrl,
        telegram_chat_id: chatId,
        brand_color: brandColor || null,
        logo_url: null,
        feedbackCount: 0,
        clickCount: 0,
        avgRating: null,
        owner_email: null,
      });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't create merchant.");
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-900">New shop</h2>
      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-4 sm:grid-cols-2"
      >
        <Field label="Shop name">
          <input
            value={shopName}
            onChange={(e) => {
              setShopName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Cafe Aroma Kochi"
            required
            className={inputCls}
          />
        </Field>
        <Field label="Slug" hint="Auto-made, lowercase, unique.">
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
        <Field label="Freebie URL" hint="URL-only: Drive, menu PDF, coupon page.">
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
        <Field label="Telegram chat id" hint="Optional now — link later.">
          <input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="8765636565"
            inputMode="numeric"
            className={inputCls}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Brand color" hint="Optional #RRGGBB, used for buttons.">
            <input
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#F59E0B"
              className={inputCls}
            />
          </Field>
        </div>
        {message ? (
          <p role="alert" className="text-sm text-red-600 sm:col-span-2">
            {message}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className="h-14 w-full rounded-full bg-brand-600 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {status === "sending" ? "Creating…" : "Create shop"}
          </button>
        </div>
      </form>
    </section>
  );
}

type Panel = "edit" | "owner" | "danger" | null;

function ShopRow({
  merchant: m,
  adminKey,
  copied,
  onCopy,
  onChanged,
  onDeleted,
}: {
  merchant: AdminMerchant;
  adminKey: string;
  copied: boolean;
  onCopy: () => void;
  onChanged: (patch: Partial<AdminMerchant>) => void;
  onDeleted: () => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900">{m.shop_name}</p>
          <p className="truncate text-sm text-zinc-500">/s/{m.slug}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            m.owner_email ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {m.owner_email ?? "unassigned"}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip>{m.clickCount} taps</Chip>
        <Chip>{m.feedbackCount} feedbacks</Chip>
        <Chip>avg {m.avgRating !== null ? `${m.avgRating.toFixed(1)}★` : "—"}</Chip>
      </div>

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
          className="h-10 flex-1 rounded-full bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {copied ? "Copied!" : "Copy QR URL"}
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        {(["edit", "owner", "danger"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPanel((cur) => (cur === p ? null : p))}
            aria-expanded={panel === p}
            className={`h-9 flex-1 rounded-full text-sm font-semibold capitalize ${
              panel === p
                ? "bg-zinc-900 text-white"
                : p === "danger"
                  ? "border border-red-200 text-red-700"
                  : "border border-zinc-300 text-zinc-700"
            }`}
          >
            {p === "danger" ? "Delete" : p === "owner" ? "Owner" : "Edit"}
          </button>
        ))}
      </div>

      {panel === "edit" ? (
        <EditPanel
          merchant={m}
          adminKey={adminKey}
          onSaved={(patch) => {
            onChanged(patch);
            setPanel(null);
          }}
        />
      ) : null}
      {panel === "owner" ? (
        <OwnerPanel
          merchant={m}
          adminKey={adminKey}
          onChanged={(email) => {
            onChanged({ owner_email: email });
            setPanel(null);
          }}
        />
      ) : null}
      {panel === "danger" ? (
        <DangerPanel
          merchant={m}
          adminKey={adminKey}
          onDeleted={() => {
            onDeleted();
            setPanel(null);
          }}
        />
      ) : null}
    </article>
  );
}

function EditPanel({
  merchant: m,
  adminKey,
  onSaved,
}: {
  merchant: AdminMerchant;
  adminKey: string;
  onSaved: (patch: Partial<AdminMerchant>) => void;
}) {
  const [shopName, setShopName] = useState(m.shop_name);
  const [newSlug, setNewSlug] = useState(m.slug);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [googleUrl, setGoogleUrl] = useState(m.google_review_url);
  const [freebieUrl, setFreebieUrl] = useState(m.freebie_url);
  const [freebieTitle, setFreebieTitle] = useState(m.freebie_title);
  const [chatId, setChatId] = useState(m.telegram_chat_id);
  const [brandColor, setBrandColor] = useState(m.brand_color ?? "");
  const [logoUrl, setLogoUrl] = useState(m.logo_url ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [message, setMessage] = useState("");

  const slugChanged = slugify(newSlug) !== m.slug && newSlug.trim() !== "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/merchants/${m.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: adminKey,
          shop_name: shopName,
          new_slug: slugChanged ? newSlug : undefined,
          confirmSlug: slugChanged ? confirmSlug : undefined,
          google_review_url: googleUrl,
          freebie_url: freebieUrl,
          freebie_title: freebieTitle,
          telegram_chat_id: chatId,
          brand_color: brandColor || undefined,
          logo_url: logoUrl || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      onSaved({
        slug: data.merchant.slug,
        shop_name: data.merchant.shop_name,
      });
      setStatus("done");
      setMessage(`Saved. ${slugChanged ? "Slug changed — reprint QR/poster!" : ""}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Couldn't save.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-3 border-t border-zinc-100 pt-3 sm:grid-cols-2">
      <Field label="Shop name">
        <input value={shopName} onChange={(e) => setShopName(e.target.value)} required className={inputCls} />
      </Field>
      <Field label="Google review URL">
        <input value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)} required inputMode="url" placeholder="https://…" className={inputCls} />
      </Field>
      <Field label="Freebie URL">
        <input value={freebieUrl} onChange={(e) => setFreebieUrl(e.target.value)} required inputMode="url" placeholder="https://…" className={inputCls} />
      </Field>
      <Field label="Freebie title">
        <input value={freebieTitle} onChange={(e) => setFreebieTitle(e.target.value)} required className={inputCls} />
      </Field>
      <Field label="Telegram chat id">
        <input value={chatId} onChange={(e) => setChatId(e.target.value)} inputMode="numeric" placeholder="blank = unlinked" className={inputCls} />
      </Field>
      <Field label="Brand color" hint="#RRGGBB or empty.">
        <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="#F59E0B" className={inputCls} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Logo URL" hint="Direct image link or empty.">
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} inputMode="url" placeholder="https://…" className={inputCls} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Slug (danger: breaks printed QRs)"
          hint={`Current: /s/${m.slug}. Changing requires typing the new slug below.`}
        >
          <input
            value={newSlug}
            onChange={(e) => {
              setNewSlug(slugify(e.target.value));
              setConfirmSlug("");
            }}
            className={inputCls}
          />
        </Field>
      </div>
      {slugChanged ? (
        <div className="sm:col-span-2">
          <Field label={`Type "${slugify(newSlug)}" to confirm the rename`}>
            <input
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              placeholder={slugify(newSlug)}
              className={inputCls}
            />
          </Field>
        </div>
      ) : null}
      {message ? (
        <p role={status === "error" ? "alert" : "status"} className={`text-sm sm:col-span-2 ${status === "error" ? "text-red-600" : "text-green-700"}`}>
          {message}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "saving"}
          className="h-12 w-full rounded-full bg-brand-600 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function OwnerPanel({
  merchant: m,
  adminKey,
  onChanged,
}: {
  merchant: AdminMerchant;
  adminKey: string;
  onChanged: (email: string | null) => void;
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
      onChanged(data.owner ?? null);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update owner.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3">
      <p className="text-sm text-zinc-600">
        Current owner: <span className="font-semibold text-zinc-900">{m.owner_email ?? "unassigned"}</span>
      </p>
      <div className="mt-2 flex gap-2">
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
          className="h-10 shrink-0 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
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

function DangerPanel({
  merchant: m,
  adminKey,
  onDeleted,
}: {
  merchant: AdminMerchant;
  adminKey: string;
  onDeleted: () => void;
}) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  async function onDelete() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/merchants/${m.slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, confirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setResult(
        `Deleted ${m.slug} (+${data.deleted.feedbacks} feedbacks, +${data.deleted.clicks} clicks).`
      );
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">Danger zone</p>
      <p className="mt-1 text-sm text-zinc-600">
        Permanently deletes <span className="font-semibold">/s/{m.slug}</span> plus its{" "}
        {m.feedbackCount} feedbacks and {m.clickCount} clicks. No undo.
      </p>
      <label className="mt-3 block text-sm font-medium text-zinc-800">
        Type <code>{m.slug}</code> to confirm
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={m.slug}
          className="mt-1 w-full rounded-xl border border-red-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {result ? (
        <p role="status" className="mt-2 text-sm text-green-700">
          {result}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy || confirm !== m.slug}
        onClick={onDelete}
        className="mt-3 h-12 w-full rounded-full bg-red-600 text-base font-semibold text-white disabled:opacity-40"
      >
        {busy ? "Deleting…" : "Delete this shop"}
      </button>
    </div>
  );
}
