"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ordered as the moment of use: the wipe, the freshness, the comfort, the
 * moist finish. Claims stay with what the box and the owner's brief support
 * (2026-11-23): titles are English names, bodies use Korean standard names,
 * as INGREDIENTS.md sets for the suncream. Nothing here says 저자극 / 순한 /
 * 무향 — fragrance is in the formula, and the test reports are not on the
 * site.
 */
const ITEMS = [
  {
    num: "01",
    tag: "Cleansing",
    title: "Micellar Technology",
    body: "메이크업과 피부 노폐물을 부드럽게 감싸 깔끔하게 닦아내는 미셀라 클렌징 기술. 클렌징 후에도 피부를 산뜻하고 촉촉하게 마무리합니다.",
    inci: "Coco-Glucoside · Polyglyceryl-4 Caprate",
    img: "cw-02",
    alt: "햇빛이 일렁이는 맑은 초록 물결 위의 HISKIN 미셀라 클렌징 워터",
  },
  {
    num: "02",
    tag: "Freshness",
    title: "Sea Water",
    body: "해수를 함유한 워터 포뮬러로, 피부에 닿는 순간 청량하고 깨끗한 사용감을 선사합니다.",
    img: "cw-03",
    alt: "흰 모래 해변으로 밀려드는 투명한 에메랄드빛 파도",
  },
  {
    num: "03",
    tag: "Comfort",
    title: "Green Tea Extract",
    body: "피부 진정에 도움을 주는 녹차추출물을 함유해 순하고 부드러운 클렌징을 선사하며, 세안 후에도 피부를 편안하게 가꾸어 줍니다.",
    img: "cw-04",
    alt: "투명한 물방울이 맺힌 초록 잎 클로즈업",
  },
  {
    num: "04",
    tag: "Moisture",
    title: "4% Glycerin",
    body: "4% 글리세린을 함유한 보습 포뮬러. 클렌징 후에도 촉촉하고 편안한 사용감을 남깁니다.",
    img: "cw-05",
    alt: "연둣빛 투명한 제형 위에 맺힌 거품과 기포",
  },
];

/**
 * The cleansing water's formula. The suncream's four ingredients each carry a
 * paragraph and an INCI list, which is why they fold into an accordion; these
 * are one sentence each, so all four are laid open in a row instead — the
 * same head (eyebrow, statement title, Korean line, left-set) and the same
 * numbered eyebrow on each item, with nothing to click.
 *
 * Four across from lg, two from sm, one on a phone.
 */
export default function CleansingFormula() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // fromTo, not from: a ScrollTrigger refresh mid-tween re-applies a
      // from-tween's start values and can strand an element at opacity 0.
      gsap.fromTo(
        "[data-cf-head]",
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
        "[data-cf-item]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-cf-grid]", start: "top 80%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="formula"
      ref={sectionRef}
      className="px-6 py-16 md:px-[80px] md:py-36"
    >
      <div className="mb-14 md:mb-24">
        <p data-cf-head className="eyebrow-tag mb-6">
          Micellar Cleansing Formula
        </p>
        <h2
          data-cf-head
          className="font-display type-statement font-semibold text-ink"
        >
          Four Essentials,
          <br />
          One Gentle Cleanse.
        </h2>
        {/* Owner's copy, 2026-11-24: a lead line, then a two-line
            paragraph, set apart as they wrote it. "순하게" is the owner's
            call — the skin test reports passed but are not on the site, so
            it rests on them if a buyer asks. */}
        <p
          data-cf-head
          className="mt-7 max-w-3xl type-statement-sub font-medium text-mute md:mt-9"
        >
          순하게 닦아내고, 촉촉하게 마무리하는 클렌징.
        </p>
        <p
          data-cf-head
          className="mt-4 max-w-3xl type-statement-sub font-medium text-mute"
        >
          녹차와 해수의 청량함부터 촉촉한 보습감까지,
          <br className="max-md:hidden" /> 피부의 편안함을 생각한 네 가지 클렌징
          솔루션.
        </p>
      </div>

      <div
        data-cf-grid
        className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
      >
        {ITEMS.map((item) => (
          <article key={item.num} data-cf-item className="group">
            <div className="overflow-hidden">
              <PlaceholderImage
                name={item.img}
                alt={item.alt}
                aspect="aspect-[4/5]"
                className="w-full"
                imgClassName="transition duration-700 ease-out group-hover:scale-[1.04]"
                label={`${item.img.toUpperCase().replace("-", " ")} · 4:5`}
              />
            </div>
            {/* "01 ■ CLEANSING", as the suncream's open panels set it. */}
            <p className="eyebrow-tag mt-7">
              <span className="-order-1">{item.num}</span>
              {item.tag}
            </p>
            <h3 className="mt-4 font-display type-h3 font-semibold text-ink">
              {item.title}
            </h3>
            <p className="mt-3 border-t border-hairline pt-4 type-body-sm text-ink">
              {item.body}
            </p>
            {item.inci && (
              <p className="mt-3 type-caption text-mute">{item.inci}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
