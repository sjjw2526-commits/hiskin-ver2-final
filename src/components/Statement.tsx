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
    title: "Weightless Rosy Glow",
    desc: "인위적인 백탁 대신 웜/쿨톤 모두에 맑은 혈색을 부여하는 독자적 연핑크 포뮬러. 모공 끼임 없이 얇게 밀착.",
  },
  {
    num: "02",
    title: "Clinically Proven UV Shield",
    desc: "SPF 69.0 / UVA-PF 23.33(PA++++) 수치로 증명된 빈틈없는 데일리 쉴드.",
  },
  {
    num: "03",
    title: "Deep Moisture & Anti-Aging",
    desc: "끈적임 없는 촉촉한 수분감과 고기능성 안티에이징 유효 성분을 그대로 담은 더마 포뮬러.",
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
              <h3 className="font-display text-xl font-semibold leading-tight tracking-tight md:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mute">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
