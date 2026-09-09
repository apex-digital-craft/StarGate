"use client";

import { jsPDF } from "jspdf";

export default function PosterDownloader({
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
  function download() {
    // A4 portrait, mm units. High-contrast black on white for cheap printing.
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    const titleLines = doc.splitTextToSize(shopName, 170);
    doc.text(titleLines, 105, 45, { align: "center" });

    doc.addImage(qrDataUrl, "PNG", 30, 65, 150, 150);

    doc.setFontSize(24);
    doc.text("Scan & Get FREE Gift", 105, 235, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(pageUrl, 105, 250, { align: "center" });

    doc.save(`poster-${slug}.pdf`);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="mt-5 h-14 w-full rounded-full bg-zinc-900 text-base font-semibold text-white"
    >
      Download A4 PDF
    </button>
  );
}
