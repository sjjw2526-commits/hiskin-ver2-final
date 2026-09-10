"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  "Better Ingredients,",
  "Higher Standards,",
  "More Thought in Every Detail.",
  "Made Without Compromise.",
];

/**
 * The initials spell HISKIN down the left edge, which is the whole point of
 * the list — so the letter column is a fixed width and the letters stay in a
 * straight vertical line no matter how long the label beside them runs.
 * Reordering these breaks the acrostic.
 */
const ROUTINE = [
  { letter: "H", label: "HIGH STANDARD", desc: "제품 하나에도 더 높은 기준을" },
  {
    letter: "I",
    label: "INGREDIENTS FIRST",
    desc: "좋은 제품의 시작은 좋은 원료에서",
  },
  {
    letter: "S",
    label: "SELECTED WITH CARE",
    desc: "직접 찾고 선택해온 원료의 기준",
  },
  { letter: "K", label: "KNOW-HOW", desc: "오랜 연구와 경험으로 쌓아온 노하우" },
  { letter: "I", label: "INTEGRITY", desc: "보이는 것보다 제품의 본질에 충실하게" },
  {
    letter: "N",
    label: "NO COMPROMISE",
    desc: "더 오래 걸리더라도 쉽게 타협하지 않는 것",
  },
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

      // fromTo, not from: a ScrollTrigger refresh re-applies a from-tween's
      // start values and can leave the element sitting at opacity 0 with no
      // second pass to finish it. That is how the enquiry link on the product
      // dossier went missing, and every reveal here carries the same risk.
      gsap.fromTo(
        "[data-phil-cta]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-phil-cta]", start: "top 90%" },
        },
      );

      gsap.fromTo(
        "[data-phil-aside]",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-phil-aside]", start: "top 85%" },
        },
      );

      // The initials spell HISKIN, so the list wants to be read down rather
      // than taken in at a glance. At the old 0.08 the six rows landed inside
      // half a second — measured, they arrived within a single frame sample —
      // which is a block appearing, not a word being spelled. 0.2 apart is
      // slow enough that each letter is its own arrival and the eye follows
      // H, I, S, K, I, N in turn, and still done inside a second and a half.
      gsap.fromTo(
        "[data-phil-row]",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: { trigger: "[data-phil-list]", start: "top 88%" },
        },
      );

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
      gsap.fromTo(
        "[data-phil-stat]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-phil-bleed]", start: "top 45%" },
        },
      );
    },
    { scope: sectionRef }
  );

  return (
    <section id="philosophy" ref={sectionRef} className="bg-ink text-white">
      <div className="flex min-h-svh flex-col px-6 py-16 md:px-[80px] md:py-24">
        <p className="eyebrow-tag mb-8 md:mb-16">HISKIN Philosophy</p>

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
            <p className="type-sub text-white/60">
              좋은 제품을 만드는 데에는 고집이 필요합니다.
            </p>
            <p className="mt-3 type-sub font-medium text-white">
              그 고집이 HISKIN의 기준이 됩니다.
            </p>

            <ul data-phil-list className="mt-10">
              {ROUTINE.map((item, i) => (
                <li
                  key={i}
                  data-phil-row
                  className="flex gap-5 border-t border-white/12 py-5 last:border-b md:gap-7 md:py-6"
                >
                  <span className="w-[1.05em] shrink-0 font-display type-h2 font-bold text-rose-soft">
                    {item.letter}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block type-h3 font-semibold text-white"
                      style={{ letterSpacing: "0.015em", wordSpacing: "0.08em" }}
                    >
                      {item.label}
                    </span>
                    <span className="mt-1.5 block type-sub text-white/55">
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
        {/* The caption sits on the right, over bokeh that is bright enough in
            places to swallow white type. This second wash darkens that side
            only, so the model's face keeps its light. */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/15 to-transparent md:via-black/10" />
        <div
          data-phil-stat
          /* Left-aligned inside a fixed column, not right-aligned against
              the frame. Ranged right, the three sizes each began at a
              different x and the block read as three unrelated fragments;
              sharing a left edge makes them one. The width also forces the
              headline onto two lines, which keeps it off the model's face —
              at full width it ran 703px and crossed her jaw. */
          className="absolute bottom-14 right-6 w-[min(430px,74vw)] text-left md:bottom-20 md:right-[60px]"
        >
          {/* type-h1, not the type-stat this block used to carry: that step
              runs to 120px, sized for a short figure like "SPF 50+", and
              would push eighteen characters clean off the frame. */}
          {/* Tracking is set inline because it has to be. The .type-* classes
              live outside Tailwind's utility layer, so an unlayered
              letter-spacing beats any tracking-* class silently — this line was
              running at type-h1's -0.02em, which is tuned for lower-case
              display type and glues capitals together: MADEFOR. Capitals want
              the opposite. */}
          <p
            className="font-display type-h1 font-semibold uppercase text-white"
            style={{ letterSpacing: "0.015em", wordSpacing: "0.14em" }}
          >
            Made For Every Day
          </p>
          <p className="mt-6 type-lead text-white/90 md:mt-7">
            매일 사용하는 선케어일수록
            <br />
            편안하고, 아름다워야 하니까
          </p>
          {/* The rating still has to appear here. This photograph is the only
              full-screen moment the page gives it, and a buyer checks that
              number before anything else — so the message leads and the spec
              sits underneath rather than disappearing entirely. */}
          {/* white/65 was too faint against the bright side of this frame —
              the one line on the page a buyer actually goes looking for
              should not be the hardest to read. */}
          <p className="mt-8 type-body-sm font-semibold tracking-[0.12em] text-white/85 md:mt-10">
            SPF 50+ · PA++++
          </p>
        </div>
      </div>
    </section>
  );
}
