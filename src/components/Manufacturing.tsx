"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Editorial manufacturing section, compact form — approved by the owner on
 * 2026-09-13. A first draft crossed image and text left and right in four
 * rows and ran 3.3 screens on desktop, the longest section on a page that is
 * already ~20 screens long. This keeps the same content in about a screen and
 * a third: one band of three photographs at different sizes, then the four
 * beats side by side as a metadata row.
 *
 * Wording stays inside what the documents support. The certificate on file
 * is ISO 22716 (Cosmetics GMP), so "cGMP" is not used, and "자동화" is left
 * out until the line is confirmed.
 *
 * The photos are the site's facility shots with their white padding trimmed
 * (mfg-* from img-11/13/14), 1600px originals, to be replaced with
 * full-resolution photography from the GDM catalogue. The hand-wash station
 * shot (img-12) is not a production line and is not used; there is no QC
 * photograph, so 04 has none.
 */
const SHOTS = [
  {
    fig: "01",
    label: "R&D LAB",
    name: "mfg-rnd",
    alt: "연구실에서 시료를 다루는 연구원 두 명",
    aspect: "aspect-[3/2]",
    place: "col-span-2 md:col-span-6",
  },
  {
    fig: "02",
    label: "EMULSIFYING",
    name: "mfg-mixing",
    alt: "클린룸의 스테인리스 유화 교반기",
    aspect: "aspect-[3/4]",
    place: "col-span-1 md:col-span-3",
  },
  {
    fig: "03",
    label: "FILLING",
    name: "mfg-filling",
    alt: "충진 설비의 스테인리스 노즐 클로즈업",
    aspect: "aspect-square",
    place: "col-span-1 md:col-span-3",
  },
];

/* Lines are broken by hand. Left to wrap in a quarter-width column, the
   Korean fell apart at the last word ("포뮬러 / 연구·개발", "제조 / 공정"). */
const BEATS = [
  {
    num: "01",
    tag: "FORMULATION & R&D",
    lines: ["제품의 사용감과 안정성을 고려한", "포뮬러 연구·개발"],
    meta: "IN-HOUSE R&D",
  },
  {
    num: "02",
    tag: "MANUFACTURING",
    lines: ["체계적인 품질 관리 아래", "이어지는 제조 공정"],
    meta: "ISO 22716 · COSMETICS GMP",
  },
  {
    num: "03",
    tag: "PRODUCTION",
    lines: ["생산 설비를 기반으로", "일관된 품질의 제품 생산"],
    meta: "MIXING · FILLING · PACKING",
  },
  {
    num: "04",
    tag: "QUALITY CONTROL",
    lines: ["원료부터 완제품까지", "단계별 품질 관리"],
    meta: "RAW MATERIAL → FINISHED GOODS",
  },
];

const META = "type-caption font-semibold uppercase text-mute";
const META_TRACK = { letterSpacing: "0.08em" };

export default function Manufacturing() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // fromTo, not from: a ScrollTrigger refresh mid-tween re-applies a
      // from-tween's start values and can strand an element at opacity 0.
      const reveal = (targets: string, trigger: string, y: number) =>
        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger, start: "top 80%" },
          },
        );
      reveal("[data-mfg-head]", "#manufacturing", 30);
      reveal("[data-mfg-shot]", "[data-mfg-shots]", 40);
      reveal("[data-mfg-beat]", "[data-mfg-beats]", 24);
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="manufacturing"
      ref={sectionRef}
      className="px-6 py-20 md:px-[80px] md:py-36"
    >
      {/* Header: title left, the Korean line set against its foot on the
          right. */}
      <div className="md:grid md:grid-cols-12 md:items-end md:gap-x-6">
        <div className="md:col-span-7">
          <p data-mfg-head className="eyebrow-tag mb-6">
            Manufacturing &amp; R&amp;D
          </p>
          <h2
            data-mfg-head
            className="font-display type-h2 font-semibold text-ink"
            style={{ letterSpacing: "-0.005em", wordSpacing: "0.08em" }}
          >
            From Formula
            <br />
            to Finished Product.
          </h2>
        </div>
        <p
          data-mfg-head
          className="mt-6 type-body text-mute md:col-span-4 md:col-start-9 md:mt-0"
        >
          HISKIN은 GDM의 연구·개발 및 제조 기반에서
          <br />
          제품의 완성도를 만들어갑니다
        </p>
      </div>

      {/* One band, three sizes, feet aligned: wide lab, tall mixer, small
          square of the filler. A phone puts the lab across the top and the
          other two side by side under it. */}
      <div
        data-mfg-shots
        className="mt-12 grid grid-cols-2 items-end gap-3 md:mt-20 md:grid-cols-12 md:gap-6"
      >
        {SHOTS.map((s) => (
          <figure key={s.fig} data-mfg-shot className={s.place}>
            <PlaceholderImage
              name={s.name}
              alt={s.alt}
              aspect={s.aspect}
              className="w-full"
              /* A light desaturation pulls separately lit factory shots into
                 one tone. */
              imgClassName="[filter:grayscale(20%)_contrast(105%)]"
            />
            <figcaption className={`mt-3 ${META}`} style={META_TRACK}>
              {s.fig} — {s.label}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* The four beats as one row of metadata under a hairline. */}
      <div
        data-mfg-beats
        className="mt-12 grid gap-8 border-t border-hairline pt-10 sm:grid-cols-2 md:mt-16 md:grid-cols-4 md:gap-6 md:pt-12"
      >
        {BEATS.map((b) => (
          <div key={b.num} data-mfg-beat>
            <p className="eyebrow-tag">
              <span className="-order-1">{b.num}</span>
              {b.tag}
            </p>
            <p className="mt-4 type-body font-medium text-ink">
              {b.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </p>
            <p className={`mt-4 ${META}`} style={META_TRACK}>
              {b.meta}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
