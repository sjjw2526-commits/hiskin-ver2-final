"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, ArrowUpRight, X, ZoomIn } from "lucide-react";

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
  /** The two lines under the title in the list: standard, then institute. */
  standard: string;
  institute: string;
  pages: number;
  meta: { label: string; value: string }[];
};

/* Every value below is read off the report covers and summary pages. */
const REPORTS: Report[] = [
  {
    id: "spf",
    title: "SPF Test Report",
    subtitle: "인체적용시험 · 자외선차단지수",
    standard: "ISO 24444:2019 / AMD 1:2022",
    institute: "Semyung University Cosmetics Clinical Research Center",
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
    standard: "ISO 24443:2021",
    institute: "Semyung University Cosmetics Clinical Research Center",
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
      {/* ── Document list ─────────────────────────────────────
          Its own block after the Test Details accordion, with the same
          small head (label, title, Korean line) and hairline rows. The rows
          are the page's row language, but what they open is a document
          viewer, not a fold — a bare row here startled the owner twice
          (2026-09-15). The spelled-out "VIEW REPORT" with the outward
          arrow is what says "this opens something else"; the earlier
          outlined button cards said it too, but were the one button UI on
          a page that otherwise speaks in space and hairlines. */}
      <div data-clin-block className="mt-16 md:mt-24">
        <p className="type-caption font-medium uppercase tracking-[0.08em] text-mute">
          Documentation
        </p>
        <h3 className="mt-4 font-display type-h2 font-medium text-ink">
          Original Test Reports
        </h3>
        <p className="mt-4 type-sub font-medium text-mute">
          검증의 근거가 되는 시험 원문을
          <br />
          직접 확인할 수 있습니다
        </p>
      </div>

      <div data-clin-block className="mt-8 md:mt-10">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => open(r.id)}
            className="group flex w-full items-center justify-between gap-6 border-b border-hairline py-5 text-left first:border-t md:py-6"
          >
            <span className="min-w-0">
              <span className="block font-display type-row font-normal text-ink">
                {r.title}
              </span>
              <span className="mt-2 block type-body-sm text-mute">
                <span className="block md:inline">{r.standard}</span>
                <span className="hidden md:inline"> · </span>
                <span className="block md:inline">
                  {r.institute} · 영문 {r.pages}쪽
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 type-caption font-medium uppercase tracking-[0.08em] text-ink">
              <span className="max-sm:hidden">View Report</span>
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </span>
          </button>
        ))}

        <div className="mt-8 max-w-2xl">
          <p className="type-caption font-medium uppercase tracking-[0.08em] text-mute">
            Formula Disclosure
          </p>
          <p className="mt-2 type-caption text-mute">
            원료 함량(%)은 영업비밀 보호를 위해 비공개 처리되며,
            시험기관·시험규격·측정값은 원문 그대로 제공됩니다.
          </p>
        </div>
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
