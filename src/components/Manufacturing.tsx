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
    desc: "글로벌 수출 규격을 완벽히 충족하는 위생 및 품질 관리 공정",
  },
  {
    num: "02",
    title: "Proprietary R&D",
    desc: "유효 성분의 파괴를 방지하는 독자적 포뮬레이션 안정화 기술",
  },
  {
    num: "03",
    title: "High-Capacity Smart Line",
    desc: "글로벌 대량 발주(Bulk Order)에도 일관된 품질을 보장하는 자동화 라인",
  },
  {
    num: "04",
    title: "Strict Dermatological QC",
    desc: "출고 전 전 로트(Lot) 정밀 분석 및 피부 저자극 안전성 테스트 완료",
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
      className="px-6 py-24 md:px-[80px] md:py-36"
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
            State-of-the-Art
            <br />
            Facility &amp; Global Standards.
          </h2>
          <p
            data-mfg-head
            className="mt-8 max-w-xl type-lead font-medium text-ink"
          >
            원료 배합부터 최종 완제품 충진까지, 엄격한 글로벌 품질 규격(cGMP /
            ISO)을 준수하는 첨단 자동화 스마트 팩토리에서 정밀 생산됩니다.
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
