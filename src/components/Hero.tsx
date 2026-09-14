"use client";

import { useEffect, useRef, type CSSProperties } from "react";
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
 * Phone intro timings, taken from project-pef.com's mobile landing
 * (measured 2026-09-14: 0.85s out, 0.38s back, sine.inOut both ways, a 20px
 * swipe to set it off).
 */
const LAND = { duration: 0.85, ease: "sine.inOut" };
const RETURN = { duration: 0.38, ease: "sine.inOut" };
const GESTURE_PX = 20;

/** Handed from the layout hook to the intro hook, which knows when the preloader is done. */
type PhoneIntro = {
  /** Intro finished at the top of the page: wait there for the first swipe. */
  arm: () => void;
  /** Go straight to the landed state, without the move. */
  skip: () => void;
};

/**
 * Page 1 — img-01 fills the screen and ends up in the gap of
 * "Bare [ ] Skin".
 *   Desktop: a white runway the shrink is scrubbed across as the grey page
 *   rises to meet it.
 *   Phone: no runway. The page holds at the top until the first swipe, then
 *   the photograph lands in the gap on its own clock and the page is free.
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
  const backdropRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  const stmtRef = useRef<HTMLElement>(null);
  const slot01Ref = useRef<HTMLSpanElement>(null);
  const slot09Ref = useRef<HTMLSpanElement>(null);
  const img01Ref = useRef<HTMLSpanElement>(null);

  const fly09Ref = useRef<HTMLDivElement>(null);

  const phoneIntro = useRef<PhoneIntro | null>(null);
  // Read by the phone branch when it is built after the intro has already
  // finished — a window resized across the breakpoint.
  const introDoneRef = useRef(false);
  useEffect(() => {
    introDoneRef.current = introDone;
  }, [introDone]);

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
      const fixed = fixedRef.current;
      const backdrop = backdropRef.current;
      const cue = cueRef.current;
      const img01 = img01Ref.current;
      if (!runwayRef.current || !stmt || !slot01 || !slot09) return;
      if (!row || !cell09 || !still09 || !fly) return;
      if (!fixed || !backdrop || !cue || !img01) return;

      // A phone's address bar folds and unfolds as the reader scrolls, and
      // every fold is a resize. Left alone, each one re-measures the pinned
      // trio mid-gesture and the page visibly jumps, so those resizes are
      // ignored and the geometry is measured once.
      ScrollTrigger.config({ ignoreMobileResize: true });

      const mm = gsap.matchMedia();

      mm.add(
        { isDesktop: "(min-width: 768px)", isPhone: "(max-width: 767.98px)" },
        (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean };
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
      // Phone: the small viewport — what is on screen with the address bar
      // showing, as it is on arrival — read off a probe, rather than the live
      // innerHeight that changes as the bar folds.
      let probe: HTMLDivElement | null = null;
      if (!isDesktop) {
        probe = document.createElement("div");
        probe.style.cssText =
          "position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
        document.body.appendChild(probe);
      }
      const viewportH = () =>
        isDesktop
          ? window.innerHeight
          : probe?.offsetHeight || window.innerHeight;
      const seen = () => Math.max(1, viewportH() - NAV);

      const sizeSlot = () => {
        const r = Math.min(2.6, Math.max(1.4, window.innerWidth / seen()));
        slot01.style.width = `${(1.02 * r).toFixed(3)}em`;
      };

      const coverBox = () => {
        const l = landing();
        const ratio = l.width / l.height;
        // Phone: start at the width of the screen instead of covering it.
        // Cropped to fill a tall screen, the photograph was all face and no
        // product; at full width the whole picture shows, tube included, with
        // paper above and below it.
        const width = isDesktop
          ? Math.max(window.innerWidth, seen() * ratio)
          : window.innerWidth;
        const height = width / ratio;
        return {
          left: (window.innerWidth - width) / 2,
          top: NAV + (seen() - height) / 2,
          width,
          height,
        };
      };

      const place = () => {
        // Desktop only: on a phone the slot keeps its CSS size.
        if (isDesktop) sizeSlot();
        const c = coverBox();
        gsap.set(fixed, {
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

      // Set by the phone branch once the photograph is in the gap. Desktop
      // reads the runway instead.
      let phoneLanded = false;
      let phoneCleanup = () => {};

      if (isDesktop) {
        // The cue is pinned to the window, so it has to stand down as the
        // runway is left or it stays lit over the whole page.
        gsap.to(cue, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: runwayRef.current,
            start: "top top",
            end: "12% top",
            scrub: true,
          },
        });

        gsap.fromTo(
          fixed,
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
              // The intro fades the hero in over a second. Scroll past the
              // runway inside that second and this set() lands, only for the
              // still-running fade to put the opacity straight back to 1 on
              // the next frame — a ghost of the headline image that never
              // clears. The hand-over has to win, so kill the fade first.
              onLeave: () => {
                gsap.killTweensOf(fixed, "opacity");
                gsap.set([fixed, img01], {
                  opacity: (i: number) => i,
                });
              },
              onEnterBack: () =>
                gsap.set([fixed, img01], {
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
                  gsap.killTweensOf(fixed, "opacity");
                  gsap.set([fixed, img01], {
                    opacity: (i: number) => i,
                  });
                }
              },
            },
          }
        );
      } else {
        // ---- Phone · the photograph lands on the first swipe ----
        // Why not the desktop's scrub: on a phone the shrink ran across 130svh
        // of scroll measured once on arrival. In KakaoTalk's browser the bars
        // retract as the reader scrolls and the page itself grows, so by the
        // end of the runway the gap had moved ~240px down and the photograph
        // vanished above it, with the inline copy popping in below. Here the
        // move is measured at the moment it starts, with the page held at the
        // top so nothing can shift under it, and it runs on its own clock —
        // a fling cannot hurry it into its last frames.
        const root = document.documentElement;
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        // Every block of the page sized in svh is held at the height it had
        // on arrival (see --svh-lock in Hero, Philosophy). Safari's svh never
        // changes, so this changes nothing there; an in-app browser that
        // resizes the page as its bars retract can no longer push the pinned
        // trio away from where ScrollTrigger measured it.
        root.style.setProperty("--svh-lock", `${viewportH()}px`);

        type Phase = "waiting" | "landing" | "landed" | "returning";
        let phase: Phase = "waiting";
        // False until the preloader has handed over: before that the reader
        // cannot see the photograph, so a swipe must not set it off.
        let armed = false;
        let move: gsap.core.Timeline | null = null;
        let touchY: number | null = null;
        let touchAtTop = false;

        const atTop = () => window.scrollY <= 2;

        // Viewport coords the transform needs to put the box in the gap now.
        const toGap = () => {
          place();
          const c = coverBox();
          const r = slot01.getBoundingClientRect();
          return { x: r.left - c.left, y: r.top - c.top, scale: r.width / c.width };
        };

        const showLanded = () => {
          gsap.killTweensOf(fixed, "opacity");
          gsap.set(fixed, { opacity: 0 });
          gsap.set(img01, { opacity: 1 });
          gsap.set([backdrop, cue], { opacity: 0 });
          phase = "landed";
          phoneLanded = true;
          listen("passive");
        };

        const land = () => {
          if (phase !== "waiting") return;
          phase = "landing";
          listen("blocking");
          move?.kill();
          move = gsap
            .timeline({ onComplete: showLanded })
            .to(fixed, { ...toGap(), ...LAND }, 0)
            // The paper behind the photograph clears while it travels, so
            // the headline is already there to receive it.
            .to(backdrop, { opacity: 0, duration: 0.55, ease: "sine.inOut" }, 0.2)
            .to(cue, { opacity: 0, duration: 0.25, overwrite: true }, 0);
        };

        const returnToTop = () => {
          if (phase !== "landed") return;
          phase = "returning";
          phoneLanded = false;
          listen("blocking");
          window.scrollTo(0, 0);
          move?.kill();
          gsap.set(fixed, { ...toGap(), opacity: 1 });
          gsap.set(img01, { opacity: 0 });
          move = gsap
            .timeline({
              onComplete: () => {
                phase = "waiting";
              },
            })
            .to(fixed, { x: 0, y: 0, scale: 1, ...RETURN }, 0)
            .to(backdrop, { opacity: 1, duration: 0.3, ease: "sine.out" }, 0)
            .to(cue, { opacity: 1, duration: 0.3 }, RETURN.duration);
        };

        const skip = () => {
          move?.kill();
          move = null;
          gsap.set(fixed, { x: 0, y: 0, scale: 1 });
          showLanded();
        };

        // Finger up (page down) is positive.
        const pulled = (e: TouchEvent) =>
          touchY === null ? 0 : touchY - (e.touches[0]?.clientY ?? touchY);

        const onTouchStart = (e: TouchEvent) => {
          touchY = e.touches[0]?.clientY ?? null;
          touchAtTop = atTop();
        };
        const onTouchMove = (e: TouchEvent) => {
          if (!armed) return;
          if (phase !== "landed") {
            if (e.cancelable) e.preventDefault();
            if (phase === "waiting" && pulled(e) >= GESTURE_PX) land();
            return;
          }
          if (touchAtTop && atTop() && pulled(e) <= -GESTURE_PX) returnToTop();
        };
        const onWheel = (e: WheelEvent) => {
          if (!armed) return;
          if (phase !== "landed") {
            e.preventDefault();
            if (phase === "waiting" && e.deltaY > 0) land();
            return;
          }
          if (atTop() && e.deltaY < 0) returnToTop();
        };
        const onKey = (e: KeyboardEvent) => {
          if (!armed || phase === "landed") return;
          const target = e.target as HTMLElement | null;
          if (target?.closest("input, textarea, select, [contenteditable]")) return;
          if (!["ArrowDown", "PageDown", " ", "End"].includes(e.key)) return;
          e.preventDefault();
          land();
        };
        const onScroll = () => {
          if (armed && phase !== "landed" && window.scrollY > 0) {
            window.scrollTo(0, 0);
          }
        };
        // A link to a section (the menu, "B2B Inquiry") has to be able to
        // leave the intro, so it skips straight to the landed state before
        // the browser jumps.
        const onLinkClick = (e: MouseEvent) => {
          const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
          if (!link || link.getAttribute("href") === "#top") return;
          if (phase !== "landed") skip();
        };

        // Holding the page at the top needs listeners that can cancel the
        // gesture, and those make the browser wait on script before every
        // scroll. Once landed they are swapped for passive ones, which only
        // watch for the pull back at the top.
        let mode: "" | "blocking" | "passive" = "";
        const unlisten = () => {
          window.removeEventListener("touchstart", onTouchStart);
          window.removeEventListener("touchmove", onTouchMove);
          window.removeEventListener("wheel", onWheel);
          window.removeEventListener("keydown", onKey);
          window.removeEventListener("scroll", onScroll);
          mode = "";
        };
        const listen = (next: "blocking" | "passive") => {
          if (mode === next) return;
          unlisten();
          const passive = next === "passive";
          window.addEventListener("touchstart", onTouchStart, { passive: true });
          window.addEventListener("touchmove", onTouchMove, { passive });
          window.addEventListener("wheel", onWheel, { passive });
          if (!passive) {
            window.addEventListener("keydown", onKey);
            window.addEventListener("scroll", onScroll, { passive: true });
          }
          mode = next;
        };

        listen("blocking");
        document.addEventListener("click", onLinkClick, true);

        phoneIntro.current = {
          arm: () => {
            if (phase === "landed") return;
            armed = true;
          },
          skip,
        };

        // Built after the intro already finished: decide on the spot.
        if (introDoneRef.current) {
          if (atTop() && !reduced) {
            gsap.set(fixed, { opacity: 1 });
            gsap.set(img01, { opacity: 0 });
            armed = true;
          } else {
            skip();
          }
        }

        phoneCleanup = () => {
          move?.kill();
          unlisten();
          document.removeEventListener("click", onLinkClick, true);
          root.style.removeProperty("--svh-lock");
          gsap.set([backdrop, cue], { clearProps: "opacity" });
          gsap.set(fixed, { clearProps: "x,y,scale" });
          phoneIntro.current = null;
        };
      }

      // ---- Page 2 · img-09 travels from the sentence into its column ----
      // Both ends move with the page, so this is resolved every frame rather
      // than tweened between fixed endpoints.
      // Laid out once at the size of the column it lands in, then only
      // transformed — same reason as img-01, no per-frame re-sampling.
      let baseW = 0;
      let baseH = 0;
      // null so the first frame always writes, whichever side it lands on
      let handedOver: boolean | null = null;

      // Last line of defence, every frame: once the photograph has reached the
      // gap — past the runway on a desktop, landed on a phone — the fixed hero
      // must be dark and the inline copy lit, whatever any tween thinks.
      // Ticker callbacks run after the global timeline renders, so this
      // always has the final say within a frame. Only the hidden side is
      // enforced — the visible side belongs to the intro fade and the
      // hand-overs above.
      const enforceHandover = () => {
        const reached = isDesktop
          ? runwayRef.current!.getBoundingClientRect().bottom <= 0
          : phoneLanded;
        if (!reached) return;
        if (fixed.style.opacity !== "0") fixed.style.opacity = "0";
        if (img01.style.opacity !== "1") img01.style.opacity = "1";
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
        // Phone: land 8px before the stacked trio pins (Statement.tsx records
        // where on row.dataset.pinTop), so the tube is already the card's own
        // picture when the card stops. While pinned the row's rect is frozen
        // and this ratio stays above 1; without the 8px it would hover just
        // under 1 and the hand-over would flicker.
        const endAt = isDesktop
          ? Math.max(startAt + 1, rowOffset - vh * 0.18)
          : Math.max(
              startAt + 1,
              rowOffset - (Number(row.dataset.pinTop) || NAV) - 8,
            );
        const p = clamp01((-secTop - startAt) / (endAt - startAt));

        // Phone: once landed there is nothing left to move, so skip the rect
        // reads below for the rest of the page.
        if (!isDesktop && p >= 1 && handedOver === true) return;

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
        phoneCleanup();
        // Crossing the breakpoint: the other branch starts from the classes,
        // and the inline values written here would outrank them.
        fly.style.opacity = "";
        still09.style.opacity = "";
        if (isDesktop) slot01.style.width = "";
        probe?.remove();
      };
        },
      );

      return () => mm.revert();
    },
    { scope: runwayRef }
  );

  // Reveal the hero image once the preloader has folded into the nav logo
  useGSAP(
    () => {
      if (!introDone) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      // Phone: fade the photograph in and wait at the top for the first
      // swipe. Anywhere else — a link to a section, or reduced motion — it is
      // already where it would have landed.
      if (!window.matchMedia("(min-width: 768px)").matches) {
        const intro = phoneIntro.current;
        if (!intro) return;
        if (window.scrollY > 2 || reduced) {
          intro.skip();
          return;
        }
        intro.arm();
        const fade = gsap.to(fixedRef.current, {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        });
        const cueIn = gsap.to(cueRef.current, {
          opacity: 1,
          duration: 0.8,
          delay: 0.4,
        });
        return () => {
          fade.kill();
          cueIn.kill();
        };
      }

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
        gsap.set(img01Ref.current, { opacity: 1 });
        return;
      }

      const fade = gsap.to(fixedRef.current, {
        opacity: 1,
        duration: reduced ? 0 : 1,
        ease: "power2.out",
        // Belt and braces for the same race: if the reader has already left
        // the runway by the time the fade lands, hand over instead of
        // leaving the hero lit over the middle of the page.
        onComplete: () => {
          if (runway.getBoundingClientRect().bottom <= 0) {
            gsap.set(fixedRef.current, { opacity: 0 });
            gsap.set(img01Ref.current, { opacity: 1 });
          }
        },
      });
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
        cueIn.kill();
      };
    },
    { dependencies: [introDone] }
  );

  return (
    <>
      {/* ── Page 1 ────────────────────────────────────────────── */}
      {/* Desktop: the 130vh white runway the shrink is scrubbed across.
          Phone: no height at all — page 2 starts at the top, under the
          photograph and the paper behind it, and the move is not scroll. */}
      <section
        id="top"
        ref={runwayRef}
        className="relative h-0 bg-paper md:h-[130vh]"
      >
        {/* Full-viewport clip: the scaled-up image bleeds past the edges and is
            trimmed here, which is what gives the cover crop at rest. Fixed at
            both sizes. */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[78px] z-40 overflow-hidden">
          {/* Phone: the paper the photograph waits on, over page 2. It clears
              as the photograph lands. */}
          <div ref={backdropRef} className="absolute inset-0 bg-paper md:hidden" />
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
        {/* --svh-lock: the phone branch above holds this at the screen height
            on arrival; elsewhere it is plain 100svh. */}
        <div className="flex min-h-[var(--svh-lock,100svh)] flex-col items-center justify-center px-6 text-center">
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
              {/* Holds the place img-09 flies out of, at both sizes. */}
              <span
                ref={slot09Ref}
                className="mx-[0.14em] inline-block h-[0.82em] w-[0.62em] align-baseline"
                aria-hidden
              />
              Foundation
            </span>
          </h1>

          <span className="eyebrow-tag mt-10">Foundation-Free Daily Suncream</span>
          <p className="mt-5 max-w-2xl type-lead font-medium text-ink">
            파데 없이 완벽한 아침, 단 10초로 완성하는 데일리 파데 프리 솔루션
          </p>
        </div>

        {/* Just a breath before the spread that follows — the trio of
            photographs and its captions are pinned together in
            Statement.tsx, so nothing else belongs between them. */}
        <div className="h-[calc(var(--svh-lock,100svh)*0.05)]" />
      </section>

      {/* img-09 — sits inline in the sentence, then flies into its column */}
      <div
        ref={fly09Ref}
        data-trio-tint="09"
        style={desaturate}
        // max-md:pointer-events-none: once landed on a phone the flight stops
        // updating, so this invisible box would otherwise sit fixed over the
        // middle of the screen catching taps for the rest of the page.
        className="group fixed left-0 top-0 z-30 origin-top-left overflow-hidden will-change-transform max-md:pointer-events-none"
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
