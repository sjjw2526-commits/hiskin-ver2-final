"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { scrollToElement } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * The copy below is the owner's own text, set verbatim on 2026-09-13.
 *
 * It was checked against INGREDIENTS.md before it went in, and the conflicts
 * were put to the owner: "임상적으로 검증된" in the header, glutathione
 * sharing the brightening sentence, collagen sharing the wrinkle sentence,
 * and "민감 / 장벽 / 진정" in 04. The owner chose to keep every line as
 * written. Don't reword it quietly — raise any change with them first.
 */
type Item = {
  num: string;
  hash: string;
  /** The closed row's label. */
  row: string;
  /** Eyebrow of the open panel, after the number. */
  tag: string;
  title: string;
  /** Paragraphs, each a list of lines. */
  body: string[][];
  groups?: { name: string; items: string[] }[];
  img: string;
  alt: string;
};

const ITEMS: Item[] = [
  {
    num: "01",
    hash: "uv-filter",
    row: "Hybrid UV Filters",
    tag: "UV PROTECTION",
    title: "Hybrid UV Filters",
    body: [
      [
        "HISKIN은 세 가지 유기 자외선 차단 성분과",
        "두 가지 무기 자외선 차단 성분을 함께 사용합니다",
      ],
      [
        "서로 다른 특성의 다섯 가지 UV 필터를",
        "하나의 하이브리드 시스템으로 설계해",
        "UVA와 UVB를 함께 차단합니다",
      ],
    ],
    groups: [
      {
        name: "3 ORGANIC",
        items: [
          "Ethylhexyl Salicylate",
          "Diethylamino Hydroxybenzoyl Hexyl Benzoate",
          "Ethylhexyl Triazone",
        ],
      },
      { name: "2 MINERAL", items: ["Titanium Dioxide", "Zinc Oxide"] },
    ],
    img: "img-04",
    alt: "유리판 위에 펼쳐 바른 연분홍빛 선크림 제형",
  },
  {
    num: "02",
    hash: "brightening",
    row: "Brightening",
    tag: "BRIGHTENING",
    title: "Niacinamide + Glutathione",
    body: [
      [
        "피부 톤을 맑고 균일하게 케어하는",
        "나이아신아마이드에 글루타치온을 더했습니다",
      ],
      [
        "톤 케어와 항산화 케어를 함께 고려해",
        "칙칙해 보이는 피부에 생기를 더하고",
        "맑고 화사한 피부 컨디션을 완성합니다",
      ],
    ],
    img: "img-05",
    alt: "크림 표면에 맺힌 투명한 물방울",
  },
  {
    num: "03",
    hash: "moisture-elasticity",
    row: "Moisture & Elasticity",
    tag: "MOISTURE & ELASTICITY",
    title: "Hydrolyzed Collagen + Adenosine",
    body: [
      [
        "피부에 촉촉함과 유연함을 더하는",
        "하이드롤라이즈드 콜라겐에 아데노신을 더했습니다",
      ],
      [
        "수분을 채우는 것에서 그치지 않고",
        "주름과 탄력까지 함께 케어해",
        "매끄럽고 탄탄한 피부 컨디션을 완성합니다",
      ],
    ],
    img: "img-06",
    alt: "위아래로 길게 늘어난 투명한 젤 제형",
  },
  {
    num: "04",
    hash: "soothing-barrier",
    row: "Soothing & Barrier",
    tag: "SOOTHING & BARRIER",
    title: "Panthenol + Allantoin",
    body: [
      [
        "건조함으로 예민해지기 쉬운 피부를 고려해",
        "판테놀과 알란토인을 함께 담았습니다",
      ],
      [
        "보습과 피부 장벽 케어에 진정 케어를 더해",
        "민감해진 피부를 편안하게 유지하고",
        "건강한 피부 컨디션을 돕습니다",
      ],
    ],
    // img-22 (sage and thyme) left with this rewrite: neither plant is in
    // the formula, and a photograph of one reads as an ingredient claim.
    img: "img-23",
    alt: "부드럽게 펼쳐진 아이보리빛 크림 제형",
  },
];

/**
 * Science accordion, laid out after project-pef.com's science list.
 *
 * Every row starts closed: a label and a thin down arrow on a hairline. Opening
 * one folds its label away and the panel takes its place — number and tag,
 * the title, the two paragraphs, then the photograph to the right (below, on
 * a phone), each block lifting in a beat after the one before. The up arrow
 * in the panel's corner closes it. Opening a row writes its hash to the URL.
 */
