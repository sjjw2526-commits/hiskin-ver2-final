"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Play, Volume2, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * REAL REVIEW — 실제로 촬영한 사용 후기만 둡니다. 레일, 번호(REVIEW 01…),
 * 모달의 이전/다음이 전부 이 목록 순서를 따릅니다.
 *
 * 영상 넣는 법: `npm run video -- "<원본파일>" <슬롯번호> [썸네일초]`
 *
 * ⚠️ AI 로 만든 영상은 넣지 마세요. "REAL REVIEW" 아래에 두면 허위 후기가
 *    됩니다. review-05.mp4 (AI 생성, "한여름 8시간 지속력 테스트")를
 *    2026-09-14 에 이 목록에서 뺀 이유입니다. 파일은 public/videos 에 남아
 *    있지만 페이지에서는 쓰지 않습니다.
 *
 * 카드에는 계정명 대신 번호와 한 줄 제목만 씁니다. 출연자에게 이름·계정
 * 노출 동의를 받은 적이 없어서입니다.
 */
type Review = {
  src: string;
  /** 레일에 보이는 정지 컷 (/videos/review-NN.jpg) */
  poster: string;
  /** 이 영상이 가장 잘 보여주는 사용 경험, 한 줄 */
  title: string;
};

const REVIEWS: Review[] = [
  {
    // 메이크업 아티스트가 손등에 발라 양손을 비교하는 실촬영본 (2026-08-30 교체)
    src: "/videos/review-01.mp4",
    poster: "/videos/review-01.jpg",
    title: "메이크업 아티스트가 선택한 사용감",
  },
  {
    // 기름종이로 마무리감을 확인하는 실촬영본 (2026-09-02 추가)
    src: "/videos/review-02.mp4",
    poster: "/videos/review-02.jpg",
    title: "보송한 마무리와 자연스러운 톤업",
  },
  {
    // 출근 전 5분 메이크업 GRWM 실촬영본 (2026-09-01 교체)
    src: "/videos/review-03.mp4",
    poster: "/videos/review-03.jpg",
    title: "HISKIN으로 완성하는 5분 데일리 메이크업",
  },
  {
    // 제품을 들고 사용감과 톤업을 설명하는 실촬영본
    src: "/videos/review-04.mp4",
    poster: "/videos/review-04.jpg",
    title: "맑고 화사하게 살아나는 피부 톤",
  },
];

const reviewLabel = (i: number) => `Review ${String(i + 1).padStart(2, "0")}`;

/** Drift speed of the rail in px per second — slow enough to read as almost still. */
const DRIFT = 24;
/** After a finger lets go of the rail, it waits this long before drifting again. */
const TOUCH_RESUME_MS = 3000;
/**
 * The list is laid out three times end to end. At rest the rail shows the
 * middle copy, and whenever drift or a drag carries it towards either end it
 * jumps back by exactly one copy's width. The content repeats, so the jump
 * cannot be seen — that is the whole loop.
 */
const COPIES = 3;

/**
 * Section colours. On 2026-09-13 a warm ivory (#f3eee8) and Philosophy's ink
 * ground were both tried here; the owner kept white.
 */
const T = {
  // Blush, not paper: the reviews are the warmest part of the page and the
  // ground says so, echoing the partnership form at the end.
  section: "bg-blush text-ink",
  media: "bg-[#ecebe8]",
  label: "text-mute",
  title: "text-ink",
};

const META = "type-caption font-semibold uppercase";
const META_TRACK = { letterSpacing: "0.08em" };

function VideoCard({
  review,
  index,
  real,
  onOpen,
  suppressClick,
}: {
  review: Review;
  index: number;
  /** false for the two copies either side, which exist only to close the loop */
  real: boolean;
  onOpen: () => void;
  suppressClick: () => boolean;
}) {
  return (
    <button
      data-video-card
      onClick={() => {
        if (suppressClick()) return;
        onOpen();
      }}
      // The copies stay clickable with a mouse or finger, but are skipped by
      // the keyboard and screen readers so the list is announced once.
      tabIndex={real ? undefined : -1}
      aria-hidden={real ? undefined : true}
      // Phone: one film and a slice of the next. lg: about three and a half to
      // a view, so a list of four never shows the same film at both edges.
      className="group block w-[72vw] shrink-0 text-left sm:w-[40vw] lg:w-[clamp(300px,24vw,380px)]"
      aria-label={`Play ${reviewLabel(index)}: ${review.title}`}
    >
      <div className={`relative aspect-[9/16] overflow-hidden ${T.media}`}>
        {/* Stills only. No <video> sits in the rail, so the page loads four
            small JPEGs here instead of five films' metadata; the film is
            fetched when a card is opened. */}
        <img
          src={review.poster}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />

        {/* A thin play mark, always there so a still reads as a film. The
            faint dark fill keeps the ring visible on bright stills (review-02
            is shot against a white wall). */}
        <span className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-black/20 text-white transition-colors duration-300 group-hover:bg-white group-hover:text-ink">
          <Play className="ml-0.5 h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      </div>

      {/* Credit under the film, not over it: most of these clips already carry
          their own captions. */}
      <p className={`mt-4 ${META} ${T.label}`} style={META_TRACK}>
        {reviewLabel(index)}
      </p>
      <p className={`mt-1.5 type-body-sm font-medium ${T.title}`}>
        {review.title}
      </p>
    </button>
  );
}

