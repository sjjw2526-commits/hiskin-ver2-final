"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * The brand's two products side by side, between the philosophy (which both
 * share) and the suncream's own detail. It is the one place on the site where
 * both accents show at once: each card's eyebrow takes its own product's
 * colour (.theme-cleanse on the second), and everything else — type, ink,
 * hairlines, the photo treatment — is the same, which is the point.
 *
 * Both photos are 4:3 objects on the paper-alt ground: img-24, and
 * cw-01-card, the bottle the cleansing page opens on, widened to match.
 */
const CARDS = [
  {
    num: "01",
    tag: "Protect",
    name: "Daily Suncream Protect",
    desc: "SPF 50+ PA++++, 파데 없이 완성하는 데일리 톤업 선크림",
    meta: "60 ml",
    href: "#product",
    img: "img-24",
    alt: "핑크 제형 위에 놓인 HISKIN 데일리 선크림 튜브",
    theme: "",
  },
  {
    num: "02",
    tag: "Cleanse",
    name: "Micellar Cleansing Water",
    desc: "녹차와 해수를 담아 하루의 흔적을 맑고 산뜻하게 닦아내는 클렌징 워터",
    meta: "500 ml",
    href: "/cleansing-water",
    // cw-01 widened to 4:3 on the matched ground, its sides faded so the
    // shadow tails off rather than stopping at the photo's edge.
    img: "cw-01-card",
    alt: "HISKIN 미셀라 클렌징 워터 500ml 보틀",
    theme: "theme-cleanse",
  },
];

export default function ProductLineup() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // fromTo, not from: a ScrollTrigger refresh mid-tween re-applies a
      // from-tween's start values and can strand an element at opacity 0.
      gsap.fromTo(
        "[data-lu-head]",
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
        "[data-lu-card]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-lu-cards]", start: "top 80%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="lineup"
      ref={sectionRef}
      className="px-6 py-16 md:px-[80px] md:py-36"
    >
      {/* Left-set head like every section but the product opener, with the
          Korean line against its foot on the right, as Manufacturing sets
          its own. */}
      <div className="md:grid md:grid-cols-12 md:items-end md:gap-x-6">
        <div className="md:col-span-7">
          <p data-lu-head className="eyebrow-tag mb-6">
            HISKIN Lineup
          </p>
          <h2 data-lu-head className="font-display type-h2 font-medium text-ink">
            Protect by Day.
            <br />
            Cleanse by Night.
          </h2>
        </div>
        <p
          data-lu-head
          className="mt-6 type-body text-mute md:col-span-4 md:col-start-9 md:mt-0"
        >
          아침의 보호부터 저녁의 클렌징까지
          <br />
          하루의 시작과 끝을 같은 기준으로 완성합니다
        </p>
      </div>

      <div
        data-lu-cards
        className="mt-12 grid gap-12 md:mt-20 md:grid-cols-2 md:gap-6"
      >
        {CARDS.map((c) => (
          <a
            key={c.num}
            href={c.href}
            data-lu-card
            className={`group block ${c.theme}`}
          >
            <div className="overflow-hidden bg-paper-alt">
              <PlaceholderImage
                name={c.img}
                alt={c.alt}
                aspect="aspect-[4/3]"
                className="w-full"
                imgClassName="transition duration-700 ease-out group-hover:scale-[1.04]"
                label={`${c.img.toUpperCase().replace("-", " ")} · 4:3`}
              />
            </div>

            <p className="eyebrow-tag mt-7">
              <span className="-order-1">{c.num}</span>
              {c.tag}
            </p>
            <h3 className="mt-4 font-display type-h3 font-semibold text-ink">
              {c.name}
            </h3>
            <p className="mt-2 type-sub text-mute">{c.desc}</p>

            <div className="mt-6 flex items-center justify-between border-t border-hairline pt-4 type-body-sm">
              <span className="text-mute">{c.meta}</span>
              <span className="flex items-center gap-2 font-medium text-ink">
                View Product
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.8}
                />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
