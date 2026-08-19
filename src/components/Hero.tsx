"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { useIntro } from "./IntroContext";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Page 1 — a white runway where img-01 fills the viewport and shrinks into
 * the gap of "One [ ] Step." as the grey page rises to meet it.
 *
 * Page 2 — ordinary document flow, so the copy simply scrolls up. img-09
 * lifts out of "Zero [ ] Effort." and settles into the centre column of a
 * full-bleed row; img-02 fades in on the left on the way up, and img-10
 * materialises in place the moment the row squares up with the top of the
 * window.
 */
export default function Hero() {
  const { introDone } = useIntro();

  const runwayRef = useRef<HTMLElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  const stmtRef = useRef<HTMLElement>(null);
  const slot01Ref = useRef<HTMLSpanElement>(null);
  const slot09Ref = useRef<HTMLSpanElement>(null);
  const img01Ref = useRef<HTMLSpanElement>(null);

  const rowRef = useRef<HTMLDivElement>(null);
  const cell02Ref = useRef<HTMLDivElement>(null);
  const cell09Ref = useRef<HTMLDivElement>(null);
  const cell10Ref = useRef<HTMLDivElement>(null);
  const fly09Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stmt = stmtRef.current;
      const slot01 = slot01Ref.current;
      const slot09 = slot09Ref.current;
      const row = rowRef.current;
      const cell09 = cell09Ref.current;
      const fly = fly09Ref.current;
      if (!runwayRef.current || !stmt || !slot01 || !slot09) return;
      if (!row || !cell09 || !fly) return;

      // ---- Page 1 · img-01 shrinks into the headline gap ----
      // Measured against page 2, whose top sits at the viewport top exactly
      // when the shrink finishes — so these are viewport coords at that moment.
      const landing = () => {
        const base = stmt.getBoundingClientRect();
        const r = slot01.getBoundingClientRect();
        return {
          left: r.left - base.left,
          top: r.top - base.top,
          width: r.width,
          height: r.height,
        };
      };

      // The box that covers the viewport at the slot's aspect ratio. The
      // element is laid out at this — its largest — size and only ever scales
      // *down* from it: a layer is rasterised at its layout size, so laying it
      // out small and scaling up would blur it badly. Animating width/height
      // instead would re-sample the bitmap every frame, which shimmers on fine
      // detail like hair. Scaling down from a full-size raster avoids both.
      // The headline gap takes the window's own aspect ratio. That keeps the
      // cover box exactly one viewport — so a wide, short window never has to
      // crop the photo vertically — while still letting the two states be a
      // single uniform scale apart, with no distortion.
      // The nav bar is opaque, so the strip below it is all the viewer
      // actually sees. Framing against that — rather than the whole window —
      // is what stops the product hiding behind the bar.
      const NAV = 78;
      const seen = () => Math.max(1, window.innerHeight - NAV);

      const sizeSlot = () => {
        const r = Math.min(2.6, Math.max(1.4, window.innerWidth / seen()));
        slot01.style.width = `${(1.02 * r).toFixed(3)}em`;
      };

      const coverBox = () => {
        const l = landing();
        const ratio = l.width / l.height;
        const width = Math.max(window.innerWidth, seen() * ratio);
        const height = width / ratio;
        return {
          left: (window.innerWidth - width) / 2,
          top: NAV + (seen() - height) / 2,
          width,
          height,
        };
      };

      const place = () => {
        sizeSlot();
        const c = coverBox();
        gsap.set(fixedRef.current, {
          left: c.left,
          // the clip frame already starts at NAV, so subtract it back out
          top: c.top - NAV,
          width: c.width,
          height: c.height,
          transformOrigin: "0 0",
        });
      };

      // Where that box has to land to sit exactly in the headline gap.
      const shrink = () => {
        const c = coverBox();
        const l = landing();
        return {
          scale: l.width / c.width,
          x: l.left - c.left,
          y: l.top - c.top,
        };
      };

      place();

      gsap.fromTo(
        fixedRef.current,
        { x: 0, y: 0, scale: 1 },
        {
          x: () => shrink().x,
          y: () => shrink().y,
          scale: () => shrink().scale,
          ease: "none",
          scrollTrigger: {
            trigger: runwayRef.current,
            start: "top top",
            end: "bottom top",
            // Lenis already smooths the scroll; a scrub delay on top of it
            // adds a second, competing ease that reads as wobble.
            scrub: true,
            invalidateOnRefresh: true,
            onRefreshInit: place,
            // Hand over to the copy that lives inside the slot, so it scrolls
            // away with the sentence like any other piece of the page.
            onLeave: () =>
              gsap.set([fixedRef.current, img01Ref.current], {
                opacity: (i: number) => i,
              }),
            onEnterBack: () =>
              gsap.set([fixedRef.current, img01Ref.current], {
                opacity: (i: number) => 1 - i,
              }),
          },
        }
      );

      gsap.to(cueRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: runwayRef.current,
          start: "top top",
          end: "12% top",
          scrub: true,
        },
      });

      // ---- Page 2 · img-09 travels from the sentence into its column ----
      // Both ends move with the page, so this is resolved every frame rather
      // than tweened between fixed endpoints.
      // Laid out once at the size of the column it lands in, then only
      // transformed — same reason as img-01, no per-frame re-sampling.
      let baseW = 0;
      let baseH = 0;

      const flight = () => {
        const vh = window.innerHeight;
        const secTop = stmt.getBoundingClientRect().top;
        // Distance from the top of page 2 down to the row — a constant.
        const rowOffset = row.getBoundingClientRect().top - secTop;

        // Progress is measured against page 2's own scroll, not the row's, so
        // the growth starts while the sentence is still on screen and stretches
        // over roughly a full viewport of scrolling.
        const startAt = vh * 0.02; // as soon as the headline settles
        const endAt = Math.max(startAt + 1, rowOffset - vh * 0.18);
        const p = clamp01((-secTop - startAt) / (endAt - startAt));

        const s = slot09.getBoundingClientRect();
        const c = cell09.getBoundingClientRect();

        if (c.width !== baseW || c.height !== baseH) {
          baseW = c.width;
          baseH = c.height;
          fly.style.width = `${baseW}px`;
          fly.style.height = `${baseH}px`;
        }
        if (!baseW || !baseH) return;

        const w = lerp(s.width, c.width, p);
        const h = lerp(s.height, c.height, p);
        fly.style.transform =
          `translate3d(${lerp(s.left, c.left, p)}px, ${lerp(s.top, c.top, p)}px, 0)` +
          ` scale(${w / baseW}, ${h / baseH})`;
      };
      flight();
      gsap.ticker.add(flight);

      // img-02 eases in on the left as the row climbs. It resolves well before
      // the row reaches the fold so that, by the time the sentence is leaving
      // the top of the window, the left column is already filled.
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
        }
      );

      // img-10 materialises in place, following img-02 across so the trio is
      // complete well before the row squares up with the top of the window —
      // finishing it *at* the ceiling left the right column empty for a whole
      // screen of scrolling.
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
        }
      );

      return () => gsap.ticker.remove(flight);
    },
    { scope: runwayRef }
  );

  // Reveal the hero image once the preloader has folded into the nav logo
  useGSAP(
    () => {
      if (!introDone) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      gsap.to(fixedRef.current, {
        opacity: 1,
        duration: reduced ? 0 : 1,
        ease: "power2.out",
      });
      gsap.to(cueRef.current, {
        opacity: 1,
        duration: reduced ? 0 : 0.8,
        delay: 0.4,
      });
    },
    { dependencies: [introDone] }
  );

  return (
    <>
      {/* ── Page 1 · white runway ─────────────────────────────── */}
      <section id="top" ref={runwayRef} className="relative h-[130vh] bg-paper">
        {/* Full-viewport clip: the scaled-up image bleeds past the edges and is
            trimmed here, which is what gives the cover crop at rest. */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[78px] z-40 overflow-hidden">
          <div
            ref={fixedRef}
            className="absolute overflow-hidden opacity-0 will-change-transform"
          >
            <PlaceholderImage
              name="img-01"
              alt="HISKIN Daily Suncream Protect — hero visual"
              aspect=""
              className="h-full w-full"
              label="IMG 01 · 21:9"
            />
          </div>
        </div>

        <div
          ref={cueRef}
          className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-white opacity-0 mix-blend-difference"
        >
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1.5} />
          SCROLL
        </div>
      </section>

      {/* ── Page 2 · grey, ordinary scroll ────────────────────── */}
      <section id="concept" ref={stmtRef} className="bg-paper-alt">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h2 className="text-display-xl font-display font-semibold text-ink">
            <span className="block">
              One
              <span
                ref={slot01Ref}
                className="relative mx-[0.14em] inline-block h-[1.02em] w-[1.81em] align-baseline"
              >
                <span
                  ref={img01Ref}
                  className="absolute inset-0 block overflow-hidden opacity-0"
                >
                  <PlaceholderImage
                    name="img-01"
                    alt=""
                    aspect=""
                    className="h-full w-full"
                    label="IMG 01 · 16:9"
                  />
                </span>
              </span>
              Step.
            </span>
            <span className="block">
              Zero
              <span
                ref={slot09Ref}
                className="mx-[0.14em] inline-block h-[0.82em] w-[0.62em] align-baseline"
                aria-hidden
              />
              Effort.
            </span>
          </h2>

          <span className="eyebrow-tag mt-10">3-in-1 Daily Suncream</span>
          <p className="mt-5 max-w-xl text-[17px] font-medium leading-[1.35] tracking-[-0.02em] text-ink md:text-[19.5px]">
            바쁜 아침, 자외선 차단부터 톤업까지 단 10초 만에.
          </p>
        </div>

        {/* Just a breath between the sentence and the trio — the climb is
            paced by scroll progress below, not by empty space here. */}
        <div className="h-[5vh]" />

        {/* Full-bleed trio — plain document flow, so it simply scrolls up.
            White from here down, so page three reads as its own screen
            against the grey the sentence sits on. */}
        <div
          ref={rowRef}
          className="grid h-screen w-full grid-cols-3 gap-[12px] bg-paper py-[12px]"
        >
          <div ref={cell02Ref} className="relative overflow-hidden opacity-0">
            <PlaceholderImage
              name="img-02"
              alt="HISKIN rose beige texture close-up"
              aspect=""
              className="h-full w-full"
              label="IMG 02 · 3:4"
            />
          </div>
          {/* The flying img-09 comes to rest exactly over this cell */}
          <div ref={cell09Ref} className="relative" />
          <div ref={cell10Ref} className="relative overflow-hidden opacity-0">
            <PlaceholderImage
              name="img-10"
              alt="HISKIN lifestyle pouch setup"
              aspect=""
              className="h-full w-full"
              label="IMG 10 · 3:4"
            />
          </div>
        </div>

        <div className="h-[22vh] bg-paper" />
      </section>

      {/* img-09 — sits inline in the sentence, then flies into its column */}
      <div
        ref={fly09Ref}
        className="fixed left-0 top-0 z-30 origin-top-left overflow-hidden will-change-transform"
      >
        <PlaceholderImage
          name="img-09"
          alt="HISKIN skin texture close-up"
          aspect=""
          className="h-full w-full"
          label="IMG 09 · 3:4"
        />
      </div>
    </>
  );
}
