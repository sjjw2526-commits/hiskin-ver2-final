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
    body: "메이크업과 노폐물을 부드럽고 깔끔하게 닦아내는 미셀라 클렌징 기술로, 화장솜에 적셔 가볍게 닦아내는 것만으로 하루의 흔적을 정돈합니다.",
    inci: "Coco-Glucoside · Polyglyceryl-4 Caprate",
    img: "cw-02",
    alt: "투명한 물이 스며든 화장솜 클로즈업",
  },
  {
    num: "02",
    tag: "Freshness",
    title: "Sea Water",
    body: "해수를 함유한 워터 포뮬러로, 피부에 닿는 순간 청량하고 깨끗한 사용감을 선사합니다.",
    img: "cw-03",
    alt: "빛이 투과하는 맑은 물결의 표면",
  },
  {
    num: "03",
    tag: "Comfort",
    title: "Green Tea Extract",
    body: "녹차추출물을 더해 클렌징 후 피부를 산뜻하고 편안하게 마무리합니다.",
    img: "cw-04",
    alt: "맑은 물속에 잠긴 녹차 잎 한 장",
  },
  {
    num: "04",
    tag: "Moisture",
    title: "4% Glycerin",
    body: "4% 글리세린을 함유해 세안 후에도 당김 없이 촉촉한 사용감을 남깁니다.",
    img: "cw-05",
    alt: "유리 위에 맺힌 투명한 수분 방울",
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
          FOUR,
          <br />
          Quietly at Work in Every Drop.
        </h2>
        <p
          data-cf-head
          className="mt-7 max-w-3xl type-statement-sub font-medium text-mute md:mt-9"
        >
          닦아내는 힘, 청량함, 편안함, 촉촉한 마무리까지
          <br className="max-md:hidden" /> 네 가지 요소를 하나의 워터 포뮬러에
          담아
          <br className="max-md:hidden" /> 매일 부담 없이 사용하는 클렌징을
          완성합니다
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
