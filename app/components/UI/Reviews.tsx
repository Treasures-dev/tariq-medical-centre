"use client";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import BlurText from "@/components/BlurText";
import { ExternalLink, Star } from "lucide-react";

/**
 * Raw reviews you provided (kept fields as-is).
 * I named it `RAW_REVIEWS` to show direct mapping.
 */
const RAW_REVIEWS = [
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Rao hafeez",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT25WdlRHZFhNVGcxVmxWT09TMXJabVJPWjJnd01tYxAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOnVvTGdXMTg1VlVOOS1rZmROZ2gwMmc%7C0d8iajUW0uG%7C?hl=en",
    text: "Best services 100% recommended",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "aali butt",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2pWS2JsZEVlamN5V21WU2FGVktXSFpyTkV0bE1uYxAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOjVKbldEejcyWmVSaFVKWHZrNEtlMnc%7C0d8fH6WCuIn%7C?hl=en",
    text: "I was thoroughly impressed with the exceptional level of care I received. The warm welcome from the reception team and the dedication of the nursing staff were truly commendable. Everyone I interacted with demonstrated a remarkable commitment to providing outstanding service, exceeding my expectations.",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Danish Butt",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT21OUlFVdDNNalUzVjJWeGEwaDJjRko2TlZGSlExRRAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOmNRQUt3MjU3V2Vxa0h2cFJ6NVFJQ1E%7C0d8TT9qd10K%7C?hl=en",
    text: "I was so impressed with the level of care here. From the friendly reception to the attentive nurses, everyone went above and beyond.",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Laqate Ali",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT21sT2EwSm5XVXhDY25ObE1YbzBkMFJuUzNGbFlWRRAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOmlOa0JnWUxCcnNlMXo0d0RnS3FlYVE%7C0d8S8CmlPQd%7C?hl=en",
    text: "This hospital is nice doctor and nice staff This hospital is I m andar taritmint",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Muhammad_ishaq",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT25KWFIwdHJWbGRoVjIxaVQzZzRjek5wYm5VMWFFRRAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOnJXR0trVldhV21iT3g4czNpbnU1aEE%7C0d8Rs1qUH4-%7C?hl=en",
    text: "A nice and well coualifid doctors and staf speacily Dr. Tariq Diaz Sb.",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "mudassar hafiz",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2pGR2QzcDBhMkUxTmt4dGJVWkhlWGd5YjJaMFRWRRAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOjFGd3p0a2E1NkxtbUZHeXgyb2Z0TVE%7C0d8Raw69sdK%7C?hl=en",
    text: "The oldest & Best Hospital of Kallar Syedan. Qualified & Most Experienced Doctors & Staff.",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Raja Habib",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2xjeVdGSTVWSEJNZUdZM1IydDZWR3d3V1RNeFpGRRAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOlcyWFI5VHBMeGY3R2t6VGwwWTMxZFE%7C0d5JLDKr9Bq%7C?hl=en",
    text: "Peace be upon you, may the mercy and blessings of Allah be upon you.\nI have been in this hospital for eight years. The staff of this hospital, including the nurses and doctors, are all very ethical and behave very well. They work very properly.\nThey help everyone and behave well.The hospital is very clean and tidy.\nThe nurses and staff at this hospital are very good and help everyone wherever they need it and are very polite.",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Inzamam Ahmed",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2xWRVIycDRhbE5mYzFOdlMwcGlZVGd4Tkc5RVQwRRAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOlVER2p4alNfc1NvS0piYTgxNG9ET0E%7C0d4T06KZRAf%7C?hl=en",
    text: "Quality care",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Arooba Waheed",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2psVlRtZFJSRjluVGt4TmRVWkxNSGhCZUZCemFYYxAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOlVTmdRRF9nTkxNdUZLMHhBeFBzaXc%7C0d2Wkj7Mdb3%7C?hl=en",
    text: "Clean environment and professional staff",
  },
  {
    title: "Tariq Medical Centre, Kallar Syedan",
    url: "https://www.google.com/maps/search/?api=1&query=Tariq%20Medical%20Centre%2C%20Kallar%20Syedan&query_place_id=ChIJ9wZ7m8P_3zgRVbn7rOgrN98",
    stars: 5,
    name: "Chansar Ch ansar",
    reviewUrl:
      "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2xWTFdIWlljSFJJYnpGSk1FRmFYM0U0ZUVNNU5FRRAB!2m1!1s0x0:0xdf372be8acfbb955!3m1!1s2@1:CAIQACodChtycF9oOlVLWHZYcHRIbzFJMEFaX3E4eEM5NEE%7C0cpvz9WWoWD%7C?hl=en",
    text: "Everything was perfect",
  },
];

