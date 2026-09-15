"use client";

import { useState } from "react";

// Founder-only upload control for a designer-made poster (PDF/PNG/JPG ≤10MB).
// Lives on /admin/poster/[slug] so the upload happens in context, next to the
// plain auto-generated QR PDF (which stays as the backup download).
export default function PosterCustomUploader({
  slug,
  adminKey,
  initialUrl,
}: {
  slug: string;
  adminKey: string;
  initialUrl: string | null;
}) {
  const [customUrl, setCustomUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("key", adminKey);
      form.append("slug", slug);
      form.append("file", file);
      const res = await fetch("/api/admin/poster-upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setCustomUrl(data.poster_image_url ?? null);
      setMessage("Uploaded. Owners and this page now offer the custom design first.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/poster-upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey, slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setCustomUrl(null);
      setMessage("Removed. Only the plain QR PDF is offered now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 text-left">
      <p className="text-sm font-semibold text-zinc-900">
        Custom design: {customUrl ? "attached ✓" : "none yet"}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Upload your designed poster (PDF, PNG or JPG, ≤10MB). It becomes the
        primary download here and on the owner poster page; the plain QR PDF
        stays below as backup.
      </p>
      {customUrl ? (
        <a
          href={`/api/download/poster/${slug}`}
          download
          className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white"
        >
          Download custom design
        </a>
      ) : null}
      <div className="mt-2 flex gap-2">
        <label className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-full border border-zinc-300 text-sm font-semibold text-zinc-700">
          {busy ? "Working…" : "Upload design"}
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            disabled={busy}
            hidden
            onChange={(e) => {
              onUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {customUrl ? (
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="h-10 shrink-0 rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="mt-2 text-sm text-green-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
