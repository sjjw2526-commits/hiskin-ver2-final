"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import TestReports from "./TestReports";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────
   01 — in-vivo SPF
   ────────────────────────────────────────────────────────────────
   Study SMC-260731-9077_EN, Appendix I, per-subject results.
   Mean 69.03 → 69.0, SD 9.40, mean ITA 49.3°. Straight off the report. */
const SUBJECTS = [
  { panel: 1, ita: 42, spf: 62.9 },
  { panel: 2, ita: 57, spf: 83.3 },
  { panel: 3, ita: 58, spf: 72.4 },
  { panel: 4, ita: 57, spf: 63.0 },
  { panel: 5, ita: 48, spf: 54.7 },
  { panel: 6, ita: 51, spf: 63.0 },
  { panel: 7, ita: 52, spf: 83.3 },
  { panel: 8, ita: 38, spf: 72.4 },
  { panel: 9, ita: 46, spf: 72.4 },
  { panel: 10, ita: 44, spf: 62.9 },
];

const SPF_MEAN = 69.0;
const SPF_SD = 9.4;
const SPF_CI = 6.7; // 95% CI, t = 2.262
const SPF_LABEL_MAX = 50; // 표기 상한선

/* The two lines a buyer actually reads. Every figure here is derived from the
   report above it, not asserted: 69x is the definition of SPF (dose to
   erythema, protected vs bare), 98.6% is 1 - 1/69, and 54.7 is the lowest of
   the ten per-subject values. Recompute these if SUBJECTS ever changes. */
const SPF_TAKEAWAY = [
  {
    strong: "맨 피부 대비 69배",
    rest: "자외선 노출 허용량 — UVB를 98.6% 차단합니다.",
  },
  {
    strong: "피험자 10명 전원 초과",
    rest: "최저값 54.7도 표기 상한 SPF 50을 넘어섰습니다.",
  },
];

/* ISO 24444 wants subjects spread across three ITA° bands. Showing the split
   is what tells a buyer's regulatory reader the panel was actually valid. */
const ITA_BANDS = [
  { band: "28° ~ 40°", n: 1 },
  { band: "41° ~ 55°", n: 6 },
  { band: "56° 초과", n: 3 },
];

/* ────────────────────────────────────────────────────────────────
   02 — in-vitro UVA
   ────────────────────────────────────────────────────────────────
   Study SMC-260731-9090_EN, Appendix I. Four PMMA plates.
   Mean UVA-PF 23.33 ± 0.70, mean λc 377.63 → 377.6. */
const PLATES = [
  { n: 1, uvapf: 22.41, lc: 377.3 },
  { n: 2, uvapf: 23.19, lc: 377.85 },
  { n: 3, uvapf: 23.78, lc: 377.54 },
  { n: 4, uvapf: 23.95, lc: 377.82 },
];

/* 1.46 = 23.33 / 16.0 (the PA++++ floor); 22.41 is the weakest plate; +7.6nm
   is 377.6 - 370, the broad-spectrum floor. All four plates clear both. */
const UVA_TAKEAWAY = [
  {
    strong: "PA++++ 기준의 1.46배",
    rest: "최고 등급 기준치 16.0 대비 실측 23.33입니다.",
  },
  {
    strong: "플레이트 4장 전원 초과",
    rest: "최저값 22.41 · 임계파장도 기준보다 +7.6nm.",
  },
];

/* The report gives λc per plate but not the absorbance spectrum itself, so
   the curve below is a schematic back-solved from the measured λc — the area
   from 290 to 377.6nm is exactly 90% of the area from 290 to 400nm. The page
   labels it as such, and the plate table beneath it carries the real
   figures. Swap this path out if the spectrophotometer output turns up. */
const CURVE_W = 520;
const CURVE_H = 176;
const CURVE_PATH =
  "M0.0 6.0 L11.8 6.0 L23.6 6.0 L35.5 6.1 L47.3 6.1 L59.1 6.1 L70.9 6.2 L82.7 6.2 L94.5 6.3 L106.4 6.4 L118.2 6.5 L130.0 6.6 L141.8 6.7 L153.6 6.9 L165.5 7.1 L177.3 7.4 L189.1 7.7 L200.9 8.2 L212.7 8.7 L224.5 9.3 L236.4 10.0 L248.2 11.0 L260.0 12.1 L271.8 13.4 L283.6 15.1 L295.5 17.1 L307.3 19.4 L319.1 22.2 L330.9 25.5 L342.7 29.4 L354.5 34.0 L366.4 39.1 L378.2 45.0 L390.0 51.5 L401.8 58.7 L413.6 66.4 L425.5 74.6 L437.3 83.0 L449.1 91.5 L460.9 100.0 L472.7 108.2 L484.5 116.0 L496.4 123.2 L508.2 129.9 L520.0 135.9";
