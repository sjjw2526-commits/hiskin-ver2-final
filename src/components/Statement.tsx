"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Consumes the --gs custom property the timeline below animates: 1 is fully
 * desaturated, 0 is the photograph's own colour. A variable rather than a
 * filter string, so the tween carries a plain number and there is no
 * declaration to re-parse every frame. Hero.tsx declares the same thing on
 * the flying tube, which drains with the rest of the trio.
 *
 * It sits on the picture rather than the whole card so the caption laid over
 * it keeps its own colour.
 */
const desaturate = {
  filter: "grayscale(var(--gs, 1))",
  willChange: "filter",
} as CSSProperties;

/**
 * The bed the caption sits on. All three photographs are pale — a face on
 * powder blue, a white tube in pink water, near-white cream — so type laid
 * straight onto them is unreadable in either colour. A dark scrim would fix
 * that and cost the whole point of the section: the bottom of every picture
 * would be dim whether or not its colour had come back. Whitening instead
 * keeps the section light, and ink type reads against it at any stage of the
 * transition.
 *
 * Never fully opaque, so the photograph still carries through underneath.
 */
const scrim = {
  background:
    "linear-gradient(to top," +
    " rgba(255,255,255,0.97) 0%," +
    " rgba(255,255,255,0.93) 32%," +
    " rgba(255,255,255,0.72) 56%," +
    " rgba(255,255,255,0.3) 78%," +
    " rgba(255,255,255,0) 100%)",
} as CSSProperties;

/**
 * Each claim is stated twice — the problem the category has, then the answer
 * this product gives. The two states occupy the same grid cell and cross-fade
 * in place, with no y offset on either: a few pixels of drift is exactly what
 * makes the swap read as two blocks sliding past each other rather than one
 * line of type being replaced.
 *
 * Order is not arbitrary: 01 is the face, 02 the tube, 03 the pink texture,
 * matching the photographs left to right.
 */
// The Korean lines break where the owner broke them ("\n"), on every screen.
const USP = [
  {
    num: "01",
    problem: {
      en: "HEAVY BASE",
      ko: "바쁜 아침, 무겁고 번거로운\n베이스 메이크업은 이제 그만",
    },
    solution: {
      en: "LIGHTER IN ONE STEP",
      ko: "선케어 하나로 가볍게\n핑크빛 톤업과 자연스러운 베이스까지",
    },
  },
  {
    num: "02",
    problem: {
      en: "PARTIAL UV COVERAGE",
      ko: "기미·잡티·노화를 부르는\nUVA와 UVB, 둘 다 막아야 하니까",
    },
    solution: {
      en: "FULL UV COVERAGE",
      ko: "유기 3종 + 무기 2종의 UV 필터로\nUVA·UVB를 빈틈없이 차단",
    },
  },
  {
    num: "03",
    problem: {
      en: "HEAVY & STICKY",
      ko: "머리카락 달라붙는 끈적임\n바를 때마다 불편한 눈시림",
    },
    solution: {
      en: "LIGHT & COMFORTABLE",
      ko: "끈적임 없이 산뜻하게\n매일 부담 없이 편안하게",
    },
  },
];

/**
 * The claim laid over the foot of one photograph.
 *
 * Declared here rather than inside Statement: a component defined during
 * render is a different type on every render, so React tears the subtree down
 * and rebuilds it, and the nodes GSAP is animating are replaced underneath it.
 */
