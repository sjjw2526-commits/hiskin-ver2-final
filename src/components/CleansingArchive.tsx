"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Three product cuts. `drift` is how far each column travels against the
 * scroll on desktop, in px: the middle one moves most, so the three slide
 * past each other as the section crosses the screen.
 */
const SHOTS = [
  {
    name: "cw-06",
    alt: "물방울 맺힌 녹차 잎 사이에 놓인 HISKIN 미셀라 클렌징 워터",
    drift: 40,
  },
  {
    name: "cw-07",
    alt: "햇빛이 일렁이는 맑은 초록 물결 위의 HISKIN 미셀라 클렌징 워터",
    drift: 110,
  },
  {
    name: "cw-08",
    alt: "숲속 젖은 나뭇가지 위에 선 HISKIN 미셀라 클렌징 워터",
    drift: 60,
  },
];

/**
 * The cleansing water's archive. Deliberately not the suncream's mosaic (one
 * large frame against a stacked pair and a wide): three equal portrait frames
 * in a row, the middle one set lower, each drifting at its own pace on
 * scroll. Equal frames suit a tall bottle, where the mosaic's wide crops
 * would cut it off. On a phone the three stack, unstaggered and still.
 */
export default function CleansingArchive() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-ca-head]",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );
      gsap.fromTo(
        "[data-ca-shot]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-ca-row]", start: "top 85%" },
        },
      );

      // Desktop only, and only where motion is welcome: on a phone the
      // frames stack, and drifting a full-width stack reads as jitter.
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils.toArray<HTMLElement>("[data-ca-shot]").forEach((el) => {
            const drift = Number(el.dataset.drift ?? 0);
            gsap.fromTo(
              el,
              { y: drift },
              {
                y: -drift,
                ease: "none",
                scrollTrigger: {
                  trigger: "[data-ca-row]",
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="archive"
      ref={sectionRef}
      className="overflow-hidden bg-paper-alt px-6 py-16 md:px-[80px] md:py-36"
    >
      <div className="md:grid md:grid-cols-12 md:items-end md:gap-x-6">
        <div className="md:col-span-7">
          <p data-ca-head className="eyebrow-tag mb-6">
            HISKIN Archive
          </p>
          <h2
            data-ca-head
            className="font-display type-h2 font-medium text-ink"
          >
            Clear by Nature,
            <br />
            Clean by Design.
          </h2>
        </div>
        <p
          data-ca-head
          className="mt-6 type-body text-mute md:col-span-4 md:col-start-9 md:mt-0"
        >
          맑은 물과 녹차에서 시작된
          <br />
          매일의 깨끗한 순간
        </p>
      </div>

      {/* The extra bottom margin on desktop leaves room for the lowered
          middle frame and the drift, so neither runs into the next section. */}
      <div
        data-ca-row
        className="mt-12 grid gap-3 md:mt-24 md:mb-24 md:grid-cols-3 md:gap-6"
      >
        {SHOTS.map((s, i) => (
          <div
            key={s.name}
            data-ca-shot
            data-drift={s.drift}
            className={`group overflow-hidden will-change-transform ${
              i === 1 ? "md:mt-[8vw]" : ""
            }`}
          >
            <PlaceholderImage
              name={s.name}
              alt={s.alt}
              aspect="aspect-[3/4]"
              className="w-full"
              imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
              label={`${s.name.toUpperCase().replace("-", " ")} · 3:4`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