const UVA_START_X = 141.8; // 320 nm
const LC_X = 414.1; // 377.6 nm
const LC_Y = 66.7;

type Meta = { label: string; value: string };

/* The head's right-hand block: which standard each rating was tested to,
   and by whom. Straight from the two study reports named above. The
   institute keeps its two-line English name; "\n" is the break. */
const TEST_META: Meta[] = [
  { label: "SPF", value: "ISO 24444:2019 / AMD 1:2022" },
  { label: "UVA", value: "ISO 24443:2021" },
  {
    label: "Institute",
    value: "Semyung University\nCosmetics Clinical Research Center",
  },
];

/* 03 — the conditions each figure was measured under, one column per
   study. Everything is read off the two reports' summary pages. */
const SPF_CONDITIONS: Meta[] = [
  { label: "Study No.", value: "SMC-260731-9077_EN" },
  {
    label: "Test Institution",
    value: "세명대학교 화장품임상연구센터 (ISO 9001:2015 · Q144314)",
  },
  { label: "Standard", value: "ISO 24444:2019 / AMD 1:2022" },
  {
    label: "Panel",
    value: `${SUBJECTS.length}명 · 19~53세 · ITA° 38~58 (평균 49.3°)`,
  },
  { label: "95% CI", value: `69.0 ± ${SPF_CI} — 허용 17% 이내` },
  {
    label: "Control Std.",
    value: "P8 63.3 (43.9~82.3) · P2 16.1 (13.7~18.5)",
  },
  { label: "Test Date", value: "2026.06.22 ~ 07.24 · 07.31 완료" },
];

const UVA_CONDITIONS: Meta[] = [
  { label: "Study No.", value: "SMC-260731-9090_EN" },
  {
    label: "Test Institution",
    value: "세명대학교 화장품임상연구센터 (ISO 9001:2015 · Q144314)",
  },
  { label: "Standard", value: "ISO 24443:2021" },
  {
    label: "Method",
    value: `PMMA 플레이트 ${PLATES.length}장 · 25cm² · 1.3mg/cm²`,
  },
  { label: "95% CI", value: "4.7 — 허용 17% 이내" },
  { label: "Test Date", value: "2026.07.27 ~ 07.31 완료" },
];