/**
 * Prepare display reviews for the UI marquee.
 * - use ui-avatars as fallback image generator
 * - if `text` is null, show a short fallback in the UI linking to the Google review URL
 */
const displayReviews = RAW_REVIEWS.map((r) => {
  const img = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    r.name
  )}&background=0d3966&color=fff&size=128`;
  const username = r.name.replace(/\s+/g, "").toLowerCase() || r.name;
  const body = r.text
    ? r.text
    : `Read the full review on Google: ${r.reviewUrl}`;

  return {
    img,
    name: r.name,
    username,
    body,
    stars: r.stars,
    reviewUrl: r.reviewUrl,
  };
});

const firstRow = displayReviews.slice(0, Math.ceil(displayReviews.length / 2));
const secondRow = displayReviews.slice(Math.ceil(displayReviews.length / 2));

/* ------------------- Updated ReviewCard: fixed size + clamped text ------------------ */
const ReviewCard = ({
  img,
  name,
  username,
  body,
  reviewUrl,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  reviewUrl?: string;
}) => {
  return (
    <figure
      className={cn(
        // fixed size: same width & height for all cards
        "h-44 w-64 flex flex-col justify-between cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/10 bg-gray-950/1 hover:bg-gray-950/5",
        // dark styles
        "dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/15"
      )}
    >
      {/* Top: avatar + name */}
      <div className="flex items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">@{username}</p>
        </div>
      </div>

      {/* Middle: clamped review text — use both tailwind + inline -webkit-line-clamp for wide support */}
      <blockquote
        className="mt-2 text-sm text-slate-700 dark:text-slate-200 overflow-hidden"
        style={
          {
            display: "-webkit-box",
            WebkitLineClamp: 4, // show up to 4 lines
            WebkitBoxOrient: "vertical",
          } as React.CSSProperties
        }
      >
        {body}
      </blockquote>

      {/* Bottom: optional link (kept visible) */}
      <div className="mt-2">
        {reviewUrl ? (
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0d3966] hover:underline flex items-center gap-1"
          >
            Read on Google <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}
      </div>
    </figure>
  );
};
/* ------------------------------------------------------------------------------- */

/* JSON-LD building and the rest of MarqueeDemo — unchanged except using the updated ReviewCard */
function buildStructuredData() {
  const reviewCount = RAW_REVIEWS.length;
  const total = RAW_REVIEWS.reduce((acc, r) => acc + (r.stars || 0), 0);
  const average =
    reviewCount > 0 ? Number((total / reviewCount).toFixed(1)) : 0;

  const sd: any = {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: "Tariq Medical Centre, Kallar Syedan",
    url: "https://example.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: average,
      reviewCount: reviewCount,
    },
    review: RAW_REVIEWS.map((r) => {
      const review: any = {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: r.name,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.stars,
        },
      };
      if (r.text) review.reviewBody = r.text;
      if (r.reviewUrl) review.url = r.reviewUrl;
      return review;
    }),
  };

  return sd;
}

export function MarqueeDemo() {
  const structuredData = useMemo(() => buildStructuredData(), []);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Heading Section (same as before) */}
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-sm font-semibold text-[#0d3a66]">
          “From consultation to recovery, we’re by your side.”
        </h3>
        <div className="flex justify-center">
          <BlurText
            text="Voices of Care and Trust."
            className="text-center text-2xl font-semibold tracking-tight text-[#000080]"
          />
        </div>
        <p className="mt-2 text-sm text-[#0d3a66]">
          Roles and responsibilities organized for efficiency and trust.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 w-full px-2">
          <a
            href="https://share.google/DENxLlfQIRuM4hgwG"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Star className="w-4 h-4" />
            Give us a review
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="https://share.google/DENxLlfQIRuM4hgwG"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Our Google Reviews
          </a>
        </div>
      </div>

      {/* Marquees */}
      <div className="relative flex w-full mt-10 flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.name + review.username} {...review} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:20s] mt-6">
          {secondRow.map((review) => (
            <ReviewCard key={review.name + review.username} {...review} />
          ))}
        </Marquee>

        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
      </div>
    </>
  );
}
