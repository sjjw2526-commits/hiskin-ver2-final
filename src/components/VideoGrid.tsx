"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Play, Volume2, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Add or remove entries freely — the rail, the counter and the modal's
 * prev/next all read from this list. Drop the matching file into
 * /public/videos with the same name and it plays; until then the card
 * shows a placeholder.
 *
 * 영상 넣는 법: `npm run video -- "<원본파일>" <슬롯번호>`
 *
 * ⚠️ review-01·02 를 뺀 나머지 handle·caption 은 아직 지어낸 자리표시입니다.
 *    영상을 채울 때 실제 계정명·문구로 같이 바꿔야 합니다.
 */
type Review = {
  src: string;
  /** 재생 전 정지 컷 (/videos/review-NN.jpg). 없으면 카드가 검게 비어 보입니다 */
  poster?: string;
  handle: string;
  caption: string;
};

const REVIEWS: Review[] = [
  {
    // 실제 촬영본. 메이크업 아티스트 리뷰 (2026-08-30 교체).
    // handle 은 본인 인스타 계정을 받으면 "@..." 로 바꾸세요.
    // 이름을 그대로 노출하지 않은 건 본인 동의를 받은 적이 없어서입니다.
    src: "/videos/review-01.mp4",
    poster: "/videos/review-01.jpg",
    handle: "메이크업 아티스트",
    caption: "HISKIN 리얼 리뷰 — 은은한 핑크빛 톤업",
  },
  {
    // 실제 영상이 들어간 유일한 슬롯. handle 은 아직 자리표시입니다.
    src: "/videos/review-02.mp4",
    // 재생 전에 보이는 정지 컷. 없으면 카드가 검게 비어 보입니다.
    poster: "/videos/review-02.jpg",
    handle: "@sunny.beautylog",
    caption: "하이스킨 데일리 선크림 제품 소개",
  },
  {
    src: "/videos/review-03.mp4",
    poster: "/videos/review-03.jpg",
    handle: "@k.skin_lab",
    caption: "민감성 피부 2주 사용 솔직 후기",
  },
  {
    src: "/videos/review-04.mp4",
    poster: "/videos/review-04.jpg",
    handle: "@daily.uv.diary",
    caption: "한여름 8시간 지속력 테스트",
  },
  {
    src: "/videos/review-05.mp4",
    poster: "/videos/review-05.jpg",
    handle: "@minz_cosmetic",
    caption: "파운데이션 없이 출근한 날",
  },
  {
    src: "/videos/review-06.mp4",
    poster: "/videos/review-06.jpg",
    handle: "@seoul.skinnote",
    caption: "속건조 없는 촉촉 마무리감",
  },
  {
    src: "/videos/review-07.mp4",
    handle: "@beauty.editor.h",
    caption: "에디터가 고른 데일리 선크림",
  },
  {
    src: "/videos/review-08.mp4",
    handle: "@clinic.aesthetic",
    caption: "시술 후에도 쓸 수 있나요?",
  },
];

function VideoCard({
  review,
  index,
  onOpen,
  suppressClick,
}: {
  review: (typeof REVIEWS)[number];
  index: number;
  onOpen: () => void;
  suppressClick: () => boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  // The load error can fire before React hydrates (onError never runs),
  // so re-check the network state on mount. (3 = NETWORK_NO_SOURCE)
  useEffect(() => {
    const check = () => {
      if (videoRef.current?.networkState === 3) setHasVideo(false);
    };
    check();
    const t = setTimeout(check, 800);
    return () => clearTimeout(t);
  }, []);

  const play = () => {
    videoRef.current?.play().catch(() => {});
  };
  const pause = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <button
      data-video-card
      onMouseEnter={play}
      onMouseLeave={pause}
      onClick={() => {
        if (suppressClick()) return;
        onOpen();
      }}
      className="group relative aspect-[9/16] w-[75%] shrink-0 snap-start overflow-hidden bg-gradient-to-b from-[#ececea] to-[#dcdcd8] text-left sm:w-[38%] lg:w-[26.5%]"
      aria-label={`Play review video: ${review.caption}`}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          src={review.src}
          poster={review.poster}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setHasVideo(false)}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink/30">
          <Play className="h-8 w-8" strokeWidth={1.2} />
          <span className="eyebrow !tracking-[0.2em]">
            VIDEO {String(index + 1).padStart(2, "0")} · 9:16
          </span>
        </div>
      )}

      {/* Gradient + meta */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16">
        <p className="type-body-sm font-semibold text-white">{review.handle}</p>
        <p className="mt-1 type-caption text-white/70">
          {review.caption}
        </p>
      </div>

      {/* Play badge */}
      <div className="pointer-events-none absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:opacity-100">
        <Play className="ml-0.5 h-4 w-4 fill-ink text-ink" />
      </div>
    </button>
  );
}

