"use client";

import PosterDownloader from "@/app/admin/poster/[slug]/PosterDownloader";

export default function OwnerPosterDownloader({
  slug,
  shopName,
  pageUrl,
  qrDataUrl,
}: {
  slug: string;
  shopName: string;
  pageUrl: string;
  qrDataUrl: string;
}) {
  function markDownloaded() {
    fetch("/api/shop/poster-touch", { method: "POST" }).catch(() => {});
  }

  return (
    <PosterDownloader
      slug={slug}
      shopName={shopName}
      pageUrl={pageUrl}
      qrDataUrl={qrDataUrl}
      onDownload={markDownloaded}
    />
  );
}
