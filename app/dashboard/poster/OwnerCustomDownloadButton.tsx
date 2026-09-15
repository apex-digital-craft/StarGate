"use client";

// Owner's primary poster button (custom design via the same-origin download
// proxy). Fires the same poster-touch as the plain button so the dashboard
// setup checklist checks off no matter which version is downloaded.
export default function OwnerCustomDownloadButton({ slug }: { slug: string }) {
  function markDownloaded() {
    fetch("/api/shop/poster-touch", { method: "POST" }).catch(() => {});
  }

  return (
    <a
      href={`/api/download/poster/${slug}`}
      download
      onClick={markDownloaded}
      className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white"
    >
      Download custom design
    </a>
  );
}
