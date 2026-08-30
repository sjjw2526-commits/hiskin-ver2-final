"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  {
    num: "01",
    title: "cGMP / ISO 22716",
    desc: "국제 제조 품질 규격을 따르는 위생·품질 관리 공정",
  },
  {
    num: "02",
    title: "Proprietary R&D",
    desc: "포뮬러 안정화를 위한 자체 연구개발",
  },
  {
    num: "03",
    title: "High-Capacity Smart Line",
    desc: "대량 발주에도 일관된 품질을 위한 자동화 생산 시스템",
  },
  {
    num: "04",
    title: "Strict Dermatological QC",
    desc: "출고 전 로트별 품질 관리 및 피부 저자극 테스트",
  },
];

const SHOTS = [
  { img: "img-11", alt: "R&D lab research" },
  { img: "img-12", alt: "Automated production line" },
  { img: "img-13", alt: "Precision filling equipment" },
  { img: "img-14", alt: "Cleanroom emulsifying facility" },
];

/**
 * The last thing a buyer reads before the inquiry form: proof the factory
 * can actually deliver. Copy left, a 2x2 of real facility shots right.
 *
 * Tiles are 16:9 because the source photography is — cropping them to 4:3
 * would have cut a mixer out of one frame and a researcher out of another.
 */
export default function Manufacturing() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-mfg-head]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from("[data-mfg-spec]", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-mfg-specs]", start: "top 85%" },
      });
      gsap.from("[data-mfg-shot]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-mfg-grid]", start: "top 85%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="manufacturing"
      ref={sectionRef}
      className="px-6 py-16 md:px-[80px] md:py-36"
    >
      <div className="grid items-center gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-[60px]">
        {/* ── Copy ─────────────────────────────────────────── */}
        <div>
          <p data-mfg-head className="eyebrow-tag mb-6">
            Manufacturing &amp; R&amp;D
          </p>
          <h2
            data-mfg-head
            className="type-h2 font-display font-semibold text-ink"
          >
            Seven Years
            <br />
            in the Making.
          </h2>
          <p
            data-mfg-head
            className="mt-8 max-w-xl type-lead font-medium text-ink"
          >
            하나의 제품을 완성하기까지 7년. 좋은 원료를 담는 것을 넘어, 피부
            위에서의 사용감과 안정성, 자외선 차단 성능까지 오랜 시간 다듬었습니다.
          </p>
          <p data-mfg-head className="mt-4 max-w-xl type-body text-mute">
            그 결과를 실제 제품으로 구현하기 위해 국제 품질 규격에 부합하는 제조
            환경과 엄격한 품질 관리 과정을 거쳐 완성합니다.
          </p>

          <div
            data-mfg-specs
            className="mt-12 grid grid-cols-1 gap-x-8 gap-y-9 border-t border-hairline pt-10 sm:grid-cols-2"
          >
            {SPECS.map((spec) => (
              <div key={spec.num} data-mfg-spec>
                <p className="eyebrow-tag mb-3">{spec.num}</p>
                <h3 className="font-display type-body font-semibold text-ink">
                  {spec.title}
                </h3>
                <p className="mt-2 type-body-sm text-mute">
                  {spec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Facility shots ───────────────────────────────── */}
        {/* One column on a phone: at two-up the tiles fall to ~158px, too
            small to read equipment in. */}
        <div data-mfg-grid className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
          {SHOTS.map((shot) => (
            <div key={shot.img} data-mfg-shot>
              <PlaceholderImage
                name={shot.img}
                alt={shot.alt}
                aspect="aspect-[16/9]"
                className="w-full"
                /* A light desaturation pulls four separately-lit factory
                   shots into one tone. */
                imgClassName="[filter:grayscale(20%)_contrast(105%)]"
                label={`IMG ${shot.img.slice(-2)} · 16:9`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
