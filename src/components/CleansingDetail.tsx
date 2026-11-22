"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Only what the box and the formula support. Fragrance is in the formula, so
 * nothing here says unscented; "mild / 저자극" stays out until the test
 * reports are published on the site.
 */
const SPECS = [
  { label: "Type", value: "Micellar Cleansing Water" },
  { label: "Key Ingredients", value: "Green Tea · Seawater · 4% Glycerin" },
  { label: "Finish", value: "Fresh · Moist" },
  // Check against the bottle's own printing before launch — the suncream's
  // volume line follows the tube, and this one should follow the bottle.
  { label: "Volume", value: "500 ml / 16.9 fl. oz." },
];

/* Fades the photograph's rectangle out on all four sides, as ProductDetail. */
const FEATHER =
  "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)";

/**
 * The cleansing water page's opener. It is ProductDetail's arrangement —
 * centred eyebrow, statement title and Korean line, the product as an object
 * on paper-alt, a narrow spec column against its foot ending in the one call
 * to action — so the page opens the way the suncream's product block does,
 * not with a second version of the home page's hero motion, which stays the
 * suncream's own.
 *
 * The bottle is narrow, so it sits on the centre line (the reference's own
 * arrangement) with the spec column in the track to its right; ProductDetail
 * had to shift its wide tube-and-swatches object left to balance, this does
 * not.
 *
 * The page's h1, and its first section: the top padding clears the fixed
 * 78px navbar before the usual section padding.
 */
export default function CleansingDetail() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-cw-head]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.1,
        },
      );
      gsap.fromTo(
        "[data-cw-img]",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-cw-img]", start: "top 90%" },
        },
      );
      gsap.fromTo(
        "[data-cw-row]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-cw-list]", start: "top 90%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="top" ref={sectionRef} className="bg-paper-alt">
      <div className="px-6 pb-20 pt-[calc(78px+4rem)] md:px-[80px] md:pb-28 md:pt-[calc(78px+7rem)]">
        <div data-cw-head className="text-center">
          <p className="eyebrow-tag">HISKIN — Micellar Cleansing Water</p>
        </div>
        <h1
          data-cw-head
          className="mx-auto mt-5 max-w-4xl text-center font-display type-statement font-semibold text-ink"
        >
          Everything off,
          <br />
          nothing taken away.
        </h1>
        <p
          data-cw-head
          className="mx-auto mt-7 max-w-2xl text-center type-statement-sub font-medium text-mute md:mt-9"
        >
          {/* Broken by hand on a phone, as ProductDetail's line is: left to
              wrap, "남깁니다" dropped onto a line of its own. */}
          하루의 흔적은 맑게 닦아내고,
          <br className="md:hidden" /> 피부의 촉촉함은 그대로 남깁니다
        </p>

        {/* cw-01 is the studio bottle with its lavender-grey backdrop moved
            onto this section's #f6f5f3 (neutral pixels only, scaled by the
            backdrop's own falloff, so the shadow came with it and the liquid
            and label kept their colour), then feathered like img-24. It is
            a 3:4 portrait, so the frame is too: 28vw keeps the bottle about
            the height the suncream's tube reads at. */}
        <div className="mt-16 md:mt-24 xl:grid xl:grid-cols-[minmax(0,1fr)_28vw_minmax(0,1fr)] xl:items-end">
          <div
            data-cw-img
            className="mx-auto w-full max-w-[420px] xl:col-start-2 xl:max-w-none"
          >
            <div
              style={{
                maskImage: FEATHER,
                WebkitMaskImage: FEATHER,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            >
              <PlaceholderImage
                name="cw-01"
                alt="HISKIN 미셀라 클렌징 워터 500ml 보틀"
                aspect="aspect-[3/4]"
                className="w-full"
                label="CW 01 · 3:4"
              />
            </div>
          </div>

          <div
            data-cw-list
            className="mx-auto mt-10 max-w-[420px] xl:col-start-3 xl:mb-12 xl:ml-4 xl:mt-0 xl:w-[250px] xl:max-w-none"
          >
            <dl>
              {SPECS.map((spec) => (
                <div
                  key={spec.label}
                  data-cw-row
                  className="border-b border-hairline py-3.5"
                >
                  <dt className="type-body-sm text-mute">{spec.label}</dt>
                  <dd className="mt-0.5 type-body-sm font-medium text-ink">
                    {spec.value.split(" · ").map((part, i, all) => (
                      <Fragment key={part}>
                        <span className="whitespace-nowrap">
                          {part}
                          {i < all.length - 1 && " ·"}
                        </span>
                        {i < all.length - 1 && " "}
                      </Fragment>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              data-cw-row
              href="#inquiry"
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-[4px] bg-ink px-6 py-3.5 type-body-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              파트너십 문의하기
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.8}
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
