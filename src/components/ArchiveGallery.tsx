"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * pef-style archive: eyebrow tag + left headline, then an
 * asymmetric mosaic — one large image left, two small stacked
 * top-right, one wide bottom-right. Exact 12px gaps.
 */
export default function ArchiveGallery() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-arc-head]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from("[data-arc-item]", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-arc-grid]", start: "top 80%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="archive" ref={sectionRef} className="bg-paper-alt">
      <div className="px-6 py-24 md:px-[80px] md:py-36">
        <p data-arc-head className="eyebrow-tag mb-5">
          HISKIN Archive
        </p>
        <h2
          data-arc-head
          className="mb-14 font-display type-h2 font-semibold md:mb-20"
        >
          Clean by Standard, Every Detail.
        </h2>

        <div
          data-arc-grid
          className="grid grid-cols-1 gap-[12px] md:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]"
        >
          {/* Large left */}
          <div data-arc-item className="group overflow-hidden">
            <PlaceholderImage
              name="img-08"
              alt="Travertine stone product display"
              aspect="aspect-[16/10] md:aspect-auto md:h-full"
              className="h-full w-full"
              imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
              label="IMG 08 · WIDE"
            />
          </div>

          {/* Right column: two small + one wide */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div data-arc-item className="group overflow-hidden">
              <PlaceholderImage
                name="img-09"
                alt="Skin texture close-up"
                aspect="aspect-[3/4]"
                className="w-full"
                imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                label="IMG 09 · 3:4"
              />
            </div>
            <div data-arc-item className="group overflow-hidden">
              <PlaceholderImage
                name="img-10"
                alt="벚꽃잎에 둘러싸인 연분홍 제형 위에 HISKIN 글씨를 새긴 클로즈업"
                aspect="aspect-[3/4]"
                className="w-full"
                imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                label="IMG 10 · 3:4"
              />
            </div>
            <div data-arc-item className="group col-span-2 overflow-hidden">
              <PlaceholderImage
                name="img-02"
                alt="도시의 강한 직사광 아래 드러난 맨 어깨와 목선"
                aspect="aspect-[16/9]"
                className="w-full"
                imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                label="IMG 02 · WIDE"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
