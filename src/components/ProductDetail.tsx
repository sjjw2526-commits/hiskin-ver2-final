"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  { label: "MSRP", value: "$32.00 USD" },
  // Matches the printing on the tube, which is what the buyer receives. The
  // exact conversion is 2.0288, but a spec sheet that disagrees with the
  // package reads as an error in the room.
  { label: "Volume", value: "60ml / 2.02 fl.oz." },
  { label: "Protection", value: "SPF 50+ / PA++++ (Clinically Proven)" },
  { label: "Finish", value: "Rosy Skin-Glow · Foundation-Free Fit" },
  { label: "Texture", value: "Hydra-Light & Zero-Stickiness" },
  { label: "Free of", value: "Mineral Oil · Talc · Stone Powder" },
  { label: "Skin Type", value: "Dermatologist Tested · Safe for Sensitive Skin" },
];

/**
 * pef-style product detail: product image on the left,
 * hairline-divided spec list + CTA on the right.
 */
export default function ProductDetail() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-pd-img]", {
        opacity: 0,
        y: 60,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
      gsap.from("[data-pd-row]", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-pd-list]", start: "top 78%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="product"
      ref={sectionRef}
      className="bg-paper-alt"
    >
      <div className="grid items-center gap-14 px-6 py-24 md:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] md:gap-24 md:px-[80px] md:py-36">
        <div data-pd-img>
          <PlaceholderImage
            name="img-08"
            alt="HISKIN Daily Suncream Protect — product"
            aspect="aspect-[4/3]"
            className="w-full"
            label="IMG 08 · 4:3"
          />
        </div>

        <div data-pd-list>
          <p className="eyebrow-tag mb-8">Daily Suncream Protect</p>
          <div>
            {SPECS.map((spec) => (
              <div
                key={spec.label}
                data-pd-row
                className="border-b border-hairline py-5 first:border-t md:py-6"
              >
                <p className="text-[14px] text-mute md:text-[15px]">{spec.label}</p>
                <p className="mt-1.5 text-[17px] font-medium leading-snug text-ink md:text-[19px]">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
          <a
            data-pd-row
            href="#inquiry"
            className="group mt-10 flex w-full items-center justify-center gap-2 bg-ink px-8 py-4 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Submit B2B Inquiry
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.8}
            />
          </a>
        </div>
      </div>
    </section>
  );
}
