"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const LINES = ["Less Steps.", "More Skin."];

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
      <div className="flex min-h-svh flex-col px-6 py-16 md:px-[80px] md:py-24">
        <p className="eyebrow-tag mb-8 md:mb-16">Our Philosophy</p>

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

          {/* Right — philosophy body */}
          <div
            data-phil-aside
            className="flex flex-col xl:col-span-5 xl:pt-2"
          >
            <p className="type-sub text-white/70">
              더 많이 가리는 대신, 더 자연스럽게 보여주는 것.
            </p>
            <p className="mt-6 type-body text-white/60">
              HISKIN은 피부 위에 무언가를 더하기보다 본연의 피부가 가진 맑음과
              생기를 살리는 방법을 고민합니다.
            </p>
            <p className="mt-4 type-body text-white/60">
              매일 손이 가는 텍스처, 자연스럽게 빛나는 피부 표현, 그리고 오래
              사용할 수 있는 기준.
            </p>
            <p className="mt-8 font-display type-h3 font-semibold text-white">
              Less, but better.
            </p>
          </div>
        </div>
      </div>

      {/* Full-bleed image with stat overlay */}
      <div data-phil-bleed className="relative h-[80svh] overflow-hidden md:h-screen">
        <div data-bleed-img className="absolute inset-0">
          <PlaceholderImage
            name="img-03"
            alt="황금빛 역광 아래 초록 보케를 배경으로 옆을 바라보는 여성의 옆얼굴"
            aspect=""
            className="h-full w-full"
            label="IMG 03 · 16:9"
            tone="dark"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div
          data-phil-stat
          className="absolute bottom-14 right-6 text-right md:bottom-20 md:right-[60px]"
        >
          <p className="font-display type-stat font-semibold text-white">
            SPF 50+
          </p>
          <p className="mt-4 type-body-sm font-medium text-white">
            매일 부담 없이, 편안한 자외선 차단.
          </p>
          <p className="mt-1 type-body-sm text-white/55">PA++++ · Every single day.</p>
        </div>
      </div>
    </section>
  );
}
