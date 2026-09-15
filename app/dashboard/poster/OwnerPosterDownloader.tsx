"use client";

import PosterDownloader from "@/app/admin/poster/[slug]/PosterDownloader";

export default function OwnerPosterDownloader({
  slug,
  shopName,
  pageUrl,
  qrDataUrl,
  secondary,
}: {
  slug: string;
  shopName: string;
  pageUrl: string;
  qrDataUrl: string;
  secondary?: boolean;
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
      label={secondary ? "Backup: plain version" : undefined}
      secondary={secondary}
    />
  );
}
