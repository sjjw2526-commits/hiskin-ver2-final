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
 * Panel 01's body was replaced by the owner on 2026-09-14 (see the item).
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
    // Rewritten by the owner on 2026-09-14, one running line per paragraph
    // (no hand breaks, like the reference's panels); the full stops are
    // theirs.
    body: [
      [
        "유기 자외선 차단 성분과 무기 자외선 차단 성분을 함께 설계해 서로 다른 방식으로 UVA와 UVB에 대응합니다.",
      ],
      [
        "하나의 필터 방식에 의존하지 않고, 두 가지 차단 메커니즘을 조합해 매일 사용하는 선케어의 보호력을 완성합니다.",
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
    tag: "What sets it apart",
    title: "Niacinamide + Glutathione",
    // Owner's copy, 2026-09-14, one line per entry as they broke it; the
    // full stops are theirs. The missing space in "않고,매일" was added.
    body: [
      ["단순히 피부를 밝아 보이게 하는 것만으로는 충분하지 않습니다."],
      [
        "칙칙한 피부 톤은 하나의 원인보다, 매일 반복되는 자외선 노출과 피부 컨디션의 영향을 함께 받습니다.",
      ],
      ["HISKIN은 나이아신아마이드와 글루타치온을 함께 구성해"],
      [
        "피부 톤을 맑고 균일하게 케어하고, 자외선 차단 이후의 피부 컨디션까지 함께 고려합니다.",
      ],
      [
        "일시적인 톤업에 그치지 않고, 매일의 선케어 안에서 보다 맑고 정돈된 피부 표현을 완성합니다.",
      ],
    ],
    img: "img-05",
    alt: "크림 표면에 맺힌 투명한 물방울",
  },
  {
    num: "03",
    hash: "moisture-elasticity",
    row: "Moisture & Elasticity",
    tag: "What it is",
    title: "Hydrolyzed Collagen + Adenosine",
    // Owner's copy, 2026-09-14, one line per entry as they broke it.
    body: [
      [
        "하이드롤라이즈드 콜라겐은 피부에 수분감을 더해 촉촉하고 유연한 컨디션을 유지하도록 돕습니다.",
      ],
      [
        "아데노신은 탄력과 주름 케어를 고려한 성분으로, 보습 중심의 케어에 탄력 관리까지 더합니다.",
      ],
      [
        "서로 다른 역할의 두 성분을 조합해 건조함으로 손상되기 쉬운 피부 컨디션을 보다 매끄럽고 탄탄하게 케어합니다.",
      ],
    ],
    img: "img-06",
    alt: "위아래로 길게 늘어난 투명한 젤 제형",
  },
  {
    num: "04",
    hash: "soothing-barrier",
    row: "Soothing & Barrier",
    tag: "Soothing & Barrier",
    title: "Panthenol + Allantoin",
    // Owner's copy, 2026-09-14, one line per entry as they broke it. The
    // missing space in "돕고,알란토인" was added.
    body: [
      [
        "매일 사용하는 선케어는 자외선을 막는 것만큼 피부가 편안한 상태를 유지하는 것도 중요합니다.",
      ],
      [
        "판테놀은 건조해지기 쉬운 피부의 보습과 장벽 케어를 돕고, 알란토인은 외부 자극으로 예민해진 피부를 편안하게 관리하는 데 도움을 줍니다.",
      ],
      [
        "HISKIN은 두 성분을 함께 구성해 자외선에 반복적으로 노출되는 피부까지 고려한 편안한 데일리 선케어 포뮬러를 완성합니다.",
      ],
    ],
    // img-25: a molecular ball-and-stick render with one rose-pink atom,
    // generated 2026-09-14 after the owner's reference. It replaced the
    // cream swatch (img-23), which repeated panel 01's photograph, and a
    // botanical was ruled out: neither panthenol nor allantoin is a plant,
    // so a leaf would read as an ingredient claim.
    img: "img-25",
    alt: "흰 구슬로 이어진 분자 구조 모형, 가운데 한 원자만 연분홍빛으로 빛남",
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
      {/* Set to the reference's science head (1920: eyebrow 16, title 60/600,
          Korean 18/500, three hand-broken lines) — the statement step, like
          the product opener, but left-set here. Copy is the owner's,
          2026-09-14; "FOUR," is capitalised on purpose, echoing the
          reference's "20nm," on its own line. */}
      <div className="mb-14 md:mb-28">
        <p data-sci-head className="eyebrow-tag mb-6">
          Advanced Suncare Formula
        </p>
        <h2
          data-sci-head
          className="font-display type-statement font-semibold text-ink"
        >
          FOUR,
          <br />
          Precisely Chosen for Better Skin.
        </h2>
        <p
          data-sci-head
          className="mt-7 max-w-3xl type-statement-sub font-medium text-mute md:mt-9"
        >
          자외선 차단, 브라이트닝, 보습·탄력, 진정·장벽까지
          <br className="max-md:hidden" /> 피부에 필요한 네 가지 기능을 균형
          있게 설계해
          <br className="max-md:hidden" /> 보호와 케어를 하나의 선케어 포뮬러로
          완성합니다
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
                    <span className="min-w-0 font-display type-row font-normal text-ink">
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
                        className={`mt-5 font-display type-h2 font-medium text-ink ${rise}`}
                        style={at(1)}
                      >
                        {item.title}
                      </h3>

                      {/* max-w-3xl, not xl: panel 01's paragraphs run as
                          single lines now and want the column's width. */}
                      <div className="mt-10 max-w-3xl type-body text-ink md:mt-16">
                        {item.body.map((para, p) => (
                          <p
                            key={para[0]}
                            // No gap between paragraphs: the sentences run
                            // on as consecutive lines, the reference's way
                            // (owner, 2026-09-14). The one break is before
                            // the ingredient list.
                            className={rise}
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

                      {/* Each group is one running line — "3 ORGANIC —
                          a · b · c" (owner, 2026-09-14) — instead of a
                          label over a stack of names. Every INCI name is
                          still kept whole: a wrap can only fall between
                          names, never inside one. */}
                      {item.groups && (
                        <dl
                          className={`mt-8 max-w-3xl ${rise}`}
                          style={at(2 + item.body.length)}
                        >
                          {item.groups.map((g) => (
                            <div
                              key={g.name}
                              className="mt-3 flex flex-wrap items-baseline gap-x-2 first:mt-0 type-body-sm text-ink"
                            >
                              <dt className="font-semibold tracking-[0.08em] text-mute">
                                {g.name}
                              </dt>
                              <dd>
                                <span className="text-mute">— </span>
                                {g.items.map((n, i) => (
                                  <span key={n}>
                                    <span className="whitespace-nowrap">{n}</span>
                                    {i < g.items.length - 1 && (
                                      <span className="text-mute"> · </span>
                                    )}
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
