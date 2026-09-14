"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Only what a buyer needs at a glance. Price, "free of" and anything clinical
 * were taken out of this section on the owner's brief (2026-09-13); they
 * belong to the Formula and Clinical sections. The product name moved up to
 * the eyebrow, so the list is four short rows and a button, as the reference
 * keeps its own.
 */
const SPECS = [
  { label: "Protection", value: "SPF 50+ · PA++++" },
  { label: "Finish", value: "Rosy Skin-Glow · Foundation-Free Finish" },
  { label: "Texture", value: "Lightweight · Hydrating" },
  // Matches the printing on the tube, which is what the buyer receives. The
  // exact conversion is 2.0288, but a spec sheet that disagrees with the
  // package reads as an error in the room.
  { label: "Volume", value: "60 ml / 2.02 fl. oz." },
];

/* Fades the photograph's rectangle out on all four sides. */
const FEATHER =
  "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent), linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)";

/**
 * Editorial product detail, after project-pef.com's serum section: eyebrow and
 * a large centred line of copy, open space, the product as an object on the
 * page's centre line, and a narrow spec column tucked against its lower right
 * that ends in the one call to action.
 *
 * The object is img-24: img-15 with its studio backdrop lifted from #f0ede8 to
 * this section's #f6f5f3. Only near-neutral pixels were brightened, weighted
 * by how close their chroma is to the backdrop's, so the shadows moved with
 * it and the pink swatches and blue cap kept their colour. The photo's edges
 * are then feathered away, so no frame shows.
 */
export default function ProductDetail() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // fromTo, not from: a ScrollTrigger refresh mid-tween re-applies a
      // from-tween's start values and can strand an element at opacity 0.
      gsap.fromTo(
        "[data-pd-head]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );
      gsap.fromTo(
        "[data-pd-img]",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-pd-img]", start: "top 80%" },
        },
      );
      gsap.fromTo(
        "[data-pd-row]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-pd-list]", start: "top 85%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="product" ref={sectionRef} className="bg-paper-alt">
      <div className="px-6 pb-20 pt-20 md:px-[80px] md:pb-28 md:pt-32">
        {/* Centred, like the hero it follows and like the reference site's
            product opener: eyebrow, a statement title one step above the
            section titles, then its Korean line. This is the one section
            besides the hero that opens centred; every other section head is
            left-set. */}
        <div data-pd-head className="text-center">
          <p className="eyebrow-tag">HISKIN — Daily Suncream Protect</p>
        </div>
        <h2
          data-pd-head
          className="mx-auto mt-5 max-w-4xl text-center font-display type-statement font-semibold text-ink"
        >
          {/* Phone breaks are placed by hand: left to wrap, each half dropped
              its last word ("beauty,", "glow.") onto a line of its own. */}
          Where protection
          <br className="md:hidden" /> meets beauty,
          <br />
          your skin finds
          <br className="md:hidden" /> its natural glow.
        </h2>
        <p
          data-pd-head
          className="mx-auto mt-7 max-w-2xl text-center type-statement-sub font-medium text-mute md:mt-9"
        >
          보호와 아름다움이 만나는 자리에서, 피부 본연의 광이 살아납니다
        </p>

        {/* xl+: the object and the spec column are centred as one group
            between two equal flexible tracks. With the object alone on the
            centre line (the reference's arrangement) the group's visual centre
            sat ~140px right of the headline's at 1440px — the reference's
            bottle is narrow, this tube-and-swatches object is ~480px wide — and
            the section read as leaning right. The spec column sits clear of
            the photo (a 16px gap after the frame; the frame's feathered margin
            adds the rest) and is dropped to the object's foot. The frame is
            820px: at 660 the swatches ended almost against the column and the
            owner asked for the object to reach further left. Below xl
            everything stacks: at 1024px there is no room for the column beside
            the object.
            w-full matters: as a grid item with auto margins the wrapper
            shrinks to its content, and the photo inside is sized by percentage,
            so without it the object collapsed to 0px wide. */}
        <div className="mt-16 md:mt-24 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,820px)_250px_minmax(0,1fr)] xl:items-end">
          <div
            data-pd-img
            className="mx-auto w-full max-w-[640px] xl:col-start-2 xl:max-w-none"
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
                name="img-24"
                alt="핑크 제형 위에 놓인 HISKIN 데일리 선크림 튜브"
                aspect="aspect-[4/3]"
                className="w-full"
                // The swatches fill only the middle ~65% of the frame, so the
                // object read small. At 1.12 their tips still end inside the
                // unfeathered 9–91% band.
                imgClassName="scale-[1.12]"
                label="IMG 24 · 4:3"
              />
            </div>
          </div>

          <div
            data-pd-list
            className="mx-auto mt-10 max-w-[420px] xl:col-start-3 xl:ml-4 xl:mb-12 xl:mt-0 xl:w-[250px] xl:max-w-none"
          >
            <dl>
              {SPECS.map((spec) => (
                <div
                  key={spec.label}
                  data-pd-row
                  className="border-b border-hairline py-3.5"
                >
                  <dt className="type-body-sm text-mute">{spec.label}</dt>
                  {/* Each "·" part is kept whole, so a narrow column breaks
                      between parts — never inside "Foundation-Free Finish". */}
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
              data-pd-row
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