export default function VideoGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Drag-to-scroll state; also used to swallow the click that ends a drag
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  const readRail = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setProgress(max > 0 ? rail.scrollLeft / max : 0);
    setAtStart(rail.scrollLeft <= 2);
    setAtEnd(rail.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    readRail();
    window.addEventListener("resize", readRail);
    return () => window.removeEventListener("resize", readRail);
  }, [readRail]);

  // Driven by hand rather than scrollBy({behavior:"smooth"}): mandatory snap
  // cancels the browser's own smooth scroll, which left every arrow press
  // landing one click late.
  const step = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-video-card]");
    const by = (card?.offsetWidth ?? rail.clientWidth * 0.3) + 12;
    const max = rail.scrollWidth - rail.clientWidth;
    const to = Math.min(max, Math.max(0, rail.scrollLeft + by * dir));
    gsap.to(rail, {
      scrollLeft: to,
      duration: 0.55,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const rail = railRef.current;
    if (!rail) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: rail.scrollLeft,
      moved: 0,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    rail.scrollLeft = drag.current.startLeft - dx;
  };
  const endDrag = () => {
    drag.current.active = false;
  };
  // A card click that ends a drag should not open the modal
  const suppressClick = () => drag.current.moved > 6;

  useGSAP(
    () => {
      gsap.from("[data-video-head]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
      gsap.from("[data-video-card]", {
        opacity: 0,
        y: 70,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: railRef.current, start: "top 85%" },
      });
    },
    { scope: sectionRef }
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
      className="overflow-hidden py-16 md:py-36"
    >
      <div className="px-6 md:px-[80px]">
        <div className="mb-8 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-video-head className="eyebrow-tag mb-5">
              K-Beauty Social Proof
            </p>
            <h2
              data-video-head
              className="font-display type-h2 font-semibold"
            >
              Proven in Korea. Loved by Thousands.
            </h2>
          </div>

          <div data-video-head className="flex items-center gap-3">
            <span className="mr-2 type-caption text-mute">
              {REVIEWS.length} reviews
            </span>
            <button
              onClick={() => step(-1)}
              disabled={atStart}
              aria-label="Previous reviews"
              className="flex h-11 w-11 items-center justify-center border border-hairline transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
            </button>
            <button
              onClick={() => step(1)}
              disabled={atEnd}
              aria-label="More reviews"
              className="flex h-11 w-11 items-center justify-center border border-hairline transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>

      {/* Rail — drag, arrows, snap. It only overflows horizontally, so the
          wheel is deliberately left to the page: locking it here would trap a
          vertical scroll on a strip that fills most of the viewport. */}
      <div
        ref={railRef}
        onScroll={readRail}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        // Inset by margin rather than padding: padding would leave the
        // scrollport itself spanning the full window, so cards bled past the
        // right margin every other section keeps.
        // Proximity, not mandatory: mandatory has no snap point at the far end,
        // so it kept bouncing back and the last review could never be reached.
        className="no-scrollbar flex cursor-grab snap-x snap-proximity gap-[12px] overflow-x-auto mx-6 pb-2 active:cursor-grabbing md:mx-[80px]"
      >
        {REVIEWS.map((review, i) => (
          <VideoCard
            key={review.src}
            review={review}
            index={i}
            onOpen={() => setOpenIndex(i)}
            suppressClick={suppressClick}
          />
        ))}
      </div>

      {/* Progress line */}
      <div className="mt-8 px-6 md:px-[80px]">
        <div className="h-px w-full bg-hairline">
          <div
            className="h-px bg-ink transition-[width,transform] duration-150"
            style={{
              width: `${100 / REVIEWS.length}%`,
              transform: `translateX(${progress * (REVIEWS.length - 1) * 100}%)`,
            }}
          />
        </div>
      </div>

      {/* Video Modal */}
      {current && (
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
                <p className="truncate type-body-sm font-semibold">
                  {current.handle}
                </p>
                <p className="truncate type-caption text-white/60">
                  {current.caption}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="mr-1 type-caption tabular-nums text-white/50">
                  {(openIndex ?? 0) + 1} / {REVIEWS.length}
                </span>
                <button
                  aria-label="Previous video"
                  onClick={() =>
                    setOpenIndex(
                      ((openIndex ?? 0) - 1 + REVIEWS.length) % REVIEWS.length
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  aria-label="Next video"
                  onClick={() =>
                    setOpenIndex(((openIndex ?? 0) + 1) % REVIEWS.length)
                  }
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
