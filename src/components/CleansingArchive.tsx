"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const HOVER = "transition-transform duration-700 group-hover:scale-[1.03]";

/**
 * The cleansing water's archive, on the suncream's mosaic (ArchiveGallery):
 * one large frame left, two small portraits stacked top-right, one wide
 * beneath them, exact 12px gaps — set this way at the owner's request
 * (2026-11-24), replacing a staggered row of three.
 *
 * One change from the suncream's: the columns split 50/50, not 62/38. The
 * suncream's large frame comes out landscape, which suits its washing-line
 * shot; this product is a tall bottle, and at 50/50 the same arrangement
 * makes the large frame about 4:5, so the bottle is not cut at cap and base.
 *
 * Nothing here repeats the formula cards above it (cw-02 is the water cut),
 * and no third-party product appears — the owner's two "concept" references
 * are other brands' bottles and are not for the site.
 */
export default function CleansingArchive() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // fromTo, not from: a ScrollTrigger refresh mid-tween re-applies a
      // from-tween's start values and can strand an element at opacity 0.
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
        "[data-ca-item]",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-ca-grid]", start: "top 80%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="archive" ref={sectionRef} className="bg-paper-alt">
      <div className="px-6 py-16 md:px-[80px] md:py-36">
        <div className="mb-10 md:mb-20 md:grid md:grid-cols-12 md:items-end md:gap-x-6">
          <div className="md:col-span-7">
            <p data-ca-head className="eyebrow-tag mb-5">
              HISKIN Archive
            </p>
            <h2
              data-ca-head
              className="font-display type-h2 font-medium text-ink"
            >
              Naturally Fresh,
              <br />
              Simply Clean.
            </h2>
          </div>
          <p
            data-ca-head
            className="mt-6 type-body text-mute md:col-span-4 md:col-start-9 md:mt-0"
          >
            자연의 싱그러움으로 완성하는
            <br />
            깨끗하고 편안한 일상
          </p>
        </div>

        <div
          data-ca-grid
          className="grid grid-cols-1 gap-[12px] md:grid-cols-2"
        >
          {/* Large left: takes the right column's height on desktop. */}
          <div data-ca-item className="group overflow-hidden">
            <PlaceholderImage
              name="cw-06"
              alt="말차 케이크와 마카롱이 놓인 은쟁반 위의 HISKIN 미셀라 클렌징 워터"
              aspect="aspect-[4/5] md:aspect-auto md:h-full"
              className="h-full w-full"
              imgClassName={HOVER}
              label="CW 06 · 4:5"
            />
          </div>

          {/* Right column: two small + one wide */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div data-ca-item className="group overflow-hidden">
              <PlaceholderImage
                name="cw-08"
                alt="파도 거품이 밀려든 모래사장 위의 HISKIN 미셀라 클렌징 워터 패키지 박스"
                aspect="aspect-[3/4]"
                className="w-full"
                imgClassName={HOVER}
                label="CW 08 · 3:4"
              />
            </div>
            <div data-ca-item className="group overflow-hidden">
              <PlaceholderImage
                name="cw-09"
                alt="초록 체크무늬 접시 위 말차 과자와 함께 놓인 HISKIN 미셀라 클렌징 워터"
                aspect="aspect-[3/4]"
                className="w-full"
                imgClassName={HOVER}
                label="CW 09 · 3:4"
              />
            </div>
            <div data-ca-item className="group col-span-2 overflow-hidden">
              <PlaceholderImage
                name="cw-10"
                alt="초록 타일 욕실, 초록 수건과 체크무늬 수건 위에 놓인 HISKIN 미셀라 클렌징 워터"
                aspect="aspect-[16/9]"
                className="w-full"
                imgClassName={HOVER}
                label="CW 10 · WIDE"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
