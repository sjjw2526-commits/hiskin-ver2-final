"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, X, ZoomIn } from "lucide-react";

/**
 * The two ISO test reports, published as page images rather than PDFs.
 *
 * Rasterising is not a convenience here, it is the point. The ACTIVE
 * INGREDIENT table on page 5 of each report lists the UV filters with
 * their exact concentrations — the formula. A black box laid over PDF text
 * hides nothing: the numbers stay in the text layer and come straight back
 * out with a copy-paste. The pages are therefore rendered to images and the
 * percentages painted out before export, so there is no file to hand over
 * and nothing left to extract. See the redaction note in the build script
 * comments; the "(%)" header is deliberately left in place so a buyer reads
 * "withheld", not "never measured".
 *
 * Nothing loads until a report is opened, and then only the page on screen
 * plus the one after it. A visitor who never opens this pays nothing for it —
 * which matters, since the buyer-facing complaint we are answering was about
 * page weight.
 */

type Report = {
  id: "spf" | "pa";
  /** English title, as printed on the cover */
  title: string;
  subtitle: string;
  pages: number;
  meta: { label: string; value: string }[];
};

/* Every value below is read off the report covers and summary pages. */
const REPORTS: Report[] = [
  {
    id: "spf",
    title: "SPF Test Report",
    subtitle: "인체적용시험 · 자외선차단지수",
    pages: 11,
    meta: [
      { label: "Study No.", value: "SMC-260731-9077_EN" },
      { label: "시험기관", value: "세명대학교 화장품임상연구센터" },
      { label: "규격", value: "ISO 24444:2019 / AMD 1:2022" },
      { label: "결과", value: "SPF 69.0 ± 9.4" },
      { label: "완료일", value: "2026.07.31" },
    ],
  },
  {
    id: "pa",
    title: "In Vitro PA Test Report",
    subtitle: "인체외시험 · UVA 차단지수",
    pages: 13,
    meta: [
      { label: "Study No.", value: "SMC-260731-9090_EN" },
      { label: "시험기관", value: "세명대학교 화장품임상연구센터" },
      { label: "규격", value: "ISO 24443:2021" },
      { label: "결과", value: "UVA-PF 23.33 ± 0.70" },
      { label: "완료일", value: "2026.07.31" },
    ],
  },
];

const pageSrc = (id: string, n: number) =>
  `/docs/reports/${id}-${String(n).padStart(2, "0")}.jpg`;

