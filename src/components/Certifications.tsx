"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Download, Maximize2, X } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

gsap.registerPlugin(ScrollTrigger);

type Doc = {
  tag: string;
  title: string;
  /** 명의자 — 공장 인증과 등록·연구소 서류의 법인이 다르므로 명시합니다 */
  holder: string;
  org: string;
  no: string;
  /** 발급일 / 유효기간 */
  date: string;
  /** 라이트박스에만 나오는 부가 항목 */
  detail?: string;
  /** /public/images/{img}.jpg */
  img: string;
  /** /public/docs/{pdf} — 파일이 실제로 있을 때만 다운로드 버튼이 뜹니다 */
  pdf: string;
};

/* 값은 전부 스캔본 원문에서 읽은 것입니다. 숫자를 고칠 일이 생기면
   public/images/cert_*.jpg 를 열어 대조하세요. */
const DOCS: Doc[] = [
  {
    tag: "Manufacturing Standard",
    title: "ISO 22716 우수화장품 제조 인증",
    holder: "주식회사 지디엠",
    org: "ICR (International Certification Registrar)",
    no: "GM003270",
    date: "2026.03.27 ~ 2029.03.26",
    detail: "앰플·토너·크림·로션·에센스·폼클렌저·마스크팩 등 연구개발·생산·판매",
    img: "cert_iso22716",
    pdf: "cert_iso22716.pdf",
  },
  {
    tag: "Regulatory Approval",
    title: "화장품 제조업 등록필증",
    holder: "에스엘코스메틱(주)",
    org: "경인지방식품의약품안전청",
    no: "제4906호",
    date: "2020.09.02",
    detail: "직접 제조 + 위탁 제조 영업 등록",
    img: "cert_mfg_license",
    pdf: "cert_mfg_license.pdf",
  },
  {
    tag: "Patented Formulation",
    title: "항산화 / 항염 천연 추출물 조성물 특허",
    holder: "이인철",
    org: "대한민국 특허청",
    no: "제10-2533040호",
    date: "2023.05.11 등록 (출원 2021.08.03)",
    detail: "출원번호 제10-2021-0101725호",
    img: "cert_patent",
    pdf: "cert_patent.pdf",
  },
  {
    tag: "R&D Infrastructure",
    title: "기업부설연구소 인정서",
    holder: "에스엘코스메틱(주) 연구소",
    org: "과학기술정보통신부 · KOITA",
    no: "제2021111420호",
    date: "2022.03.15 (최초 인정 2021.03.10)",
    img: "cert_rnd_lab",
    pdf: "cert_rnd_lab.pdf",
  },
  {
    tag: "Certificate of Analysis",
    title: "글로벌 성분 분석 성적서 (VILAS 997)",
    holder: "HISKIN SunCream",
    org: "IRDOP · ilac-MRA 인정 시험소",
    no: "PPT25s211403-659CHL",
    date: "2025.09.06",
    detail: "Glutathione 1.75mg/g · Collagen 142.15mg/100g · SPF 50+ / PA++++",
    img: "cert_irdop_analysis",
    pdf: "cert_irdop_analysis.pdf",
  },
];

/**
 * Section 06.6 — the paperwork wall.
 *
 * Five A4 scans a buyer's compliance team will want to open full-size, so
 * the thumbnails are deliberately unreadable and every card is a lightbox
 * trigger. Download buttons only render for PDFs that actually exist —
 * a HEAD probe on mount beats shipping five 404 links.
 */
