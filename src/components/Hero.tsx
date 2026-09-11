"use client";

import { useRef, type CSSProperties } from "react";
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
 * Consumes the --gs custom property GSAP animates below: 1 is fully
 * desaturated, 0 is the photograph's own colour. A variable rather than a
 * filter string, so the tween carries a plain number and there is no
 * declaration to re-parse every frame.
 */
const desaturate = {
  filter: "grayscale(var(--gs, 1))",
  willChange: "filter",
} as CSSProperties;

/**
 * Page 1 — a white runway where img-01 fills the viewport and shrinks into
 * the gap of "One [ ] Step." as the grey page rises to meet it.
 *
 * Page 2 — ordinary document flow, so the copy simply scrolls up. img-09
 * lifts out of "Zero [ ] Foundation." and settles into the centre column of
 * the trio that opens Statement.tsx. The trio itself lives there, pinned
 * with the captions it belongs to; this file only flies the tube into it.
 */
export default function Hero() {
  const { introDone } = useIntro();

  const runwayRef = useRef<HTMLElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  const stmtRef = useRef<HTMLElement>(null);
  const slot01Ref = useRef<HTMLSpanElement>(null);
  const slot09Ref = useRef<HTMLSpanElement>(null);
  const img01Ref = useRef<HTMLSpanElement>(null);

  const fly09Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stmt = stmtRef.current;
      const slot01 = slot01Ref.current;
      const slot09 = slot09Ref.current;
      // The trio of photographs lives in Statement.tsx now: it is pinned
      // together with the captions it belongs to, and a pin owns exactly one
      // element, so the two had to end up under one roof. The flight still
      // lands on it. This hook is scoped to the runway, so a selector string
      // handed to gsap would be resolved inside page one and quietly find
      // nothing — these have to be looked up against the document. They are
      // already there: the whole tree commits before any layout effect runs.
      const row = document.querySelector<HTMLElement>("[data-trio-row]");
      const cell09 = document.querySelector<HTMLElement>("[data-trio-cell-09]");
      // The picture that lives inside the column. The flight hands over to it
      // on landing — see the note on the cell in Statement.tsx.
      const still09 = document.querySelector<HTMLElement>("[data-trio-still]");
      const fly = fly09Ref.current;
      if (!runwayRef.current || !stmt || !slot01 || !slot09) return;
      if (!row || !cell09 || !still09 || !fly) return;

      // The cue is pinned to the window at both sizes, so it has to stand
      // down at both — leave this inside the desktop branch and it stays lit
      // over the whole phone page.
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

      // The campaign line leaves a little before the cue does. It has to
      // leave at all because on desktop the frame it sits in is fixed, so
      // anything still lit here would hang over the whole page — and it has
      // to go early because the photograph under it starts shrinking away
      // from the first pixel of scroll, leaving the words stranded over the
      // white margin the shrink opens up. Gone by 8%, while the picture is
      // still within a few per cent of full bleed.
      // fromTo rather than to — a plain to-tween would record its start
      // value while the preloader still has the line at opacity 0, and then
      // scrub 0 → 0, snuffing it out on the first scroll tick.
      gsap.fromTo(
        copyRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: runwayRef.current,
            start: "top top",
            end: "8% top",
            scrub: true,
          },
        }
      );

      const mm = gsap.matchMedia();

      // Both sizes run the same two moves: img-01 shrinking into the headline
      // and img-09 flying into the trio. Phones used to get neither — the
      // headline slot was 68px wide there, so a full-screen photograph spent
      // most of the runway as a chip adrift in an empty grey field (WORKLOG
      // 2026-08-24). What fixes that is the two phone settings below, a wider
      // slot and a shrink that holds the picture large and lands it late.
      // Split by condition rather than written twice, so crossing 768px
      // re-measures everything with the other set.
      mm.add(
        { phone: "(max-width: 767.98px)", desktop: "(min-width: 768px)" },
        (ctx) => {
      const { phone } = ctx.conditions as { phone: boolean };

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
      // A phone's window grows when the address bar folds away, which is
      // exactly what the first scroll down does — and ScrollTrigger ignores
      // that resize on touch devices rather than re-measuring mid-gesture. A
      // box sized to the window as first measured would leave a band of white
      // under the photograph the moment the reader starts moving. Sized to the
      // largest the window gets instead; with the bar still showing, the
      // extra hangs off the bottom of the clip.
      const tallest = () => {
        const probe = document.createElement("div");
        probe.style.cssText =
          "position:fixed;top:0;height:100lvh;visibility:hidden;pointer-events:none";
        document.body.appendChild(probe);
        const h = probe.offsetHeight;
        probe.remove();
        return Math.max(h, window.innerHeight);
      };
      const seen = () =>
        Math.max(1, (phone ? tallest() : window.innerHeight) - NAV);

      // Desktop sizes the slot to the window's aspect. A phone window is taller
      // than it is wide, so that would clamp the slot to its narrowest; there
      // it takes the photograph's own
      // proportions instead (img-01 is 1928×816): the widest slot that costs
      // nothing, because the cover box is built at the slot's ratio and any
      // ratio past the picture's own would zoom the resting hero in beyond
      // the crop the campaign line was placed against.
      const sizeSlot = () => {
        const r = phone
          ? 2.36
          : Math.min(2.6, Math.max(1.4, window.innerWidth / seen()));
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
          // Flat on desktop, where the slot is big enough to be worth
          // travelling toward. On a phone the landing is a 90px chip, so the
          // picture holds most of its size while the headline rises under it
          // and gives the reduction up in the last stretch.
          ease: phone ? "power2.in" : "none",
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
            // The intro fades the hero in over a second. Scroll past the
            // runway inside that second and this set() lands, only for the
            // still-running fade to put the opacity straight back to 1 on
            // the next frame — a ghost of the headline image that never
            // clears. The hand-over has to win, so kill the fade first.
            onLeave: () => {
              gsap.killTweensOf(fixedRef.current, "opacity");
              gsap.set([fixedRef.current, img01Ref.current], {
                opacity: (i: number) => i,
              });
            },
            onEnterBack: () =>
              gsap.set([fixedRef.current, img01Ref.current], {
                opacity: (i: number) => 1 - i,
              }),
            // onLeave/onEnterBack only fire while *crossing* the boundary, so
            // anything that lands past the end without scrolling through it —
            // a refresh after late images resize the page, an anchor jump —
            // leaves the hero visible with nothing to hide it. Re-assert the
            // handed-over state on every refresh. Only the past-the-end case
            // is forced: showing it again here would override the intro fade.
            onRefresh: (self) => {
              if (self.progress >= 1) {
                gsap.killTweensOf(fixedRef.current, "opacity");
                gsap.set([fixedRef.current, img01Ref.current], {
                  opacity: (i: number) => i,
                });
              }
            },
          },
        }
      );

      // ---- Page 2 · img-09 travels from the sentence into its column ----
      // Both ends move with the page, so this is resolved every frame rather
      // than tweened between fixed endpoints.
      // Laid out once at the size of the column it lands in, then only
      // transformed — same reason as img-01, no per-frame re-sampling.
      let baseW = 0;
      let baseH = 0;
      // null so the first frame always writes, whichever side it lands on
      let handedOver: boolean | null = null;

      // Last line of defence, every frame: past the runway the fixed hero
      // must be dark and the inline copy lit, whatever any tween thinks.
      // Ticker callbacks run after the global timeline renders, so this
      // always has the final say within a frame. Only the hidden side is
      // enforced — the visible side belongs to the intro fade and the
      // scroll hand-over above.
      const fixedEl = fixedRef.current;
      const inlineEl = img01Ref.current;
      const enforceHandover = () => {
        if (!fixedEl || !inlineEl) return;
        if (runwayRef.current!.getBoundingClientRect().bottom > 0) return;
        if (fixedEl.style.opacity !== "0") fixedEl.style.opacity = "0";
        if (inlineEl.style.opacity !== "1") inlineEl.style.opacity = "1";
      };

      const flight = () => {
        enforceHandover();
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

        // Landed. The two are exactly congruent at p === 1, so the swap is
        // invisible — and from here the column is an ordinary picture that
        // scrolls with the page instead of a fixed one chasing it a frame
        // behind. Guarded on a change so this is not two style writes every
        // frame for the rest of the page.
        const landed = p >= 1;
        if (landed !== handedOver) {
          handedOver = landed;
          fly.style.opacity = landed ? "0" : "1";
          still09.style.opacity = landed ? "1" : "0";
        }
      };
      flight();
      gsap.ticker.add(flight);

      return () => {
        gsap.ticker.remove(flight);
        // Crossing 768px: hand the two back to their classes, so the other
        // size starts from the pre-hand-over state rather than inheriting
        // this one's.
        fly.style.opacity = "";
        still09.style.opacity = "";
      };
        }
      );

      return () => mm.revert();
    },
    { scope: runwayRef }
  );

  // Reveal the hero image once the preloader has folded into the nav logo
  useGSAP(
    () => {
      if (!introDone) return;

      // The page is not always at the top when the intro finishes. A reload
      // restores the previous scroll position, and in dev a fast refresh
      // replays the preloader wherever the reader happens to be. Fading the
      // hero in at that point strands it over the middle of the page — the
      // scrub has already carried it to its shrunken end state, so it reads
      // as a ghost of the headline image. Past the runway, hand straight
      // over to the copy that lives in the headline slot instead.
      const runway = runwayRef.current;
      if (!runway || runway.getBoundingClientRect().bottom <= 0) {
        gsap.set(fixedRef.current, { opacity: 0 });
        gsap.set(copyRef.current, { opacity: 0 });
        gsap.set(img01Ref.current, { opacity: 1 });
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      const fade = gsap.to(fixedRef.current, {
        opacity: 1,
        duration: reduced ? 0 : 1,
        ease: "power2.out",
        // Belt and braces for the same race: if the reader has already left
        // the runway by the time the fade lands, hand over instead of
        // leaving the hero lit over the middle of the page.
        onComplete: () => {
          if (runway.getBoundingClientRect().bottom <= 0) {
            gsap.set([fixedRef.current, copyRef.current], { opacity: 0 });
            gsap.set(img01Ref.current, { opacity: 1 });
          }
        },
      });
      // The campaign line follows the photograph in rather than arriving with
      // it — a beat behind, so the picture reads first and the words settle
      // onto it. Then the label leads the headline by a fifth of a second:
      // read in the order it is written, not revealed as one block. Barely a
      // lift, 8px, and the two overlap heavily — a stagger long enough to
      // see as two separate arrivals would turn a fade into a sequence.
      //
      // The wrapper takes the opacity in one step and the children carry the
      // reveal. It has to be that way round: the wrapper's opacity is what
      // the scroll fade-out scrubs, and two tweens on one property would
      // fight for it.
      const copyIn = gsap.timeline({
        delay: reduced ? 0 : 0.5,
        // Same race as the cue below: scroll away while this is still
        // running and the line would be left lit over the middle of the
        // page, since its own fade-out is a scrub that only writes on
        // scroll and has already passed its end.
        onUpdate: () => {
          const r = runway.getBoundingClientRect();
          if (r.top <= -0.12 * r.height) {
            copyIn.kill();
            gsap.set(copyRef.current, { opacity: 0 });
          }
        },
      });
      copyIn.set(copyRef.current, { opacity: 1 }).fromTo(
        [eyebrowRef.current, headlineRef.current],
        { opacity: 0, y: reduced ? 0 : 8 },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? 0 : 1.2,
          stagger: reduced ? 0 : 0.2,
          ease: "power2.out",
        }
      );

      // Same race for the cue: its scroll fade-out is a scrub that only
      // writes on scroll, so a late intro fade-in would leave "SCROLL"
      // lit over the trio. Stand down as soon as the runway is left.
      const cueIn = gsap.to(cueRef.current, {
        opacity: 1,
        duration: reduced ? 0 : 0.8,
        delay: 0.4,
        onUpdate: () => {
          const r = runway.getBoundingClientRect();
          if (r.top <= -0.12 * r.height) {
            cueIn.kill();
            gsap.set(cueRef.current, { opacity: 0 });
          }
        },
      });

      return () => {
        fade.kill();
        copyIn.kill();
        cueIn.kill();
      };
    },
    { dependencies: [introDone] }
  );

  return (
    <>
      {/* ── Page 1 · white runway ─────────────────────────────── */}
      {/* A runway 1.3 windows tall that the shrink is scrubbed across. svh on
          a phone, not vh — a phone's vh counts the retracted address bar, so
          the runway would be taller than it measures and every trigger under
          it would shift as the bar folds. */}
      <section
        id="top"
        ref={runwayRef}
        className="relative h-[130svh] bg-paper md:h-[130vh]"
      >
        {/* Full-viewport clip: the scaled-up image bleeds past the edges and is
            trimmed here, which is what gives the cover crop at rest. Fixed,
            so the picture stays in the window while it shrinks and the page
            rises underneath it, then hands over to the copy in the slot. */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[78px] z-40 overflow-hidden">
          <div
            ref={fixedRef}
            className="absolute inset-0 overflow-hidden opacity-0 will-change-transform"
          >
            <PlaceholderImage
              name="img-01"
              alt="HISKIN Daily Suncream Protect — hero visual"
              aspect=""
              className="h-full w-full"
              label="IMG 01 · 21:9"
            />
          </div>

          {/* Campaign line — a sibling of the frame above, never a child of
              it: that div is the one scaled into the headline gap on
              desktop, so type placed inside would shrink away with the
              photograph.

              Upper left, on the empty backdrop beside her head. How much of
              that margin survives depends on the window: the photograph is
              21:9 laid into a taller frame, so the narrower the window the
              harder the crop bites in from the sides — 440px of clear
              backdrop at 1920×950, 300px at 1440×790, 140px at 1024. Below
              about 1600 the second word reaches her hair.

              Which is what the white is for. Ink would be legible on the
              backdrop and gone the moment it touched the hair; white is the
              other way round — a quiet tone-on-tone whisper over the pale
              ground, and brighter, not weaker, where it crosses her. It is
              the one colour that survives the whole range of crops, and the
              understatement is the point: this sits behind the model and
              the tube, not in front of them.

              The phone crop is a tall centre slice of the same frame, so
              there is no backdrop in it at all: the upper left is her hair
              and forehead. 8% rather than 13% is what puts the line on the
              hair instead of across her face — white on that is the highest
              contrast it gets anywhere. Sizes need no breakpoint either
              way: .type-caption is fixed by the system, .type-campaign is
              fluid, and neither is touched here. */}
          <div
            ref={copyRef}
            className="absolute inset-x-0 top-[8%] px-6 opacity-0 md:top-[13%] md:px-[80px]"
          >
            {/* The rose square is the mark .eyebrow-tag carries everywhere
                else on the site, a size down and set on its own so the
                label keeps the wide 0.2em tracking it shares with the
                SCROLL cue rather than the tag's 0.1em. */}
            <p
              ref={eyebrowRef}
              className="flex items-center gap-2 opacity-0 type-caption font-medium tracking-[0.2em] text-white/70"
            >
              <span
                aria-hidden
                className="h-[5px] w-[5px] shrink-0 bg-rose"
              />
              DAILY SUN CARE, REDEFINED.
            </p>
            {/* A paragraph, not a heading. The page's one h1 is "Bare Skin,
                Zero Foundation" below, and this line comes before it in the
                document — as a heading it would be either a second h1 or an
                h2 ahead of the h1. Styling comes from the classes, so the
                tag changes nothing on screen. */}
            <p
              ref={headlineRef}
              className="mt-4 max-w-[18rem] type-campaign font-display font-semibold text-white opacity-0 md:mt-5 md:max-w-none"
            >
              A Higher Standard
              <br />
              for Your Skin.
            </p>
          </div>
        </div>

        <div
          ref={cueRef}
          className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 type-caption font-medium tracking-[0.2em] text-white opacity-0 mix-blend-difference"
        >
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1.5} />
          SCROLL
        </div>
      </section>

      {/* ── Page 2 · grey, ordinary scroll ────────────────────── */}
      <section id="concept" ref={stmtRef} className="bg-paper-alt">
        <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
          {/* The page's one h1. "Bare Skin, Zero Foundation" is the line the
              whole page argues for, and it is the largest type on the site, so
              the document outline and the visual one agree. Styling comes from
              the classes, not the tag. */}
          <h1 className="type-display font-display font-semibold text-ink">
            <span className="block">
              Bare
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
              Skin
            </span>
            <span className="block">
              Zero
              {/* Holds the place img-09 flies out of. */}
              <span
                ref={slot09Ref}
                className="mx-[0.14em] inline-block h-[0.82em] w-[0.62em] align-baseline"
                aria-hidden
              />
              Foundation
            </span>
          </h1>

          {/* The tag is uppercased by .eyebrow-tag, so it is written here in
              the case it is read in, not the case it renders in. */}
          <span className="eyebrow-tag mt-10">Foundation-Free Daily Sun Care</span>
          {/* The break is set rather than left to the container: both lines
              clear the measure at every width, so without it the wrap point
              would move with the viewport and the two clauses would split
              mid-thought. */}
          <p className="mt-5 max-w-2xl type-lead font-medium text-ink">
            선크림 하나로 가볍게 완성하는
            <br />
            파운데이션 프리 모닝 루틴
          </p>
        </div>

        {/* Just a breath before the spread that follows — the trio of
            photographs and its captions are pinned together in
            Statement.tsx, so nothing else belongs between them. */}
        <div className="h-[5svh]" />
      </section>

      {/* img-09 — sits inline in the sentence, then flies into its column */}
      <div
        ref={fly09Ref}
        data-trio-tint="09"
        style={desaturate}
        className="group fixed left-0 top-0 z-30 origin-top-left overflow-hidden will-change-transform"
      >
        <PlaceholderImage
          name="img-09"
          alt="HISKIN skin texture close-up"
          aspect=""
          className="h-full w-full"
          imgClassName="transition duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-[0.93]"
          label="IMG 09 · 3:4"
        />
      </div>
    </>
  );
}
