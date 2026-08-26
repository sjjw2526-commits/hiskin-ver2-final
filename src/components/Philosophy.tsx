"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  "Independent & Glowing.",
  "The Neo-Modern Skin.",
  "Minimal steps, effortless freedom.",
];

/**
 * The initials spell HISKIN down the left edge, which is the whole point of
 * the list — so the letter column is a fixed width and the letters stay in a
 * straight vertical line no matter how long the label beside them runs.
 * Reordering these breaks the acrostic.
 */
const ROUTINE = [
  { letter: "H", label: "Hello Day", desc: "맑고 생기 넘치는 아침의 시작" },
  { letter: "I", label: "Independent", desc: "시간을 주도하는 미니멀 라이프" },
  { letter: "S", label: "Smart Choice", desc: "스킨케어와 베이스를 단 하나로 압축" },
  { letter: "K", label: "Keep Glowing", desc: "자외선 아래서도 지속되는 속광" },
  { letter: "I", label: "Instant Radiance", desc: "10초 만에 완성하는 파데 프리 톤업" },
  { letter: "N", label: "Neo-Modern", desc: "피부 해방감을 선사하는 정밀 포뮬러" },
];

/**
 * pef-style dark philosophy, split two-up: the headline holds the left column
 * and the HISKIN routine the right, so the block reads across a 16:9 screen
 * instead of leaving the right half empty. The copy block owns one whole
 * viewport (min-h-screen) — before, it fell short and the photograph below
 * bled into the bottom edge.
 *
 * The two-up only starts at xl. Below that the headline needs the full measure:
 * "Minimal steps, effortless freedom." is 33 characters and wraps as soon as
 * the column drops under roughly 600px.
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

      gsap.from("[data-phil-cta]", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-phil-cta]", start: "top 90%" },
      });

      gsap.from("[data-phil-aside]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-phil-aside]", start: "top 85%" },
      });

      gsap.from("[data-phil-row]", {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-phil-list]", start: "top 88%" },
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
      <div className="flex min-h-screen flex-col px-6 py-20 md:px-[80px] md:py-24">
        <p className="eyebrow-tag mb-12 md:mb-16">HISKIN Philosophy</p>

        <div className="grid flex-1 grid-cols-1 content-center items-center gap-16 xl:grid-cols-12 xl:gap-16">
          {/* Left — headline + CTA */}
          <div className="xl:col-span-7">
            {LINES.map((line, i) => (
              <p
                key={i}
                data-phil-line
                className="font-display type-h2 font-semibold text-white"
              >
                {line}
              </p>
            ))}

            <a
              data-phil-cta
              href="#inquiry"
              className="group mt-12 inline-flex w-fit items-center gap-3 border border-white/25 px-7 py-4 type-body-sm font-medium text-white transition-colors hover:bg-white hover:text-ink"
            >
              Become a Partner
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.8}
              />
            </a>
          </div>

          {/* Right — intro + HISKIN routine */}
          <div
            data-phil-aside
            className="flex flex-col xl:col-span-5 xl:pt-2"
          >
            <p className="type-body text-white/60">
              두껍게 덮는 메이크업 대신 본연의 가벼운 숨결을 선택합니다.
            </p>
            <p className="mt-3 type-body font-medium text-white">
              HISKIN이 제안하는 6가지 데일리 파데 프리 루틴
            </p>

            <ul data-phil-list className="mt-8">
              {ROUTINE.map((item, i) => (
                <li
                  key={i}
                  data-phil-row
                  className="flex gap-5 border-t border-white/12 py-4 last:border-b md:gap-6"
                >
                  <span className="w-[1.05em] shrink-0 font-display type-h3 font-bold text-rose">
                    {item.letter}
                  </span>
                  <span className="min-w-0">
                    <span className="block type-body font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block type-body-sm text-white/55">
                      {item.desc}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </div>

      {/* Full-bleed image with stat overlay */}
      <div data-phil-bleed className="relative h-[80vh] overflow-hidden md:h-screen">
        <div data-bleed-img className="absolute inset-0">
          <PlaceholderImage
            name="img-03"
            alt="강한 햇빛 아래 눈을 감고 은은하게 미소 짓는 여성의 얼굴"
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
          <p className="font-display type-stat font-semibold text-white">
            SPF 50+
          </p>
          <p className="mt-4 type-body-sm font-medium text-white">
            피부가 허락한, 가장 높은 차단.
          </p>
          <p className="mt-1 type-body-sm text-white/55">PA++++ · Every single day.</p>
        </div>
      </div>
    </section>
  );
}
