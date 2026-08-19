"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  "Essential Care for Modern Life.",
  "복잡함은 줄이고,",
  "피부 본연의 건강함에 필요한",
  "5대 핵심 성분만 남겼습니다.",
];

/**
 * pef-style dark philosophy:
 * near-black background, left-aligned multi-line headline that sharpens
 * from dim to pure white on scroll, Korean paragraph + CTA on the right
 * below, then a full-bleed image with a large stat overlay.
 */
export default function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-phil-line]");
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: "top 80%",
              end: "top 50%",
              scrub: true,
            },
          }
        );
      });

      gsap.from("[data-phil-aside]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-phil-aside]", start: "top 85%" },
      });

      // Full-bleed image: slow zoom-out + stat reveal
      gsap.fromTo(
        "[data-phil-bleed] [data-bleed-img]",
        { scale: 1.15 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-phil-bleed]",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
      gsap.from("[data-phil-stat]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-phil-bleed]", start: "top 45%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section id="philosophy" ref={sectionRef} className="bg-ink text-white">
      <div className="px-6 py-24 md:px-[80px] md:py-36">
        <p className="eyebrow-tag mb-10">HISKIN Philosophy</p>

        <div className="max-w-5xl">
          {LINES.map((line, i) => (
            <p
              key={i}
              data-phil-line
              className="text-display-md font-display font-semibold text-white"
            >
              {line}
            </p>
          ))}
        </div>

        <div
          data-phil-aside
          className="mt-20 flex flex-col gap-8 md:ml-auto md:max-w-md md:items-start"
        >
          <p className="text-sm leading-relaxed text-white/60">
            HISKIN은 더하는 방식이 아닌 덜어내는 방식을 선택합니다. 자외선
            차단, 톤업, 보습 — 매일 필요한 것만 한 번에. 피부가 가진 본래의
            흐름 안에서 하루가 가볍게 시작됩니다.
          </p>
          <a
            href="#inquiry"
            className="group flex items-center gap-3 border border-white/25 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white hover:text-ink"
          >
            Become a Partner
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </a>
        </div>
      </div>

      {/* Full-bleed image with stat overlay */}
      <div data-phil-bleed className="relative h-[80vh] overflow-hidden md:h-screen">
        <div data-bleed-img className="absolute inset-0">
          <PlaceholderImage
            name="img-03"
            alt="HISKIN ambient visual"
            aspect=""
            className="h-full w-full"
            label="IMG 03 · 16:9"
            tone="dark"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div
          data-phil-stat
          className="absolute bottom-14 left-6 md:bottom-20 md:left-[60px]"
        >
          <p className="font-display text-[clamp(3.5rem,9vw,7.5rem)] font-semibold leading-none tracking-tight text-white">
            SPF 50+
          </p>
          <p className="mt-4 text-sm font-medium text-white">
            피부가 허락한, 가장 높은 차단.
          </p>
          <p className="mt-1 text-sm text-white/55">PA++++ · Every single day.</p>
        </div>
      </div>
    </section>
  );
}