export default function VideoGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Rail state changes every frame and nothing in the markup depends on it,
  // so it lives in refs and is written straight to the track's transform.
  const pos = useRef({ x: 0, v: 0, period: 0, pad: 0 });
  // Everything that stops the drift. `until` is the time a touch hold ends.
  const hold = useRef({ hover: false, press: false, focus: false, modal: false, until: 0 });
  const drag = useRef({ id: -1, touch: false, startX: 0, startY: 0, lastX: 0, axis: "", moved: 0 });

  // A card click that ends a drag should not open the modal
  const suppressClick = () => drag.current.moved > 6;

  useEffect(() => {
    hold.current.modal = openIndex !== null;
  }, [openIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    const rail = railRef.current;
    const track = trackRef.current;
    if (!section || !rail || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = pos.current;
    let onScreen = false;

    const render = () => {
      track.style.transform = `translate3d(${p.x}px, 0, 0)`;
    };

    // Keep the three copies covering the rail: never so far right that the
    // gutter before the first copy shows, never so far left that the end of
    // the last copy comes in. Jumps are whole copies, so nothing visibly moves.
    const wrap = () => {
      if (!p.period) return;
      const hi = -p.pad;
      const lo = rail.clientWidth - track.offsetWidth;
      if (p.x > hi) p.x -= Math.ceil((p.x - hi) / p.period) * p.period;
      if (p.x < lo) p.x += Math.ceil((lo - p.x) / p.period) * p.period;
    };

    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("[data-video-card]");
      const first = cards[0];
      const nextCopy = cards[REVIEWS.length];
      if (!first || !nextCopy) return;
      const old = p.period;
      p.pad = first.offsetLeft;
      p.period = nextCopy.offsetLeft - first.offsetLeft;
      // First measure: rest on the middle copy, its first film at the gutter.
      // On a resize: stay at the same point in the list.
      p.x = old ? (p.x / old) * p.period : -p.period;
      wrap();
      render();
    };

    const tick = (_time: number, deltaMs: number) => {
      if (!onScreen || !p.period || drag.current.axis === "x") return;
      const h = hold.current;
      const drifting =
        !reduced &&
        !h.hover &&
        !h.press &&
        !h.focus &&
        !h.modal &&
        performance.now() >= h.until;
      if (!drifting && p.v < 0.05) {
        p.v = 0;
        return;
      }
      // Capped so a frame after a background tab does not leap the rail.
      const dt = Math.min(deltaMs, 100);
      // Ease towards the target speed: a pause settles and a resume gathers
      // pace, instead of the film stopping and starting dead.
      p.v += ((drifting ? DRIFT : 0) - p.v) * Math.min(1, dt / 300);
      p.x -= (p.v * dt) / 1000;
      wrap();
      render();
    };

    // ── Pointer: mouse drag, and touch drag on the horizontal axis only ──
    // The rail is touch-action: pan-y, so a vertical swipe that starts on it
    // still scrolls the page. The browser takes that gesture over and sends
    // pointercancel, which releases the hold without the three-second wait.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag.current = {
        id: e.pointerId,
        touch: e.pointerType !== "mouse",
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        axis: "",
        moved: 0,
      };
      hold.current.press = true;
    };

    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (e.pointerId !== d.id) return;
      if (!d.axis) {
        const ax = Math.abs(e.clientX - d.startX);
        const ay = Math.abs(e.clientY - d.startY);
        if (Math.max(ax, ay) < 6) return;
        d.axis = ax > ay ? "x" : "y";
        if (d.axis === "x") {
          p.v = 0;
          // Captured only once a drag has begun: capturing on pointerdown
          // would retarget the click and a plain tap could never open a film.
          rail.setPointerCapture(e.pointerId);
        }
      }
      if (d.axis !== "x") return;
      p.x += e.clientX - d.lastX;
      d.lastX = e.clientX;
      d.moved = Math.max(d.moved, Math.abs(e.clientX - d.startX));
      wrap();
      render();
    };

    const onEnd = (e: PointerEvent) => {
      const d = drag.current;
      if (e.pointerId !== d.id) return;
      const pageScrolled = e.type === "pointercancel" && d.axis !== "x";
      if (d.touch && !pageScrolled) {
        hold.current.until = performance.now() + TOUCH_RESUME_MS;
      }
      hold.current.press = false;
      d.id = -1;
      d.axis = "";
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hold.current.hover = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hold.current.hover = false;
    };

    // ── Keyboard: bring the focused film into view and hold still ──
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest<HTMLElement>("[data-video-card]");
      if (!card || !target.matches(":focus-visible")) return;
      hold.current.focus = true;
      // Focus scrolls the nearest scroll box to reveal the card; here the
      // transform does the positioning, so put those scrolls back.
      rail.scrollLeft = 0;
      section.scrollLeft = 0;
      p.v = 0;
      const lo = rail.clientWidth - track.offsetWidth;
      p.x = Math.min(-p.pad, Math.max(lo, p.pad - card.offsetLeft));
      render();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!rail.contains(e.relatedTarget as Node | null)) {
        hold.current.focus = false;
      }
    };

    rail.addEventListener("pointerdown", onDown);
    rail.addEventListener("pointermove", onMove);
    rail.addEventListener("pointerup", onEnd);
    rail.addEventListener("pointercancel", onEnd);
    rail.addEventListener("pointerenter", onEnter);
    rail.addEventListener("pointerleave", onLeave);
    rail.addEventListener("focusin", onFocusIn);
    rail.addEventListener("focusout", onFocusOut);

    // Nothing moves while the section is off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(section);

    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    measure();

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      rail.removeEventListener("pointerdown", onDown);
      rail.removeEventListener("pointermove", onMove);
      rail.removeEventListener("pointerup", onEnd);
      rail.removeEventListener("pointercancel", onEnd);
      rail.removeEventListener("pointerenter", onEnter);
      rail.removeEventListener("pointerleave", onLeave);
      rail.removeEventListener("focusin", onFocusIn);
      rail.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useGSAP(
    () => {
      // fromTo, not from: a ScrollTrigger refresh mid-tween re-applies a
      // from-tween's start values and can strand an element at opacity 0.
      gsap.fromTo(
        "[data-video-head]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
      gsap.fromTo(
        railRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: railRef.current, start: "top 85%" },
        },
      );
    },
    { scope: sectionRef },
  );

  // Modal: entrance, Escape, arrow-key paging, scroll lock
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight")
        setOpenIndex((i) => ((i ?? 0) + 1) % REVIEWS.length);
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => ((i ?? 0) - 1 + REVIEWS.length) % REVIEWS.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const panel = modalRef.current?.querySelector("[data-modal-panel]");
    if (panel) {
      gsap.fromTo(
        panel,
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
      );
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  const current = openIndex === null ? null : REVIEWS[openIndex];

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className={`overflow-hidden py-20 md:py-36 ${T.section}`}
    >
      {/* Left-set like every other section head: the films make the case,
          the heading only introduces them. English title, Korean support
          line — the one pattern every section now follows. */}
      <div className="mb-12 px-6 md:mb-20 md:px-[80px]">
        <div data-video-head>
          <p className="eyebrow-tag">Real Review</p>
        </div>
        <h2
          data-video-head
          className="mt-5 font-display type-h2 font-medium text-ink"
        >
          The Difference
          <br />
          Real Users Noticed First.
        </h2>
        <p data-video-head className="mt-6 type-sub text-mute">
          직접 써본 사람들이 먼저 알아본 차이
        </p>
      </div>

      {/* Film rail — drifts right to left, loops without end, full bleed.
          Held still under a mouse, while dragged, for three seconds after a
          finger lets go, while a card has keyboard focus, and while a film
          plays. overflow-x: clip rather than hidden, so it is not a scroll box
          that focus could shift behind the transform's back. */}
      <div
        ref={railRef}
        className="cursor-grab touch-pan-y select-none overflow-x-clip active:cursor-grabbing"
      >
        <div
          ref={trackRef}
          className="flex w-max gap-4 pl-6 will-change-transform md:pl-[80px] lg:gap-8"
        >
          {Array.from({ length: COPIES }, (_, copy) =>
            REVIEWS.map((review, i) => (
              <VideoCard
                key={`${copy}-${review.src}`}
                review={review}
                index={i}
                real={copy === 1}
                onOpen={() => setOpenIndex(i)}
                suppressClick={suppressClick}
              />
            )),
          )}
        </div>
      </div>

      {/* Video Modal */}
      {current && openIndex !== null && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/85 p-6 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
          role="dialog"
          aria-modal
        >
          <div
            data-modal-panel
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[9/16] overflow-hidden bg-black shadow-2xl">
              <video
                key={current.src}
                src={current.src}
                poster={current.poster}
                autoPlay
                loop
                controls
                playsInline
                className="absolute inset-0 z-10 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/40">
                <Volume2 className="h-8 w-8" strokeWidth={1.2} />
                <span className="eyebrow">
                  VIDEO PLACEHOLDER — {current.src}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 text-white">
              <div className="min-w-0">
                <p className={`${META} text-white/60`} style={META_TRACK}>
                  {reviewLabel(openIndex)}
                </p>
                {/* Two lines rather than an ellipsis: beside the controls on a
                    phone, one line cut the longest title to "…5분". */}
                <p className="mt-1 line-clamp-2 break-keep type-body-sm font-semibold">
                  {current.title}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="mr-1 type-caption tabular-nums text-white/50">
                  {openIndex + 1} / {REVIEWS.length}
                </span>
                <button
                  aria-label="Previous video"
                  onClick={() =>
                    setOpenIndex(
                      (openIndex - 1 + REVIEWS.length) % REVIEWS.length
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  aria-label="Next video"
                  onClick={() => setOpenIndex((openIndex + 1) % REVIEWS.length)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  aria-label="Close video"
                  onClick={() => setOpenIndex(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
