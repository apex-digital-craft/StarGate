"use client";

import { useState } from "react";
import type { Merchant } from "@/lib/supabase";
import FeedbackForm from "./FeedbackForm";
import GoogleReviewCTA from "./GoogleReviewCTA";

const STARS = [1, 2, 3, 4, 5];

export default function RatingFlow({ merchant }: { merchant: Merchant }) {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col items-center">
      {merchant.logo_url ? (
        // Plain img: logo URLs are merchant-provided externals, no remotePatterns config in V1.
        <img
          src={merchant.logo_url}
          alt={`${merchant.shop_name} logo`}
          className="h-16 w-16 rounded-2xl object-cover"
        />
      ) : null}
      <h1 className="mt-3 text-center text-2xl font-semibold text-zinc-900">
        {merchant.shop_name}
      </h1>
      <p className="mt-1 text-center text-zinc-600">
        How was your visit? Tap a star to claim your gift.
      </p>

      <div
        className="mt-5 flex items-center justify-center gap-1"
        role="radiogroup"
        aria-label="Rate your visit from 1 to 5 stars"
      >
        {STARS.map((n) => {
          const selected = rating !== null && n <= rating;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className={`min-h-12 min-w-12 p-1 text-5xl leading-none transition-transform active:scale-110 ${
                selected ? "text-amber-400" : "text-zinc-300"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>

      {rating === null ? (
        <p className="mt-3 text-sm text-zinc-500">Tap a star above to continue.</p>
      ) : null}
      {rating !== null && rating <= 3 ? (
        <FeedbackForm merchant={merchant} rating={rating} />
      ) : null}
      {rating !== null && rating >= 4 ? (
        <GoogleReviewCTA merchant={merchant} />
      ) : null}
    </div>
  );
}