function Caption({ item }: { item: (typeof USP)[number] }) {
  return (
    // pointer-events-none so the hover that scales the picture underneath is
    // not broken by the block sitting on top of it.
    <div className="pointer-events-none absolute inset-x-0 bottom-0 pt-24 md:pt-28">
      <div className="absolute inset-0" style={scrim} />

      {/* Both states share one grid cell: they start at the same top edge, so
        the headline swaps without shifting, and the box is as tall as the
        taller of the two, so the scrim never changes height.

        They are set in different greys on purpose, and the answer lands in
        full ink as the colour comes back into the photograph behind it.

        Colour alone was not enough. Swapping one line of type for another at
        the same size, in the same place, is the least noticeable change a
        page can make — nothing moves, so the eye has nothing to catch, and
        readers watched the whole handover without registering that the words
        had changed at all. So the two states now roll: the problem leaves
        upward and the answer rises into the space it left, both stopping at
        the identical resting position. Motion is what makes it read as an
        event rather than as a slow dissolve.

        overflow-hidden is the window they roll through, and it is why this
        cannot drift out of alignment the way an earlier offset-based attempt
        did: outside the window there is nothing to see, and inside it there
        is only ever one resting position. The padding sits on the wrapper,
        not on the window, so the clip hugs the type.

        Phone is the exception. There the next card already rises into
        place, and a caption rolling up inside a card that has just risen
        stacked two upward movements on every turn. So on a phone the problem
        fades out and the answer surfaces a few pixels in its place, with
        the English line in rose: the change from grey to rose is what
        catches the eye there, in place of the roll. The Korean line stays
        in ink, as rose at that size is too faint on the white scrim. */}
      <div className="relative px-6 pb-6 md:px-7 md:pb-7">
        <div className="grid overflow-hidden">
          <div data-usp-problem className="[grid-area:1/1]">
            <h3 className="font-display type-h3 font-semibold text-mute">
              {item.problem.en}
            </h3>
            <p className="mt-2.5 whitespace-pre-line type-sub text-ink/50">
              {item.problem.ko}
            </p>
          </div>

          <div data-usp-solution className="[grid-area:1/1]">
            <h3 className="font-display type-h3 font-semibold text-ink max-md:text-rose">
              {item.solution.en}
            </h3>
            <p className="mt-2.5 whitespace-pre-line type-sub text-ink">
              {item.solution.ko}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The problem → solution spread: three photographs filling the screen with
 * their claims laid over the foot of each one.
 *
 * The captions used to sit in their own row underneath. Two things pushed
 * them onto the pictures. The row was pinned at a fixed 60vh, so on a wide
 * screen the cells came out square and cropped the tops and bottoms off
 * portrait photographs; giving them their real proportions needs the height
 * the captions were taking. And a caption a screen away from the picture it
 * belongs to is a caption whose change nobody notices — over the photograph,
 * the words turn over exactly where the eye already is.
 *
 * The pair is pinned. Left to scroll past, the colour came back while the
 * reader was already moving and the whole point of the section went by
 * unnoticed — so the spread holds still under the nav bar and the scroll
 * drives the change instead of carrying the reader away from it.
 *
 * The trio used to live in Hero.tsx, which is why the flight that lands the
 * tube in the middle column still comes from there: it looks these cells up
 * by data attribute. Renaming data-trio-row or data-trio-cell-09 breaks it.
 */
export default function Statement() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cell02Ref = useRef<HTMLDivElement>(null);
  const cell10Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pin = pinRef.current;
      const row = rowRef.current;
      if (!pin || !row) return;

      const problems = gsap.utils.toArray<HTMLElement>("[data-usp-problem]");
      const solutions = gsap.utils.toArray<HTMLElement>("[data-usp-solution]");
      // The flying tube is marked in Hero.tsx and has to drain with the two
      // pictures beside it, so this one lookup deliberately leaves the section.
      const tinted = Array.from(
        document.querySelectorAll<HTMLElement>("[data-trio-tint]"),
      );

      // Someone who has asked for less motion still gets the claim — they
      // just get the answer, without being walked through the problem, and
      // without being held in place while it happens.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(tinted, { "--gs": 0 });
        gsap.set([cell02Ref.current, cell10Ref.current], { opacity: 1 });
        gsap.set(problems, { y: 0, yPercent: -100 });
        gsap.set(solutions, { y: 0, yPercent: 0 });
        return;
      }

      gsap.set(tinted, { "--gs": 1 });
      // y: 0 alongside every yPercent, here and in the tweens below.
      // getComputedStyle reports a percentage translate as a resolved pixel
      // matrix, so on the next read GSAP books those pixels as `y` and then
      // applies yPercent on top of them — the two stack, and the answer
      // starts a full block lower than intended and comes to rest one block
      // short. Naming y explicitly holds the pixel component at zero.
      gsap.set(problems, { y: 0, yPercent: 0 });
      gsap.set(solutions, { y: 0, yPercent: 100 });

      const mm = gsap.matchMedia();

      // ══ Desktop ═════════════════════════════════════════════
      mm.add("(min-width: 768px)", () => {
        // The two outer columns arrive before the spread squares up with the
        // nav bar, so the trio is complete — and grey — by the time it is
        // caught. Both finish well above 78px, which is where the pin starts.
        gsap.fromTo(
          cell02Ref.current,
          { opacity: 0, x: -70 },
          {
            opacity: 1,
            x: 0,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top 85%",
              end: "top 48%",
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          cell10Ref.current,
          { opacity: 0, scale: 1.06 },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top 70%",
              end: "top 38%",
              scrub: true,
            },
          },
        );

        // One timeline across the whole pin, and the three columns resolve
        // one at a time rather than together: the middle tube first, then the
        // face on the left, then the texture on the right. Each column's
        // caption turns over on the back of its own photograph, so the eye is
        // told where to look three times instead of being handed everything
        // at once.
        //
        // Reading order is deliberately not left to right. The tube is the
        // product, it is the middle column, and it is what the flight has
        // just delivered — starting anywhere else throws that away.
        //
        // Nothing is held still for long at either end. A pinned section
        // where the scroll moves and the picture does not is what reads as a
        // jolt — the page appears to have snagged. The first column starts
        // almost immediately, the three run back to back, and the beat left
        // at the end is short enough to feel like a pause rather than a stop.
        //
        // Every step is a fromTo. A scrubbed tween is primed by running it to
        // the end and back, and a refresh re-reads an implicit start off the
        // element — which by then is the drained value, so the section would
        // never recover its colour.
        //
        // No anticipatePin: it pins early off the pointer's velocity, and
        // Lenis hands it an eased velocity that is already a frame or two
        // stale, so the section caught with a visible jolt.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pin,
            start: "top 78px",
            end: () => "+=" + window.innerHeight * 1.7,
            pin: true,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // Indices into USP: 1 is the tube, 0 the face, 2 the texture.
        const SEQUENCE = [1, 0, 2];
        const IMG = ["02", "09", "10"];

        SEQUENCE.forEach((col, step) => {
          // The tube is two elements: the empty middle picture and the flying
          // copy from Hero.tsx that comes to rest over it. Both answer to
          // this one attribute.
          const photo = Array.from(
            document.querySelectorAll<HTMLElement>(
              `[data-trio-tint="${IMG[col]}"]`,
            ),
          );
          // Three blocks of 0.30 starting at 0.02, so they run back to back
          // and fill the pin: 0.02, 0.32, 0.62, with the last finishing at
          // 0.92. Inside a block the colour takes the first 0.24 while the
          // caption hands over at 0.19, so picture and words resolve
          // together rather than one waiting on the other.
          const at = 0.02 + step * 0.3;

          tl.fromTo(
            photo,
            { "--gs": 1 },
            { "--gs": 0, ease: "none", duration: 0.24 },
            at,
          )
            // Eased, unlike the colour, which is scrubbed flat. The colour is
            // a state the scroll is scrubbing through; the roll is a gesture,
            // and a gesture that starts and stops at a constant speed reads
            // as a slider being dragged. They overlap by 0.03 so the window
            // is never empty.
            .fromTo(
              problems[col],
              { y: 0, yPercent: 0 },
              { y: 0, yPercent: -100, ease: "power2.in", duration: 0.12 },
              at + 0.09,
            )
            .fromTo(
              solutions[col],
              { y: 0, yPercent: 100 },
              { y: 0, yPercent: 0, ease: "power2.out", duration: 0.14 },
              at + 0.16,
            );
        });

        // A short beat on the finished spread before the page moves again.
        tl.to({}, { duration: 0.08 }, 0.92);
      });

      // ══ Phone ═══════════════════════════════════════════════
      // The desktop spread, one card wide. The three cards are stacked in a
      // single grid cell and the stage pins, centred under the nav bar. The
      // scroll then runs the desktop's sequence — the tube that has just
      // flown in, then the face, then the texture — each card draining back
      // to colour and rolling its caption over before the next card rises
      // over it from below.
      //
      // The address bar folding is handled in Hero.tsx
      // (ignoreMobileResize), so the pin is measured once and holds still.
      //
      // The stacking is written here rather than in the class list so that
      // anyone who has asked for reduced motion (handled above, before this)
      // keeps the plain vertical column instead of three cards piled up.
      mm.add("(max-width: 767.98px)", () => {
        const cell09 = row.querySelector<HTMLElement>("[data-trio-cell-09]");
        // DOM order, which is USP order: face, tube, texture.
        const cells = [cell02Ref.current, cell09, cell10Ref.current];
        if (cells.some((c) => !c)) return;

        // Clip to the card itself, not the row's padding box. The row keeps
        // 12px of padding top and bottom, and overflow alone left a 12px
        // sliver of the waiting card showing under the stage, and of the
        // drifting card above it.
        gsap.set(row, {
          overflow: "hidden",
          clipPath: "inset(12px 0px 12px 0px)",
        });
        gsap.set(cells, { gridArea: "1 / 1", opacity: 1 });
        // Layered in the order they arrive, so each rising card covers the one
        // before it: tube, then face, then texture. The tube starts in place;
        // face and texture wait below the stage, clipped by the row.
        gsap.set(cells, { zIndex: (i: number) => [2, 1, 3][i] });
        // y: 0 with every yPercent on the cards too, for the reason given at
        // the top of this hook. Without it a second run of this block — a
        // rotation, or React running effects twice in development — booked the
        // first run's 100% as pixels and added another 100% on top, so the
        // face and texture started two cards low and never rose into view.
        gsap.set([cells[0], cells[2]], { y: 0, yPercent: 100 });

        const NAV = 78;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pin,
            // Centred in the strip below the nav bar. Recorded on the row for
            // Hero.tsx, which lands the tube just before this point.
            start: () => {
              const top = Math.max(
                NAV,
                Math.round(
                  NAV + (window.innerHeight - NAV - row.offsetHeight) / 2,
                ),
              );
              row.dataset.pinTop = String(top);
              return `top ${top}px`;
            },
            // The timeline below runs 1.16 units. At 2.4 viewports per unit
            // the colour and caption changes keep the pace they had; only the
            // two rises, lengthened at the owner's request, take more scroll.
            end: () => "+=" + window.innerHeight * 2.8,
            pin: true,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // The answer waits in place, faded and 12px low, instead of a full
        // line below the window. Set here so leaving the phone layout reverts
        // it to the roll's starting position above.
        gsap.set(solutions, { opacity: 0, y: 12, yPercent: 0 });

        // Colour over 0.16. Inside it the problem fades out from +0.04 and
        // the answer surfaces from +0.08, overlapping so the caption is
        // never empty, and settling as the photograph reaches full colour.
        const IMG = ["02", "09", "10"];
        const reveal = (col: number, at: number) => {
          const photo = Array.from(
            document.querySelectorAll<HTMLElement>(
              `[data-trio-tint="${IMG[col]}"]`,
            ),
          );
          tl.fromTo(
            photo,
            { "--gs": 1 },
            { "--gs": 0, ease: "none", duration: 0.16 },
            at,
          )
            .fromTo(
              problems[col],
              { opacity: 1, y: 0, yPercent: 0 },
              {
                opacity: 0,
                y: 0,
                yPercent: 0,
                ease: "power1.in",
                duration: 0.07,
              },
              at + 0.04,
            )
            .fromTo(
              solutions[col],
              { opacity: 0, y: 12, yPercent: 0 },
              {
                opacity: 1,
                y: 0,
                yPercent: 0,
                ease: "power2.out",
                duration: 0.1,
              },
              at + 0.08,
            );
        };

        // A rise: the next card comes up from below and covers the one on
        // screen, which drifts up a little underneath it for depth. The drift
        // is small enough that the rising card always overlaps it, so no gap
        // opens between the two. The outgoing tween must not render its start
        // value when the timeline is built — the face card moves twice, and
        // rendering its drift early would shift it before anything scrolled.
        const rise = (from: number, to: number, at: number) => {
          tl.fromTo(
            cells[from],
            { y: 0, yPercent: 0 },
            {
              y: 0,
              yPercent: -15,
              ease: "power2.inOut",
              duration: 0.2,
              immediateRender: false,
            },
            at,
          ).fromTo(
            cells[to],
            { y: 0, yPercent: 100 },
            { y: 0, yPercent: 0, ease: "power2.inOut", duration: 0.2 },
            at,
          );
        };

        // Indices into USP: 1 is the tube, 0 the face, 2 the texture.
        reveal(1, 0.02);
        rise(1, 0, 0.26);
        reveal(0, 0.48);
        rise(0, 2, 0.72);
        reveal(2, 0.94);
        // A short beat on the last card before the page moves on.
        tl.to({}, { duration: 0.04 }, 1.12);
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-paper pb-16 md:pb-32">
      {/* Everything that has to hold still lives inside this one element — a
          pin owns a single node.

          z-[35] threads it between two fixed layers in Hero.tsx: above the
          flying tube at z-30, below the hero's own full-screen clip at z-40
          and the nav at z-50. Above the tube because the middle caption lives
          inside this element and the tube would otherwise cover it; the tube
          still shows because the middle cell holds no picture of its own on
          desktop and nothing here paints a background over it — which is why
          the row below is transparent and the section carries the white. */}
      <div ref={pinRef} className="relative z-[35]">
        {/* Desktop: the row fills the screen below the nav bar — 78px of nav
            and the row's own 24px of gutter — so the cells take the window's
            proportions instead of a fixed 60vh that came out square on a wide
            screen. Phone: one column, each card at 4:5. Three 122px-wide
            slivers of a portrait photograph show a neck and half a word. */}
        <div
          ref={rowRef}
          data-trio-row
          className="grid w-full grid-cols-1 gap-[12px] py-[12px] md:h-[calc(100svh-102px)] md:grid-cols-3"
        >
          <div
            ref={cell02Ref}
            data-trio-cell
            className="group relative aspect-[4/5] overflow-hidden opacity-0 md:aspect-auto"
          >
            <div
              data-trio-tint="02"
              style={desaturate}
              className="h-full w-full"
            >
              <PlaceholderImage
                name="img-02"
                alt="하늘색 배경 앞의 맑은 피부 클로즈업"
                aspect=""
                className="h-full w-full"
                imgClassName="transition duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-[0.93]"
                label="IMG 02 · 3:4"
              />
            </div>
            <Caption item={USP[0]} />
          </div>

          {/* The tube flown in from Hero.tsx comes to rest exactly over this
              cell — and then hands over to the picture below, which is the
              same photograph laid out in the ordinary way.

              The hand-over is not cosmetic. A fixed element does not move
              with the page; Hero repositions it from a ticker every frame,
              which reads the cell's rect before the frame's scroll has been
              applied. Standing still, inside the pin, that is invisible.
              Scrolling out of the pin it is a frame of lag, and the middle
              photograph visibly drags behind its two neighbours. Once the
              flight is over there is nothing left for it to animate, so it
              steps aside. This is also what gives the column its hover back:
              a real picture inside the cell answers the cell's own group.

              opacity-0 is the pre-hand-over state — Hero lifts it. The phone
              flies the tube too, so this holds at both sizes. */}
          <div
            data-trio-cell
            data-trio-cell-09
            className="group relative aspect-[4/5] overflow-hidden md:aspect-auto"
          >
            <div
              data-trio-tint="09"
              style={desaturate}
              className="h-full w-full"
            >
              <div data-trio-still className="h-full w-full opacity-0">
                <PlaceholderImage
                  name="img-09"
                  alt="HISKIN skin texture close-up"
                  aspect=""
                  className="h-full w-full"
                  imgClassName="transition duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-[0.93]"
                  label="IMG 09 · 3:4"
                />
              </div>
            </div>
            <Caption item={USP[1]} />
          </div>

          <div
            ref={cell10Ref}
            data-trio-cell
            className="group relative aspect-[4/5] overflow-hidden opacity-0 md:aspect-auto"
          >
            <div
              data-trio-tint="10"
              style={desaturate}
              className="h-full w-full"
            >
              <PlaceholderImage
                name="img-10"
                alt="벚꽃잎에 둘러싸인 연분홍 제형 위에 HISKIN 글씨를 새긴 클로즈업"
                aspect=""
                className="h-full w-full"
                imgClassName="transition duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-[0.93]"
                label="IMG 10 · 3:4"
              />
            </div>
            <Caption item={USP[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}
