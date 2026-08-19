"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  {
    num: "01",
    hash: "uv-filter",
    tag: "UVA / UVB Dual Protection",
    title: "Advanced UV Filter & Titanium Dioxide",
    kr: "차세대 UV 필터와 티타늄디옥사이드가 UVA·UVB를 이중으로 차단합니다. 백탁 없이 가볍게 밀착되어 하루 종일 안정적인 차단막을 유지합니다.",
    en: "A next-generation UV filter paired with titanium dioxide blocks both UVA and UVB — a stable, weightless veil that lasts all day without white cast.",
    img: "img-04",
  },
  {
    num: "02",
    hash: "brightening",
    tag: "Glow Brightening & Antioxidant",
    title: "Glutathione & Niacinamide",
    kr: "글루타치온과 나이아신아마이드가 칙칙한 피부 톤을 환하게 밝히고, 강력한 항산화 작용으로 외부 자극으로부터 피부를 보호합니다.",
    en: "Glutathione and niacinamide brighten dull tone while delivering antioxidant defense against daily environmental stress.",
    img: "img-05",
  },
  {
    num: "03",
    hash: "elasticity",
    tag: "EGF · DNA · Acetyl Hexapeptide-8",
    title: "Soluble Collagen & Peptide Complex",
    kr: "가용성 콜라겐과 펩타이드 콤플렉스(EGF, DNA, 아세틸헥사펩타이드-8)가 피부 탄력을 높이고 주름 개선을 돕습니다.",
    en: "Soluble collagen and a peptide complex support elasticity and visible wrinkle improvement.",
    img: "img-06",
  },
  {
    num: "04",
    hash: "soothing",
    tag: "Tuber Magnatum & Herbal Soothing Barrier",
    title: "White Truffle & Botanical Extracts",
    kr: "화이트 트러플(투버 마그나텀)과 허브 추출물이 예민해진 피부를 진정시키고 건강한 보습 장벽을 형성합니다.",
    en: "White truffle and botanical extracts calm sensitized skin and build a healthy moisture barrier.",
    img: "img-07",
  },
];

/**
 * pef-style science accordion: full-width hairline rows
 * (title left, arrow right). The open item expands into a
 * two-column layout — numbered tag + title + copy on the left,
 * ingredient image on the right. Updates the URL hash on open.
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
      className="px-6 py-24 md:px-[80px] md:py-36"
    >
      <div className="mb-16 md:mb-24">
        <p data-sci-head className="eyebrow-tag mb-6">
          Advanced Skincare Science
        </p>
        <p
          data-sci-head
          className="max-w-xl text-[17px] font-medium leading-[1.35] tracking-[-0.02em] text-ink md:text-[19.5px]"
        >
          임상적으로 검증된 핵심 성분 조합.
          <br />
          HISKIN의 포뮬러는 네 가지 과학으로 완성됩니다.
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
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
              >
                <span className="font-display text-lg font-medium tracking-tight text-ink md:text-[22px]">
                  {item.title}
                </span>
                {isOpen ? (
                  <ArrowUp className="h-5 w-5 shrink-0 text-mute" strokeWidth={1.5} />
                ) : (
                  <ArrowDown className="h-5 w-5 shrink-0 text-mute" strokeWidth={1.5} />
                )}
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div
                    className={`grid gap-10 pb-12 pt-2 transition-opacity duration-500 md:grid-cols-2 md:gap-16 md:pb-16 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div>
                      <p className="eyebrow-tag mb-6">
                        {item.num}&ensp;·&ensp;{item.tag}
                      </p>
                      <h3 className="text-display-md font-display font-semibold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-ink">
                        {item.kr}
                      </p>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-mute">
                        {item.en}
                      </p>
                    </div>
                    <div className="md:pt-2">
                      <PlaceholderImage
                        name={item.img}
                        alt={`${item.title} — ingredient visual`}
                        aspect="aspect-[4/3]"
                        className="w-full"
                        label={`IMG ${item.img.slice(-2)} · 4:3`}
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
