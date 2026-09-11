"use client";

import { useState } from "react";
import type { Merchant } from "@/lib/supabase";
import FreebieUnlock from "./FreebieUnlock";

export default function GoogleReviewCTA({
  merchant,
  demo,
}: {
  merchant: Merchant;
  demo?: boolean;
}) {
  const [claimed, setClaimed] = useState(false);

  function onClaim() {
    // Demo mode: skip the ROI log. The Google page still opens for realism.
    if (!demo) {
      // Fire-and-forget ROI log; gift unlocks immediately, no verification in V1.
      fetch("/api/review-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: merchant.slug }),
      }).catch(() => {});
    }
    window.open(merchant.google_review_url, "_blank", "noopener");
    setClaimed(true);
  }

  if (claimed) {
    return (
      <FreebieUnlock
        title={merchant.freebie_title}
        url={merchant.freebie_url}
        accent={merchant.brand_color}
      />
    );
  }

  return (
    <div className="mt-6 w-full text-center">
      <p className="text-zinc-700">
        Glad you loved it! A public Google review helps us the most.
      </p>
      <button
        type="button"
        onClick={onClaim}
        style={merchant.brand_color ? { backgroundColor: merchant.brand_color } : undefined}
        className="mt-3 h-14 w-full rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white"
      >
        Leave a Google Review & claim gift
      </button>
    </div>
  );
}