function MetaRow({ items }: { items: Meta[] }) {
  return (
    <dl className="mt-4 border-t border-black/[0.08] pt-3">
      {items.map((m) => (
        <div
          key={m.label}
          className="flex items-baseline justify-between gap-6 py-[7px]"
        >
          <dt className="shrink-0 type-caption font-medium uppercase tracking-[0.08em] text-mute">
            {m.label}
          </dt>
          <dd className="text-right type-body-sm text-ink">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Sits between the headline number and the plot: the number alone does not say
 * what it means, and the plot is for the reader who wants to check the number.
 */
function Takeaway({ items }: { items: { strong: string; rest: string }[] }) {
  return (
    <ul className="mt-6 space-y-[9px]">
      {items.map((t) => (
        <li key={t.strong} className="flex gap-2.5 type-body text-mute">
          <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-rose md:mt-[10px]" />
          <span>
            <strong className="font-semibold text-ink">{t.strong}</strong>{" "}
            {t.rest}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* One label treatment for the whole section — the same quiet capitals the
   product specification uses, so the two data sections read as siblings. */
const LABEL = "type-caption font-medium uppercase tracking-[0.08em] text-mute";

/* The three rows of the detail accordion. Order is the order a buyer asks
   the questions: how much, across the whole spectrum, and under what
   conditions. */
const ROWS = [
  { id: "spf", num: "01", title: "SPF Performance" },
  { id: "uva", num: "02", title: "UVA Performance" },
  { id: "conditions", num: "03", title: "Test Conditions" },
] as const;
type RowId = (typeof ROWS)[number]["id"];

/**
 * Section 06.5 — clinical efficacy.
 *
 * Three depths, in the order a buyer reads them. First the label rating
 * (SPF 50+ / PA++++), which is what the tube says and what every competitor
 * also says, with the measured figure beside it — the number that is
 * actually ours. Then, in the Formula section's accordion language, the
 * evidence in three rows: the SPF figure with its per-subject plot and
 * panel table, the UVA figure with its spectral curve and plate table, and
 * the study conditions. Then the original reports (TestReports). Nothing
 * was cut; each depth is one click down from the one above it, so the
 * section stops reading as a lab report pasted whole into a brand page
 * (structure agreed with the owner, 2026-09-15, after an outside critique
 * that the earlier white sheet and button cards broke the page's grammar).
 *
 * Both plots are hand-built SVG rather than a chart library: the point is
 * two specific numbers, and a generic chart would drag in axes, legends and
 * gridlines that fight the rest of the page.
 */
export default function ClinicalData() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<RowId | null>(null);

  // A panel changes height over 600ms; every trigger below it moves with
  // it, so ScrollTrigger is told once the transition has settled.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => clearTimeout(t);
  }, [open]);

  // The counters, dots and line draw play when their row opens, not on
  // scroll: a collapsed panel has no height, so a scroll trigger would fire
  // while it is still shut and the reader would open it to a finished
  // picture. Reverting on close means a reopened row plays again.
  useEffect(() => {
    if (!open) return;
    const panel = sectionRef.current?.querySelector<HTMLElement>(
      `#clinical-panel-${open}`,
    );
    if (!panel) return;
    const ctx = gsap.context(() => {
      // Tweening a proxy and writing textContent avoids React re-rendering
      // 60 times a second.
      panel.querySelectorAll<HTMLElement>("[data-count-to]").forEach((el) => {
        const to = Number(el.dataset.countTo);
        const dp = Number(el.dataset.countDp ?? 1);
        const proxy = { v: 0 };
        gsap.to(proxy, {
          v: to,
          duration: 1.2,
          delay: 0.25,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = proxy.v.toFixed(dp);
          },
        });
      });

      const dots = panel.querySelectorAll("[data-dot]");
      if (dots.length) {
        gsap.fromTo(
          dots,
          { opacity: 0, scale: 0, transformOrigin: "50% 50%" },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: 0.4,
            ease: "back.out(2)",
            stagger: 0.05,
          },
        );
      }

      const curve = panel.querySelector<SVGPathElement>("[data-curve-line]");
      if (curve) {
        const len = curve.getTotalLength();
        gsap.fromTo(
          curve,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            delay: 0.4,
            ease: "power2.inOut",
          },
        );
        gsap.fromTo(
          panel.querySelectorAll("[data-curve-mark]"),
          { opacity: 0 },
          { opacity: 1, duration: 0.6, delay: 1.5, ease: "power2.out" },
        );
      }
    }, panel);
    return () => ctx.revert();
  }, [open]);

  useGSAP(
    () => {
      // fromTo, not from: a ScrollTrigger refresh mid-tween re-applies a
      // from-tween's start values and can strand an element at opacity 0.
      gsap.fromTo(
        "[data-clin-head]",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      gsap.fromTo(
        "[data-clin-block]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-clin-rating]", start: "top 80%" },
        },
      );
    },
    { scope: sectionRef },
  );

  const toggle = (id: RowId) => setOpen((v) => (v === id ? null : id));

  // ── SPF scatter geometry ───────────────────────────────────────
  const PW = 520;
  const PH = 176;
  const ITA_MIN = 36;
  const ITA_MAX = 60;
  const Y_MIN = 45;
  const Y_MAX = 90;
  const px = (ita: number) =>
    26 + ((ita - ITA_MIN) / (ITA_MAX - ITA_MIN)) * (PW - 34);
  const py = (spf: number) =>
    10 + (1 - (spf - Y_MIN) / (Y_MAX - Y_MIN)) * (PH - 30);

  // Same fold as the ingredient accordion, so the two open at the same
  // speed; same staggered rise inside the panel.
  const fold =
    "grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)]";
  const riseFor = (isOpen: boolean) =>
    `transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
      isOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
    }`;
  const at = (isOpen: boolean, step: number) => ({
    transitionDelay: isOpen ? `${160 + step * 80}ms` : "0ms",
  });

  const panelBody = (id: RowId, isOpen: boolean) => {
    const rise = riseFor(isOpen);

    if (id === "spf") {
      return (
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-16">
          <div>
            <div
              className={`flex flex-wrap items-end gap-x-4 gap-y-2 ${rise}`}
              style={at(isOpen, 0)}
            >
              <p className="font-display type-figure font-semibold text-ink tabular-nums">
                <span data-count-to="69.0" data-count-dp="1">
                  0.0
                </span>
              </p>
              <p className="pb-[3px] type-body text-mute tabular-nums">
                ± {SPF_SD.toFixed(1)} · Measured SPF
              </p>
            </div>
            <p
              className={`mt-2 type-caption uppercase tracking-[0.08em] text-mute ${rise}`}
              style={at(isOpen, 0)}
            >
              ISO 24444:2019 / AMD 1:2022 · 인체적용시험 (In-vivo)
            </p>

            <div className={rise} style={at(isOpen, 1)}>
              <Takeaway items={SPF_TAKEAWAY} />
            </div>

            <div className={`mt-10 ${rise}`} style={at(isOpen, 2)}>
              <p className={LABEL}>Panel by ITA°</p>
              <table className="mt-4 w-full border-t border-black/[0.08] type-caption tabular-nums">
                <thead>
                  <tr className="type-caption uppercase tracking-[0.08em] text-mute">
                    <th className="py-2 text-left font-medium">ITA° 구간</th>
                    <th className="py-2 text-right font-medium">피험자</th>
                  </tr>
                </thead>
                <tbody>
                  {ITA_BANDS.map((b) => (
                    <tr key={b.band} className="border-t border-black/[0.05]">
                      <td className="py-[6px] text-left text-mute">{b.band}</td>
                      <td className="py-[6px] text-right text-ink">{b.n}명</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-subject scatter */}
          <figure data-plot-spf className={rise} style={at(isOpen, 1)}>
            {/* Sizes below are viewBox units, not screen pixels, so they
                are outside the type scale by necessity: the SVG scales
                with its container. The mobile value is the larger of the
                two because a narrow viewBox scales down further. */}
            <svg
              viewBox={`0 0 ${PW} ${PH}`}
              className="h-auto w-full overflow-visible [&_text]:text-[17px] md:[&_text]:text-[10px]"
              role="img"
              aria-label={`인체적용시험 피험자 ${SUBJECTS.length}명의 개인별 SPF 실측값. 평균 ${SPF_MEAN}, 표준편차 ${SPF_SD}.`}
            >
              {/* ±1 SD band */}
              <rect
                x={26}
                y={py(SPF_MEAN + SPF_SD)}
                width={PW - 34}
                height={py(SPF_MEAN - SPF_SD) - py(SPF_MEAN + SPF_SD)}
                className="fill-rose/[0.09]"
              />
              {/* mean */}
              <line
                x1={26}
                x2={PW}
                y1={py(SPF_MEAN)}
                y2={py(SPF_MEAN)}
                className="stroke-rose"
                strokeWidth={1}
              />
              {/* SPF 50 label ceiling */}
              <line
                x1={26}
                x2={PW}
                y1={py(SPF_LABEL_MAX)}
                y2={py(SPF_LABEL_MAX)}
                className="stroke-ink/30"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              {/* y ticks */}
              {[50, 69, 90].map((v) => (
                <text
                  key={v}
                  x={0}
                  y={py(v) + 3.5}
                  className="fill-mute tabular-nums"
                >
                  {v}
                </text>
              ))}
              {/* baseline axis */}
              <line
                x1={26}
                x2={PW}
                y1={PH - 18}
                y2={PH - 18}
                className="stroke-black/[0.12]"
                strokeWidth={1}
              />
              {SUBJECTS.map((s) => (
                <g key={s.panel} data-dot>
                  <line
                    x1={px(s.ita)}
                    x2={px(s.ita)}
                    y1={py(s.spf)}
                    y2={PH - 18}
                    className="stroke-black/[0.13]"
                    strokeWidth={1}
                  />
                  <circle
                    cx={px(s.ita)}
                    cy={py(s.spf)}
                    r={4.5}
                    className="fill-ink"
                  />
                  <title>{`피험자 ${s.panel} · ITA ${s.ita}° · SPF ${s.spf}`}</title>
                </g>
              ))}
              {/* x ticks */}
              {[38, 58].map((v) => (
                <text
                  key={v}
                  x={px(v)}
                  y={PH - 4}
                  textAnchor="middle"
                  className="fill-mute tabular-nums"
                >
                  ITA {v}°
                </text>
              ))}
            </svg>
            <figcaption className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 type-caption text-mute">
              <span className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-ink" />
                피험자 {SUBJECTS.length}명 개인별 SPF 실측값
              </span>
              <span className="flex items-center gap-2">
                <span className="h-[2px] w-4 bg-rose" />
                평균 {SPF_MEAN.toFixed(1)}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-[2px] w-4 border-t border-dashed border-ink/40" />
                표기 상한 SPF 50
              </span>
            </figcaption>
          </figure>
        </div>
      );
    }

    if (id === "uva") {
      return (
        <div className="grid gap-10 md:grid-cols-2 md:gap-x-16">
          <div>
            <div
              className={`flex flex-wrap items-end gap-x-4 gap-y-2 ${rise}`}
              style={at(isOpen, 0)}
            >
              <p className="font-display type-figure font-semibold text-ink tabular-nums">
                <span data-count-to="23.33" data-count-dp="2">
                  0.00
                </span>
              </p>
              <p className="pb-[3px] type-body text-mute tabular-nums">
                ± 0.70 · Measured UVA-PF
              </p>
            </div>
            <p
              className={`mt-2 type-caption uppercase tracking-[0.08em] text-mute ${rise}`}
              style={at(isOpen, 0)}
            >
              ISO 24443:2021 · 인체외시험 (In-vitro)
            </p>

            <div className={rise} style={at(isOpen, 1)}>
              <Takeaway items={UVA_TAKEAWAY} />
            </div>

            <div className={`mt-10 ${rise}`} style={at(isOpen, 2)}>
              <p className={LABEL}>Plate Measurements</p>
              <table className="mt-4 w-full border-t border-black/[0.08] type-caption tabular-nums">
                <thead>
                  <tr className="type-caption uppercase tracking-[0.08em] text-mute">
                    <th className="py-2 text-left font-medium">Plate</th>
                    <th className="py-2 text-right font-medium">UVA-PF</th>
                    <th className="py-2 text-right font-medium">λc (nm)</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATES.map((p) => (
                    <tr key={p.n} className="border-t border-black/[0.05]">
                      <td className="py-[6px] text-left text-mute">#{p.n}</td>
                      <td className="py-[6px] text-right text-ink">
                        {p.uvapf.toFixed(2)}
                      </td>
                      <td className="py-[6px] text-right text-ink">
                        {p.lc.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Spectral absorbance */}
          <figure data-plot-uva className={rise} style={at(isOpen, 1)}>
            <svg
              viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
              className="h-auto w-full overflow-visible [&_text]:text-[17px] md:[&_text]:text-[10px]"
              role="img"
              aria-label="290nm에서 400nm까지의 흡광 곡선 모식도. 측정된 임계파장 377.6nm."
            >
              {/* UVA band */}
              <rect
                x={UVA_START_X}
                y={0}
                width={CURVE_W - UVA_START_X}
                height={CURVE_H - 18}
                className="fill-black/[0.028]"
              />
              {/* Both labels sit low and left, in the wedge the curve
                  leaves empty. The absorbance line runs flat across the
                  top and only falls away on the right, so anything set
                  near the top of the band is printed straight over it. */}
              <text
                x={UVA_START_X + 8}
                y={CURVE_H - 26}
                className="fill-mute font-semibold uppercase"
                style={{ letterSpacing: "0.1em" }}
              >
                UVA 320–400nm
              </text>
              {/* critical wavelength */}
              <g data-curve-mark>
                <line
                  x1={LC_X}
                  x2={LC_X}
                  y1={LC_Y}
                  y2={CURVE_H - 18}
                  className="stroke-rose"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
                <circle cx={LC_X} cy={LC_Y} r={4.5} className="fill-rose" />
                <text
                  x={LC_X - 12}
                  y={LC_Y + 30}
                  textAnchor="end"
                  className="fill-rose font-semibold tabular-nums"
                >
                  λc = 377.6nm
                </text>
              </g>
              {/* baseline */}
              <line
                x1={0}
                x2={CURVE_W}
                y1={CURVE_H - 18}
                y2={CURVE_H - 18}
                className="stroke-black/[0.12]"
                strokeWidth={1}
              />
              <path
                data-curve-line
                d={CURVE_PATH}
                fill="none"
                className="stroke-ink"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[
                { l: 290, x: 0, anchor: "start" as const },
                { l: 320, x: UVA_START_X, anchor: "middle" as const },
                { l: 400, x: CURVE_W, anchor: "end" as const },
              ].map((t) => (
                <text
                  key={t.l}
                  x={t.x}
                  y={CURVE_H - 4}
                  textAnchor={t.anchor}
                  className="fill-mute tabular-nums"
                >
                  {t.l}nm
                </text>
              ))}
            </svg>
            <figcaption className="mt-4 type-caption text-mute">
              임계파장 377.6nm — 광범위 자외선 차단 기준(370nm 이상)을
              충족합니다. 곡선은 측정된 임계파장을 기준으로 재구성한
              모식도이며, 왼쪽 표가 PMMA 플레이트 4장의 실측값입니다.
            </figcaption>
          </figure>
        </div>
      );
    }

    // 03 — conditions, one column per study.
    return (
      <div className="grid gap-10 md:grid-cols-2 md:gap-x-16">
        <div className={rise} style={at(isOpen, 0)}>
          <p className={LABEL}>SPF · In-vivo</p>
          <MetaRow items={SPF_CONDITIONS} />
        </div>
        <div className={rise} style={at(isOpen, 1)}>
          <p className={LABEL}>UVA · In-vitro</p>
          <MetaRow items={UVA_CONDITIONS} />
        </div>
      </div>
    );
  };

  return (
    <section
      id="clinical"
      ref={sectionRef}
      // Grey with the certificates below: the two are one block of evidence.
      className="bg-paper-alt px-6 py-16 md:px-[80px] md:py-36"
    >
      {/* ── Heading ──────────────────────────────────────────────
          Three steps of hierarchy (owner, 2026-09-14): the big message on
          the left at the statement step, a small block of test metadata
          on the right where the head used to run empty, and the results
          below. The right block is deliberately the quietest type in the
          section — caption labels over body-small values — so the title
          keeps the room. Below xl the metadata stacks under the title. */}
      {/* items-start: the metadata label sits on the eyebrow's line, so the
          two columns share a top edge. Bottom-aligned, the label floated
          above the eyebrow and the head read as misaligned (owner,
          2026-09-15). */}
      <div className="xl:grid xl:grid-cols-12 xl:items-start xl:gap-x-16">
        <div className="max-w-3xl xl:col-span-7">
          <p data-clin-head className="eyebrow-tag mb-6">
            Tested &amp; Verified
          </p>
          <h2
            data-clin-head
            className="type-statement font-display font-semibold text-ink"
          >
            Verified by
            <br />
            International Standard Testing.
          </h2>
          <p
            data-clin-head
            className="mt-7 type-statement-sub font-medium text-mute md:mt-9"
          >
            세명대학교 화장품임상연구센터에서
            <br />
            국제 표준 시험법을 기반으로 확인했습니다
          </p>
        </div>

        <div
          data-clin-head
          // xl:mt-[7px]: the caption label sits in a shorter line box than
          // the eyebrow, so the two text centres meet only with this nudge.
          className="mt-12 max-w-sm xl:col-span-4 xl:col-start-9 xl:mt-[7px] xl:max-w-none"
        >
          <p className="type-caption font-medium uppercase tracking-[0.08em] text-mute">
            Independent Testing
          </p>
          <dl className="mt-3">
            {TEST_META.map((m) => (
              <div
                key={m.label}
                className="border-t border-hairline py-4 last:border-b"
              >
                <dt className="type-caption font-medium uppercase tracking-[0.08em] text-mute">
                  {m.label}
                </dt>
                <dd className="mt-1 whitespace-pre-line type-body-sm text-ink">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Label rating, measured figure beside it ──────────────
          One hairline above, one between the two on desktop. The rating is
          the largest type in the section because it is the fact a buyer
          quotes; the measured value sits a step down and answers the
          question the rating raises — "by how much?". */}
      <div
        data-clin-rating
        className="mt-14 grid grid-cols-1 border-t border-hairline md:mt-20 md:grid-cols-2"
      >
        <div data-clin-block className="py-9 md:py-12 md:pr-16">
          <p className={LABEL}>UVB Protection</p>
          <p className="mt-5 font-display type-metric font-semibold text-ink">
            SPF 50+
          </p>
          <p className="mt-6 type-h3 font-medium text-ink">
            실측 SPF{" "}
            <span className="font-display font-semibold tabular-nums">
              {SPF_MEAN.toFixed(1)}
            </span>
            <span className="ml-2 type-body text-mute tabular-nums">
              ± {SPF_SD.toFixed(1)}
            </span>
          </p>
          {/* Two facts, two lines on a phone: run together they broke as
              "(In- / vivo)", which a buyer reads as a typo. */}
          <p className="mt-3 type-body-sm text-mute">
            <span className="block md:inline">ISO 24444:2019 / AMD 1:2022</span>
            <span className="hidden md:inline"> · </span>
            <span className="block md:inline">
              인체적용시험 (In-vivo) · 피험자 {SUBJECTS.length}명
            </span>
          </p>
        </div>

        <div
          data-clin-block
          className="border-t border-hairline py-9 md:border-t-0 md:border-l md:py-12 md:pl-16"
        >
          <p className={LABEL}>UVA Protection</p>
          <p className="mt-5 font-display type-metric font-semibold text-ink">
            PA++++
          </p>
          <p className="mt-6 type-h3 font-medium text-ink">
            실측 UVA-PF{" "}
            <span className="font-display font-semibold tabular-nums">
              23.33
            </span>
            <span className="ml-2 type-body text-mute tabular-nums">
              ± 0.70
            </span>
          </p>
          <p className="mt-3 type-body-sm text-mute">
            <span className="block md:inline">ISO 24443:2021</span>
            <span className="hidden md:inline"> · </span>
            <span className="block md:inline">
              인체외시험 (In-vitro) · PMMA 플레이트 {PLATES.length}장
            </span>
          </p>
        </div>
      </div>

      {/* ── Test Details: the evidence, three rows ───────────────
          A small head (label, title, Korean line) and then rows in the
          ingredient accordion's language. The row stays in place and its
          arrow turns when open, unlike the Formula rows which swap for a
          titled panel: here the row title is the panel title, and a data
          panel wants no second head above it. */}
      <div data-clin-block className="mt-16 md:mt-24">
        <p className={LABEL}>Test Details</p>
        <h3 className="mt-4 font-display type-h2 font-medium text-ink">
          Beyond the Rating
        </h3>
        <p className="mt-4 type-sub font-medium text-mute">
          표기 등급을 넘어,
          <br />
          실제 측정 결과를 확인하세요
        </p>
      </div>

      <div data-clin-block className="mt-8 md:mt-10">
        {ROWS.map((row) => {
          const isOpen = open === row.id;
          const panelId = `clinical-panel-${row.id}`;
          return (
            <div
              key={row.id}
              className="border-b border-hairline first:border-t"
            >
              <button
                type="button"
                onClick={() => toggle(row.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-6 py-5 text-left md:py-[1.1rem]"
              >
                <span className="flex min-w-0 items-baseline gap-4 font-display type-row font-normal text-ink">
                  <span className="type-caption font-medium tabular-nums text-mute">
                    {row.num}
                  </span>
                  {row.title}
                </span>
                <ArrowDown
                  className={`h-5 w-5 shrink-0 text-mute transition-transform duration-500 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.25}
                />
              </button>

              <div
                id={panelId}
                className={fold}
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                inert={!isOpen}
              >
                <div className="overflow-hidden">
                  <div className="pb-12 pt-4 md:pb-16 md:pt-6">
                    {panelBody(row.id, isOpen)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Source documents ─────────────────────────────────
          The charts above are our redrawing of the reports; this is the
          reports themselves. Never behind a toggle: being able to open the
          original is the strongest trust device on the page. */}
      <TestReports />
    </section>
  );
}