export default function ScienceAccordion() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      // fromTo rather than from: a ScrollTrigger refresh part-way through a
      // stagger re-applies a from-tween's start values and can leave the last
      // row stranded at opacity 0.
      gsap.fromTo(
        "[data-sci-head]",
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
        "[data-sci-row]",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: "[data-sci-list]", start: "top 80%" },
        },
      );
    },
    { scope: sectionRef },
  );

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const alignTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (alignTimer.current) window.clearTimeout(alignTimer.current);
    },
    [],
  );

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    setOpen(next);
    if (alignTimer.current) window.clearTimeout(alignTimer.current);
    if (next === null) return;
    window.history.replaceState(null, "", `#${ITEMS[next].hash}`);
    // As the reference does: once the fold has settled, glide the opened row
    // up to just under the navbar, so a row opened near the foot of the screen
    // is not left cut off. The wait outlasts the 600ms fold because a row
    // above may be closing at the same moment, and until it has, the opened
    // row's position is still moving.
    alignTimer.current = window.setTimeout(() => {
      const row = rowRefs.current[next];
      if (row) scrollToElement(row, 0.9);
    }, 620);
  };

  const fold =
    "grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)]";

  return (
    <section
      id="science"
      ref={sectionRef}
      className="px-6 py-16 md:px-[80px] md:py-36"
    >
      <div className="mb-14 md:mb-28">
        <p data-sci-head className="eyebrow-tag mb-6">
          Advanced Skincare Science
        </p>
        <h2
          data-sci-head
          className="font-display type-h2 font-semibold text-ink"
        >
          임상적으로 검증된
          <br />
          핵심 성분 조합
        </h2>
        <p
          data-sci-head
          className="mt-6 type-body font-medium text-mute md:mt-9"
        >
          HISKIN의 포뮬러를 완성하는 네 가지 설계
        </p>
      </div>

      <div data-sci-list>
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          const panelId = `sci-panel-${item.hash}`;
          // Tailwind 4's translate utilities set `translate`, not
          // `transform`, so that is the property to transition.
          const rise = `transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`;
          const at = (step: number) => ({
            transitionDelay: isOpen ? `${160 + step * 80}ms` : "0ms",
          });

          return (
            <div
              key={item.num}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              data-sci-row
              className="border-b border-hairline first:border-t"
            >
              <div
                className={fold}
                style={{ gridTemplateRows: isOpen ? "0fr" : "1fr" }}
                inert={isOpen}
              >
                <div className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={false}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left md:py-[1.1rem]"
                  >
                    <span className="min-w-0 font-display type-lead font-normal text-ink">
                      {item.row}
                    </span>
                    <ArrowDown
                      className="h-5 w-5 shrink-0 text-mute"
                      strokeWidth={1.25}
                    />
                  </button>
                </div>
              </div>

              <div
                id={panelId}
                className={fold}
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                inert={!isOpen}
              >
                <div className="overflow-hidden">
                  <div className="relative grid gap-10 pb-12 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] md:gap-16 md:pb-16 md:pr-24 md:pt-11">
                    {/* Sits level with the eyebrow, as the reference's does. */}
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-expanded={true}
                      aria-controls={panelId}
                      aria-label={`${item.row} 닫기`}
                      className="absolute right-0 top-8 p-1 text-mute md:top-10"
                    >
                      <ArrowUp className="h-5 w-5" strokeWidth={1.25} />
                    </button>

                    <div>
                      {/* "01 ■ UV PROTECTION": the number is ordered ahead
                          of .eyebrow-tag's own square, which is a flex item
                          like the text either side of it. */}
                      <p className={`eyebrow-tag ${rise}`} style={at(0)}>
                        <span className="-order-1">{item.num}</span>
                        {item.tag}
                      </p>

                      <h3
                        className={`mt-5 font-display type-figure font-medium text-ink ${rise}`}
                        style={at(1)}
                      >
                        {item.title}
                      </h3>

                      <div className="mt-10 max-w-xl type-body text-ink md:mt-16">
                        {item.body.map((para, p) => (
                          <p
                            key={para[0]}
                            className={`mt-5 first:mt-0 ${rise}`}
                            style={at(2 + p)}
                          >
                            {para.map((line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            ))}
                          </p>
                        ))}
                      </div>

                      {item.groups && (
                        <dl
                          className={`mt-10 max-w-xl border-t border-hairline pt-7 ${rise}`}
                          style={at(2 + item.body.length)}
                        >
                          {item.groups.map((g) => (
                            <div key={g.name} className="mt-6 first:mt-0">
                              <dt className="type-caption font-semibold tracking-[0.16em] text-mute">
                                {g.name}
                              </dt>
                              {/* One name per line: a long INCI name has to
                                  be read as one piece. */}
                              <dd className="mt-2 type-body-sm text-ink">
                                {g.items.map((n) => (
                                  <span key={n} className="block">
                                    {n}
                                  </span>
                                ))}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>

                    <div className={rise} style={at(1)}>
                      <PlaceholderImage
                        name={item.img}
                        alt={item.alt}
                        aspect="aspect-[5/3]"
                        className="w-full"
                        label={`IMG ${item.img.slice(-2)} · 5:3`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
