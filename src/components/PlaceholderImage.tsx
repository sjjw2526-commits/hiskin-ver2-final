"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";

type Props = {
  /** e.g. "img-01" → tries /images/img-01.jpg */
  name: string;
  alt: string;
  /** Tailwind aspect class applied to wrapper, e.g. "aspect-[3/4]" */
  aspect?: string;
  className?: string;
  imgClassName?: string;
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
  label,
  tone = "light",
}: Props) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The 404 can fire before React hydrates (onError never runs),
  // so re-check the load state on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${aspect} ${className}`}
      aria-label={alt}
    >
      {!failed ? (
        <img
          ref={imgRef}
          src={`/images/${name}.jpg`}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
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
          <span className="eyebrow !tracking-[0.2em] text-[10px]">
            {label ?? name}
          </span>
        </div>
      )}
    </div>
  );
}