export default function Certifications() {
  const sectionRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [havePdf, setHavePdf] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    Promise.all(
      DOCS.map((d) =>
        fetch(`/docs/${d.pdf}`, { method: "HEAD" })
          .then((r) => [d.pdf, r.ok] as const)
          .catch(() => [d.pdf, false] as const)
      )
    ).then((pairs) => {
      if (alive) setHavePdf(Object.fromEntries(pairs));
    });
    return () => {
      alive = false;
    };
  }, []);

  useGSAP(
    () => {
      gsap.from("[data-cert-head]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from("[data-cert-card]", {
        opacity: 0,
        y: 44,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-cert-grid]", start: "top 85%" },
      });
    },
    { scope: sectionRef }
  );

  // Modal: entrance, Escape, arrow paging, scroll lock
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight")
        setOpenIndex((i) => ((i ?? 0) + 1) % DOCS.length);
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => ((i ?? 0) - 1 + DOCS.length) % DOCS.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const panel = modalRef.current?.querySelector("[data-cert-panel]");
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
  }, [openIndex]);

  const current = openIndex === null ? null : DOCS[openIndex];

  return (
    <section
      id="certifications"
      ref={sectionRef}
      className="bg-[#f8f7f4] py-16 md:py-36"
    >
      <div className="px-6 md:px-[80px]">
        <div className="max-w-4xl">
          <p data-cert-head className="eyebrow-tag mb-6">
            Official Accreditations &amp; Legal Compliance
          </p>
          <h2
            data-cert-head
            className="text-display-md font-display font-semibold text-ink"
          >
            Internationally Certified Manufacturing
            <br className="hidden md:block" />
            &amp; Proven Intellectual Property.
          </h2>
          <p
            data-cert-head
            className="mt-7 text-[17.5px] leading-[1.6] text-mute md:text-[19.5px]"
          >
            글로벌 수출 규격과 cGMP 품질 관리 기준을 충족하는 공인 등록 서류 및
            독자 특허 기술.
          </p>
        </div>
      </div>

      {/* ── Document cards ───────────────────────────────────────
          Phone: a swipeable snap rail, so five A4 sheets don't stack into
          an endless column. Tablet: 2 up. Desktop: all five side by side. */}
      <div
        data-cert-grid
        /* Margin, not padding: padding leaves the scrollport full-width and
           snap then shunts the rail past its own inset on load. Same fix the
           review carousel uses. */
        className="no-scrollbar mx-6 mt-10 flex snap-x snap-proximity gap-[12px] overflow-x-auto pb-3 md:mx-[80px] md:mt-20 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-5"
      >
        {DOCS.map((doc, i) => (
          <button
            key={doc.img}
            data-cert-card
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`${doc.title} 크게 보기`}
            className="group w-[74vw] shrink-0 snap-start text-left transition-transform duration-500 ease-out will-change-transform hover:-translate-y-[6px] hover:scale-[1.02] sm:w-[46vw] md:w-auto md:shrink"
          >
            <div className="relative overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow duration-500 group-hover:shadow-[0_18px_44px_-12px_rgba(0,0,0,0.28)]">
              <PlaceholderImage
                name={doc.img}
                alt={doc.title}
                aspect="aspect-[1/1.414]"
                className="w-full"
                fit="contain"
                imgClassName="bg-white"
                label={`${doc.img}.jpg`}
              />
              <span className="pointer-events-none absolute inset-0 border border-black/[0.08]" />
              <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-ink/85 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" strokeWidth={1.6} />
              </span>
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.11em] text-rose">
              {doc.tag}
            </p>
            <h3 className="mt-2 font-display text-[15px] font-semibold leading-snug tracking-tight text-ink">
              {doc.title}
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-mute">
              {doc.holder}
              <br />
              {doc.no}
            </p>
          </button>
        ))}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {current && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/88 p-5 backdrop-blur-sm md:p-10"
          onClick={() => setOpenIndex(null)}
          role="dialog"
          aria-modal
          aria-label={current.title}
        >
          <div
            data-cert-panel
            className="relative flex max-h-full w-full max-w-5xl flex-col gap-6 md:flex-row md:items-stretch"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Document. Sized off viewport height so the white frame stays a
                true A4 sheet rather than a letterboxed box. */}
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="h-[50svh] max-w-full bg-white p-3 shadow-2xl md:h-[74vh] md:p-4">
                <PlaceholderImage
                  name={current.img}
                  alt={current.title}
                  aspect="aspect-[1/1.414]"
                  className="h-full w-auto"
                  fit="contain"
                  imgClassName="bg-white"
                  label={`${current.img}.jpg — 원본 파일 필요`}
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="flex shrink-0 flex-col text-white md:w-[300px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose">
                {current.tag}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight">
                {current.title}
              </h3>

              <dl className="mt-7 border-t border-white/15 pt-5 text-[13px]">
                <div className="flex justify-between gap-5 py-2">
                  <dt className="shrink-0 text-white/45">명의</dt>
                  <dd className="text-right">{current.holder}</dd>
                </div>
                <div className="flex justify-between gap-5 py-2">
                  <dt className="shrink-0 text-white/45">발행기관</dt>
                  <dd className="text-right">{current.org}</dd>
                </div>
                <div className="flex justify-between gap-5 py-2">
                  <dt className="shrink-0 text-white/45">번호</dt>
                  <dd className="text-right">{current.no}</dd>
                </div>
                <div className="flex justify-between gap-5 py-2">
                  <dt className="shrink-0 text-white/45">일자</dt>
                  <dd className="text-right">{current.date}</dd>
                </div>
                {current.detail && (
                  <div className="flex justify-between gap-5 py-2">
                    <dt className="shrink-0 text-white/45">내용</dt>
                    <dd className="text-right">{current.detail}</dd>
                  </div>
                )}
              </dl>

              {havePdf[current.pdf] && (
                <a
                  href={`/docs/${current.pdf}`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="mt-7 inline-flex items-center justify-center gap-2 bg-white px-5 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-rose hover:text-white"
                >
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                  Download PDF
                </a>
              )}

              <div className="mt-auto flex items-center gap-2 pt-7">
                <span className="mr-1 text-xs tabular-nums text-white/45">
                  {(openIndex ?? 0) + 1} / {DOCS.length}
                </span>
                <button
                  aria-label="이전 서류"
                  onClick={() =>
                    setOpenIndex(
                      ((openIndex ?? 0) - 1 + DOCS.length) % DOCS.length
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  aria-label="다음 서류"
                  onClick={() =>
                    setOpenIndex(((openIndex ?? 0) + 1) % DOCS.length)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  aria-label="닫기"
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
