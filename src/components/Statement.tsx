"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reads as the caption to the photo directly above it, so the order is not
 * arbitrary: 01 is the bare shoulder, 02 the tube, 03 the pink texture.
 * Reordering these without reordering the trio in Hero.tsx breaks that.
 */
const USP = [
  {
    num: "01",
    title: "Rosy Glow Finish",
    desc: "연핑크 포뮬러가 피부에 자연스럽게 어우러져 맑고 생기 있는 피부 표현을 완성합니다.",
  },
  {
    num: "02",
    title: "Broad-Spectrum UV Protection",
    desc: "UVA와 UVB를 함께 고려한 하이브리드 UV 시스템으로 매일 편안하게 사용할 수 있는 자외선 차단을 설계했습니다.",
  },
  {
    num: "03",
    title: "Hydrating, Never Heavy",
    desc: "촉촉하게 밀착되면서도 끈적임은 덜어낸 가볍고 편안한 데일리 텍스처.",
  },
];

/**
 * The three claims, set on the same full-bleed three-column grid as the
 * trio of photographs that ends the hero sequence — same track widths, same
 * 12px gutters, no gap between the two. Each claim therefore lands directly
 * under the photograph that shows it, and the pair reads as one spread
 * rather than two stacked sections.
 *
 * The inset lives inside each cell instead of on the row, because padding on
 * the row would shift the tracks off the photographs above.
 */
export default function Statement() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-usp-item]", {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-usp-row]", start: "top 88%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-paper">
      <div
        data-usp-row
        className="grid w-full grid-cols-1 gap-12 pb-16 pt-8 md:grid-cols-3 md:gap-[12px] md:pb-32 md:pt-7"
      >
        {USP.map((item) => (
          <div key={item.num} data-usp-item className="px-6 md:px-8">
            <div className="border-t border-hairline pt-6 md:pt-7">
              <p className="eyebrow-tag mb-4">{item.num}</p>
              <h3 className="font-display type-h3 font-semibold">
                {item.title}
              </h3>
              <p className="mt-3 type-body text-mute">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
