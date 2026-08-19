"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const USP = [
  {
    num: "01",
    title: "UV Protection",
    desc: "SPF 50+ / PA++++ 자외선 차단. UVA와 UVB를 동시에 케어하는 데일리 프로텍션.",
  },
  {
    num: "02",
    title: "Natural Tone-Up",
    desc: "자연스러운 2~3톤업으로 파운데이션을 대체하는 로즈베이지 컬러 보정.",
  },
  {
    num: "03",
    title: "Moist Finish",
    desc: "끈적임이나 뭉침 없이 산뜻하게 마무리되는 촉촉한 수분 제형.",
  },
];

/**
 * Three-column USP row. The statement headline and editorial images that
 * used to live here are now part of the pinned hero sequence.
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
        scrollTrigger: { trigger: "[data-usp-row]", start: "top 85%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-paper-alt">
      <div className="px-6 py-24 md:px-[80px] md:py-32">
        <div
          data-usp-row
          className="grid grid-cols-1 gap-10 border-t border-hairline pt-12 md:grid-cols-3 md:gap-8"
        >
          {USP.map((item) => (
            <div key={item.num} data-usp-item>
              <p className="eyebrow-tag mb-4">{item.num}</p>
              <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-mute">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
