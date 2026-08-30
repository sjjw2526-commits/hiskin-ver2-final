"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * THE FORMULA — three plain-language pillars a buyer reads first (what the
 * product does on skin), then one collapsible row with the actual ingredient
 * detail underneath. The four rows share one accordion so the design stays
 * identical to the rest of the site.
 *
 * Legal guardrails baked into the ingredient row (see INGREDIENTS.md §4):
 *  - 미백 is attributed ONLY to niacinamide, 주름개선 ONLY to adenosine
 *    (the two MFDS-notified actives).
 *  - Glutathione and hydrolyzed collagen appear as "함유 + 실측치" only, with
 *    no efficacy claim — kept in separate lines so the two never merge.
 *  - No EGF / DNA / peptide / white truffle: none are in the ingredient list.
 */
type Pillar = {
  kind: "pillar";
  num: string;
  hash: string;
  tag: string;
  title: string;
  kr: string;
  en: string;
  img: string;
};

type IngredientRow = {
  kind: "ingredients";
  num: string;
  hash: string;
  title: string;
  note: string;
  list: { name: string; role: string }[];
};

const ITEMS: (Pillar | IngredientRow)[] = [
  {
    kind: "pillar",
    num: "01",
    hash: "uv-shield",
    tag: "UVA / UVB Broad-Spectrum",
    title: "Hybrid UV Shield",
    kr: "유기 3종·무기 2종을 함께 설계한 하이브리드 UV 시스템으로 UVA와 UVB를 폭넓게 차단합니다.",
    en: "A hybrid system of three organic and two mineral filters for broad UVA and UVB coverage.",
    img: "img-06",
  },
  {
    kind: "pillar",
    num: "02",
    hash: "texture",
    tag: "Even, Weightless Fit",
    title: "Micro-Dispersed Formula",
    kr: "피부에 균일하게 펴 발리고 자연스럽게 밀착되는 텍스처. 끈적임 없이 가볍게 마무리됩니다.",
    en: "An evenly dispersed, weightless texture that settles into skin without any tackiness.",
    img: "img-05",
  },
  {
    kind: "pillar",
    num: "03",
    hash: "finish",
    tag: "Foundation-Free Glow",
    title: "Natural Skin Finish",
    kr: "무겁고 두꺼운 베이스 메이크업 대신 자연스럽고 맑은 피부 표현. 칼라민의 옅은 분홍빛이 하얗게 뜨는 대신 은은한 톤으로 마무리됩니다.",
    en: "Not a heavy base — a clear, natural finish, softly toned by calamine's own pink rather than a white cast.",
    img: "img-04",
  },
  {
    kind: "ingredients",
    num: "04",
    hash: "ingredients",
    title: "Full Ingredient List",
    note: "미백 · 주름개선 · 자외선차단 — 3중 기능성 화장품 (식약처)",
    list: [
      { name: "Niacinamide", role: "미백 기능성 고시 성분 — 피부의 미백에 도움" },
      { name: "Adenosine", role: "주름개선 기능성 고시 성분 — 피부의 주름개선에 도움" },
      { name: "5-Filter Hybrid UV", role: "유기 3종 · 무기 2종 · 임계파장 377.6nm 광범위 차단" },
      { name: "Glutathione", role: "함유 · IRDOP(VILAS 997) 실측 1.75 mg/g" },
      { name: "Hydrolyzed Collagen", role: "함유 · 동일 시험소 실측 142.15 mg/100g" },
      { name: "Calamine", role: "피부 보호 · 제형의 옅은 분홍빛" },
      { name: "Panthenol · Allantoin", role: "피부 보호" },
    ],
  },
];

/**
 * pef-style science accordion: full-width hairline rows (title left, arrow
 * right). The open pillar expands into two columns — tag + copy on the left,
 * texture image on the right. The ingredient row expands full-width into a
 * plain definition list. Updates the URL hash on open.
 */
export default function ScienceAccordion() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGSAP(
    () => {
      gsap.from("[data-sci-head]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from("[data-sci-row]", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: "[data-sci-list]", start: "top 80%" },
      });
    },
    { scope: sectionRef }
  );

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    setOpen(next);
    if (next !== null && typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${ITEMS[next].hash}`);
    }
  };

  return (
    <section
      id="science"
      ref={sectionRef}
      className="px-6 py-16 md:px-[80px] md:py-36"
    >
      <div className="mb-16 md:mb-24">
        <p data-sci-head className="eyebrow-tag mb-6">
          The Formula
        </p>
        <h2
          data-sci-head
          className="max-w-2xl font-display type-h2 font-semibold text-ink"
        >
          Designed for skin,
          <br className="hidden md:block" /> not just protection.
        </h2>
        <p data-sci-head className="mt-6 max-w-xl type-body text-mute">
          피부 위에서 느껴지는 사용감과 자외선 차단을 함께 고려해 설계했습니다.
        </p>
      </div>

      <div data-sci-list>
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.num}
              data-sci-row
              className="border-b border-hairline first:border-t"
            >
              <h3>
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                >
                  <span className="font-display type-h3 font-medium text-ink">
                    {item.title}
                  </span>
                  {isOpen ? (
                    <ArrowUp className="h-5 w-5 shrink-0 text-mute" strokeWidth={1.5} />
                  ) : (
                    <ArrowDown className="h-5 w-5 shrink-0 text-mute" strokeWidth={1.5} />
                  )}
                </button>
              </h3>

              <div
                className="grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  {item.kind === "pillar" ? (
                    <div
                      className={`grid gap-10 pb-12 pt-2 transition-opacity duration-500 md:grid-cols-2 md:gap-16 md:pb-16 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div>
                        <p className="eyebrow-tag mb-8">
                          {item.num}&ensp;·&ensp;{item.tag}
                        </p>
                        <p className="max-w-xl type-body text-ink">{item.kr}</p>
                        <p className="mt-4 max-w-xl type-body-sm text-mute">
                          {item.en}
                        </p>
                      </div>
                      <div className="md:pt-2">
                        <PlaceholderImage
                          name={item.img}
                          alt={`${item.title} — texture visual`}
                          aspect="aspect-[4/3]"
                          className="w-full"
                          label={`IMG ${item.img.slice(-2)} · 4:3`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`pb-12 pt-2 transition-opacity duration-500 md:pb-16 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <p className="mb-8 eyebrow-tag">{item.note}</p>
                      <dl className="max-w-3xl">
                        {item.list.map((row) => (
                          <div
                            key={row.name}
                            className="flex flex-col gap-1 border-t border-hairline py-4 md:flex-row md:items-baseline md:gap-8"
                          >
                            <dt className="type-body font-medium text-ink md:w-64 md:shrink-0">
                              {row.name}
                            </dt>
                            <dd className="type-body-sm text-mute">{row.role}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-8 max-w-3xl type-caption text-mute">
                        글루타티온·하이드롤라이즈드콜라겐은 실측 함유 수치이며,
                        기능성(미백·주름개선)은 고시 성분에 한합니다. 전성분표
                        전문은 B2B 파트너에게 별도 제공됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
