"use client";

import { useEffect, useReducer, useRef } from "react";
import { ImageIcon } from "lucide-react";

type Props = {
  /** e.g. "img-01" → tries /images/img-01.jpg */
  name: string;
  alt: string;
  /** Tailwind aspect class applied to wrapper, e.g. "aspect-[3/4]" */
  aspect?: string;
  className?: string;
  imgClassName?: string;
  /** object-fit for the loaded image (default: cover) */
  fit?: "cover" | "contain";
  label?: string;
  /** placeholder tone */
  tone?: "light" | "dark";
};

/**
 * Renders /images/{name}.jpg if it exists; otherwise a styled placeholder
 * block that keeps the exact aspect ratio. Drop real files into /public/images
 * with the same name to replace automatically.
 */
export default function PlaceholderImage({
  name,
  alt,
  aspect = "aspect-[3/4]",
  className = "",
  imgClassName = "",
  fit = "cover",
  label,
  tone = "light",
}: Props) {
  // One failed request must not latch the placeholder on for good: a cold
  // CDN edge or a dropped mobile packet would then hide a file that exists,
  // for the rest of the visit. Retry twice with a short backoff and fall
  // back only once the file looks genuinely missing.
  //
  // The counter lives in a ref because the retry schedules a timer — doing
  // that inside a setState updater would fire twice under StrictMode.
  const RETRIES = 2;
  const tries = useRef(0);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const imgRef = useRef<HTMLImageElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const failed = tries.current > RETRIES;
  const src =
    tries.current === 0
      ? `/images/${name}.jpg`
      : // Cache-bust, or the browser replays the cached error.
        `/images/${name}.jpg?r=${tries.current}`;

  const miss = () => {
    if (timer.current || tries.current > RETRIES) return;
    const next = tries.current + 1;
    timer.current = setTimeout(() => {
      timer.current = null;
      tries.current = next;
      rerender();
    }, 400 * next);
  };

  // A new file name means a fresh start — the lightbox reuses this component
  // as it pages between documents.
  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (tries.current !== 0) {
      tries.current = 0;
      rerender();
    }
  }, [name]);

  // The error can fire before React hydrates, in which case onError never
  // runs — so re-check the settled load state on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) miss();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${aspect} ${className}`}
      aria-label={alt}
    >
      {!failed ? (
        <img
          ref={imgRef}
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          onError={miss}
          className={`absolute inset-0 h-full w-full ${
            fit === "contain" ? "object-contain" : "object-cover"
          } ${imgClassName}`}
        />
      ) : (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${
            tone === "dark"
              ? "bg-gradient-to-br from-[#2a2a2a] via-[#1c1c1c] to-[#101010] text-white/40"
              : "bg-gradient-to-br from-[#ececea] via-[#f2f2f0] to-[#dddddb] text-ink/30"
          }`}
        >
          <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
          <span className="eyebrow !tracking-[0.2em]">
            {label ?? name}
          </span>
        </div>
      )}
    </div>
  );
}
