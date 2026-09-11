"use client";

import { useState } from "react";
import type { Merchant } from "@/lib/supabase";
import FeedbackForm from "./FeedbackForm";
import GoogleReviewCTA from "./GoogleReviewCTA";

const STARS = [1, 2, 3, 4, 5];

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          done || active ? "bg-brand-600 text-white" : "bg-zinc-200 text-zinc-500"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={`text-xs font-semibold ${done || active ? "text-zinc-900" : "text-zinc-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

export default function RatingFlow({ merchant }: { merchant: Merchant }) {
  const [rating, setRating] = useState<number | null>(null);
  const rated = rating !== null;

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* Shop header band */}
      <div className="flex items-center gap-4 bg-brand-700 px-6 py-5">
        {merchant.logo_url ? (
          // Plain img: logo URLs are merchant-provided externals, no remotePatterns config in V1.
          <img
            src={merchant.logo_url}
            alt={`${merchant.shop_name} logo`}
            className="h-14 w-14 shrink-0 rounded-2xl bg-white object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white">
            {merchant.shop_name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-white">
            {merchant.shop_name}
          </h1>
          <p className="text-sm text-brand-100">
            Rate your visit, claim a gift
          </p>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Steps */}
        <div className="flex items-center justify-center gap-4">
          <StepDot active={!rated} done={rated} label="Rate" />
          <span className="h-px w-8 bg-zinc-200" aria-hidden="true" />
          <StepDot active={rated} done={false} label="Gift" />
        </div>

        {/* Star stage */}
        <div className="mt-5 rounded-2xl bg-brand-50 px-4 py-5 text-center">
          <p className="font-semibold text-zinc-900">How was your visit?</p>
          <div
            className="mt-2 flex items-center justify-center gap-1"
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
                  className={`min-h-14 min-w-12 p-1 text-5xl leading-none transition-transform active:scale-110 ${
                    selected ? "text-amber-400" : "text-zinc-300"
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {rated
              ? rating! <= 3
                ? "Tell the owner what went wrong — privately."
                : "You loved it! One tap left."
              : "Tap a star to continue."}
          </p>
        </div>

        {rated && rating! <= 3 ? (
          <FeedbackForm merchant={merchant} rating={rating!} />
        ) : null}
        {rated && rating! >= 4 ? (
          <GoogleReviewCTA merchant={merchant} />
        ) : null}
      </div>
    </div>
  );
}