export default function TestReports() {
  const [openId, setOpenId] = useState<Report["id"] | null>(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const report = REPORTS.find((r) => r.id === openId) ?? null;

  const open = (id: Report["id"]) => {
    setOpenId(id);
    setPage(1);
    setZoom(false);
    setLoaded(false);
  };

  // A page change is a new image: drop the zoom and the loaded flag together,
  // or the next sheet appears already scrolled and mid-fade.
  const goto = (n: number) => {
    if (!report) return;
    setPage(((n - 1 + report.pages) % report.pages) + 1);
    setZoom(false);
    setLoaded(false);
  };

  // Keyboard paging, Escape, scroll lock, entrance — same contract as the
  // certificate lightbox so the two viewers behave identically.
  useEffect(() => {
    if (!report) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowRight") goto(page + 1);
      if (e.key === "ArrowLeft") goto(page - 1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const panel = modalRef.current?.querySelector("[data-report-panel]");
    if (panel) {
      gsap.fromTo(
        panel,
        { opacity: 0, scale: 0.94, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
      );
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, page]);

  return (
    <>
      {/* ── Trigger card ──────────────────────────────────────
          One wide bar under the two chart cards: the numbers make the
          claim, this is where the claim is backed. Same border, padding
          and 12px gutter as every other card in the section. */}
      <div
        data-clin-grid
        className="mt-[12px] border border-black/[0.08] p-7 md:p-9"
      >
        <p className="eyebrow-tag mb-5">Test Reports</p>
        <h3 className="font-display type-h3 font-semibold text-ink">
          시험성적서 원문
        </h3>
        <p className="mt-2 type-body text-mute">
          세명대학교 화장품임상연구센터가 발행한 영문 성적서 전문을 페이지
          단위로 확인하실 수 있습니다.
        </p>

        <div className="mt-7 grid gap-[12px] md:grid-cols-2">
          {REPORTS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => open(r.id)}
              className="group flex items-center justify-between gap-5 border border-black/[0.12] px-6 py-5 text-left transition-colors duration-300 hover:border-ink hover:bg-ink"
            >
              <span className="min-w-0">
                <span className="block font-display type-body font-semibold text-ink transition-colors duration-300 group-hover:text-white">
                  {r.title}
                </span>
                <span className="mt-1 block type-caption text-mute transition-colors duration-300 group-hover:text-white/60">
                  {r.subtitle} · 영문 {r.pages}쪽
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-mute transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        <p className="mt-7 type-caption text-mute">
          ※ 원료 함량(%)은 영업비밀 보호를 위해 가림 처리했습니다. 시험기관 ·
          시험규격 · 측정값 등 시험의 근거가 되는 항목은 모두 원본 그대로입니다.
        </p>
      </div>

      {/* ── Viewer ───────────────────────────────────────────── */}
      {report && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/88 p-5 backdrop-blur-sm md:p-10"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-modal
          aria-label={report.title}
        >
          <div
            data-report-panel
            /* Phone stacks sheet over metadata, and on a short handset the
               two together exceed the viewport — without the scroll the
               overflow is taken off the top and the first page loses its
               header. Desktop is a row and never reaches this. */
            className="no-scrollbar relative flex max-h-full w-full max-w-5xl flex-col gap-6 overflow-y-auto md:flex-row md:items-stretch md:overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* The sheet. Height-driven so an A4 page stays A4 instead of
                being letterboxed into whatever width is left over. */}
            {/* min-w-0 is load-bearing: a flex item defaults to min-width:auto,
                so the zoomed sheet would grow to its 1190px content width and
                shove the metadata column — and with it the paging controls —
                off the right edge of the screen. */}
            <div className="flex min-h-0 min-w-0 flex-1 shrink-0 items-center justify-center">
              <div
                className={`h-[46svh] bg-white p-2 shadow-2xl md:h-[76vh] md:p-3 ${
                  zoom ? "w-full overflow-auto" : "max-w-full"
                }`}
              >
                <img
                  key={pageSrc(report.id, page)}
                  src={pageSrc(report.id, page)}
                  alt={`${report.title} ${page}쪽`}
                  onLoad={() => setLoaded(true)}
                  onClick={() => setZoom((z) => !z)}
                  draggable={false}
                  className={`transition-opacity duration-300 ${
                    loaded ? "opacity-100" : "opacity-0"
                  } ${
                    zoom
                      ? "w-[1190px] max-w-none cursor-zoom-out"
                      : "h-full w-auto cursor-zoom-in"
                  }`}
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="flex shrink-0 flex-col text-white md:w-[300px]">
              <p className="type-caption font-semibold uppercase tracking-[0.08em] text-rose">
                {report.subtitle}
              </p>
              <h3 className="mt-3 font-display type-h3 font-semibold">
                {report.title}
              </h3>

              <dl className="mt-7 border-t border-white/15 pt-5 type-caption">
                {report.meta.map((m) => (
                  <div key={m.label} className="flex justify-between gap-5 py-2">
                    <dt className="shrink-0 text-white/45">{m.label}</dt>
                    <dd className="text-right">{m.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-6 flex items-center gap-2 type-caption text-white/40">
                <ZoomIn className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                문서를 누르면 확대됩니다
              </p>

              {/* Phone puts the paging controls directly under the sheet:
                  stacked, the metadata list is long enough to push them past
                  the fold, and a reader who cannot see "next" assumes there
                  is only one page. Desktop keeps them pinned to the bottom
                  of the metadata column. */}
              <div className="order-first mb-4 flex items-center gap-2 md:order-none md:mb-0 md:mt-auto md:pt-7">
                <span className="mr-1 type-caption tabular-nums text-white/45">
                  {page} / {report.pages}
                </span>
                <button
                  aria-label="이전 페이지"
                  onClick={() => goto(page - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  aria-label="다음 페이지"
                  onClick={() => goto(page + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  aria-label="닫기"
                  onClick={() => setOpenId(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Warms the next page so paging forward is instant. Kept out of
              the DOM flow rather than preloaded via <link>, which a static
              export cannot generate per-page. */}
          {page < report.pages && (
            <img
              src={pageSrc(report.id, page + 1)}
              alt=""
              aria-hidden
              className="pointer-events-none absolute h-px w-px opacity-0"
            />
          )}
        </div>
      )}
    </>
  );
}
