"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TestReports from "./TestReports";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────
   Card 01 — in-vivo SPF
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
   Card 02 — in-vitro UVA
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

function MetaRow({ items }: { items: Meta[] }) {
  return (
    <dl className="mt-8 border-t border-black/[0.08] pt-6">
      {items.map((m) => (
        <div
          key={m.label}
          className="flex items-baseline justify-between gap-6 py-[7px]"
        >
          <dt className="shrink-0 type-caption font-semibold uppercase tracking-[0.08em] text-mute">
            {m.label}
          </dt>
          <dd className="text-right type-body-sm text-ink">
            {m.value}
          </dd>
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
        <li
          key={t.strong}
          className="flex gap-2.5 type-body text-mute"
        >
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

/**
 * Section 06.5 — clinical efficacy.
 *
 * Both plots are hand-built SVG rather than a chart library: the point is
 * two specific numbers, and a generic chart would drag in axes, legends and
 * gridlines that fight the rest of the page.
 */
export default function ClinicalData() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-clin-head]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      gsap.from("[data-clin-card]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: "[data-clin-grid]", start: "top 80%" },
      });

      // Counters. Tweening a proxy and writing textContent avoids React
      // re-rendering 60 times a second.
      gsap.utils.toArray<HTMLElement>("[data-count-to]").forEach((el) => {
        const to = Number(el.dataset.countTo);
        const dp = Number(el.dataset.countDp ?? 1);
        const proxy = { v: 0 };
        gsap.to(proxy, {
          v: to,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
          onUpdate: () => {
            el.textContent = proxy.v.toFixed(dp);
          },
        });
      });

      // Scatter dots pop in along the ITA axis.
      gsap.from("[data-dot]", {
        opacity: 0,
        scale: 0,
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.05,
        scrollTrigger: { trigger: "[data-plot-spf]", start: "top 85%" },
      });

      // Left-to-right line draw.
      const curve = sectionRef.current?.querySelector<SVGPathElement>(
        "[data-curve-line]"
      );
      if (curve) {
        const len = curve.getTotalLength();
        gsap.set(curve, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(curve, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: "power2.inOut",
          scrollTrigger: { trigger: "[data-plot-uva]", start: "top 85%" },
        });
        gsap.from("[data-curve-mark]", {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 1.1,
          scrollTrigger: { trigger: "[data-plot-uva]", start: "top 85%" },
        });
      }
    },
    { scope: sectionRef }
  );

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

  return (
    <section
      id="clinical"
      ref={sectionRef}
      className="bg-paper px-6 py-16 md:px-[80px] md:py-36"
    >
      {/* ── Heading ──────────────────────────────────────────── */}
      <div className="max-w-3xl">
        <p data-clin-head className="eyebrow-tag mb-6">
          Clinical Efficacy &amp; Advanced UV Defense
        </p>
        <h2
          data-clin-head
          className="type-h2 font-display font-semibold text-ink"
        >
          Verified Protection by
          <br />
          Global Standard SOPs.
        </h2>
        <p
          data-clin-head
          className="mt-7 type-sub text-mute"
        >
          세명대학교 화장품임상연구센터의 ISO 국제 표준 인체적용시험 및 광학
          분석을 통해 입증된 정량적 방어력.
        </p>
      </div>

      {/* ── Metric cards ─────────────────────────────────────── */}
      <div
        data-clin-grid
        className="mt-14 grid grid-cols-1 gap-[12px] md:mt-20 md:grid-cols-2"
      >
        {/* ══ Card 01 — In-vivo UVB ══════════════════════════ */}
        <article
          data-clin-card
          className="flex flex-col border border-black/[0.08] p-7 md:p-9"
        >
          <p className="type-caption font-semibold uppercase tracking-[0.08em] text-mute">
            In-Vivo Clinical Trial
            <span className="ml-2 text-ink/45">(ISO 24444:2019/AMD 1:2022)</span>
          </p>

          <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display type-caption font-semibold uppercase tracking-[0.08em] text-ink">
              SPF
            </p>
            <p className="font-display type-metric font-semibold text-ink tabular-nums">
              <span data-count-to="69.0" data-count-dp="1">
                0.0
              </span>
            </p>
            <p className="pb-1 type-body font-medium tabular-nums text-mute">
              ± {SPF_SD.toFixed(1)}
            </p>
          </div>

          <p className="mt-5 inline-flex w-fit items-center gap-2 border border-rose/40 bg-rose/[0.07] px-3 py-[7px] type-caption font-semibold text-rose">
            SPF 50+ 표기 기준 초과 달성
          </p>

          <Takeaway items={SPF_TAKEAWAY} />

          {/* Per-subject scatter */}
          <figure data-plot-spf className="mt-9">
            {/* Sizes below are viewBox units, not screen pixels, so they are
                outside the type scale by necessity: the SVG scales with its
                container. The mobile value is the larger of the two because a
                narrow viewBox scales down further. */}
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

            {/* Panel composition by ITA° band */}
            <table className="mt-6 w-full border-t border-black/[0.08] type-caption tabular-nums">
              <thead>
                <tr className="type-caption uppercase tracking-[0.08em] text-mute">
                  <th className="py-2 text-left font-semibold">ITA° 구간</th>
                  <th className="py-2 text-right font-semibold">피험자</th>
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
          </figure>

          <div className="mt-auto">
            <MetaRow
              items={[
                { label: "Study No.", value: "SMC-260731-9077_EN" },
                {
                  label: "Test Institution",
                  value:
                    "세명대학교 화장품임상연구센터 (ISO 9001:2015 · Q144314)",
                },
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
              ]}
            />
          </div>
        </article>

        {/* ══ Card 02 — In-vitro UVA ═════════════════════════ */}
        <article
          data-clin-card
          className="flex flex-col border border-black/[0.08] p-7 md:p-9"
        >
          <p className="type-caption font-semibold uppercase tracking-[0.08em] text-mute">
            In-Vitro Broad Spectrum
            <span className="ml-2 text-ink/45">(ISO 24443:2021)</span>
          </p>

          <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display type-caption font-semibold uppercase tracking-[0.08em] text-ink">
              UVA-PF
            </p>
            <p className="font-display type-metric font-semibold text-ink tabular-nums">
              <span data-count-to="23.33" data-count-dp="2">
                0.00
              </span>
            </p>
            <p className="pb-1 type-body font-medium tabular-nums text-mute">
              ± 0.70
            </p>
          </div>

          <p className="mt-5 inline-flex w-fit items-center gap-2 border border-rose/40 bg-rose/[0.07] px-3 py-[7px] type-caption font-semibold text-rose">
            PA++++ (최고 등급 기준치 16.0 초과)
          </p>

          <Takeaway items={UVA_TAKEAWAY} />

          {/* Spectral absorbance */}
          <figure data-plot-uva className="mt-9">
            {/* Sizes below are viewBox units, not screen pixels, so they are
                outside the type scale by necessity: the SVG scales with its
                container. The mobile value is the larger of the two because a
                narrow viewBox scales down further. */}
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
              {/* Both labels sit low and left, in the wedge the curve leaves
                  empty. The absorbance line runs flat across the top and only
                  falls away on the right, so anything set near the top of the
                  band — where these used to be — is printed straight over it. */}
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
              모식도이며, 아래 표가 PMMA 플레이트 4장의 실측값입니다.
            </figcaption>

            {/* Per-plate measurements */}
            <table className="mt-6 w-full border-t border-black/[0.08] type-caption tabular-nums">
              <thead>
                <tr className="type-caption uppercase tracking-[0.08em] text-mute">
                  <th className="py-2 text-left font-semibold">Plate</th>
                  <th className="py-2 text-right font-semibold">UVA-PF</th>
                  <th className="py-2 text-right font-semibold">λc (nm)</th>
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
          </figure>

          <div className="mt-auto">
            <MetaRow
              items={[
                { label: "Study No.", value: "SMC-260731-9090_EN" },
                {
                  label: "Test Institution",
                  value:
                    "세명대학교 화장품임상연구센터 (ISO 9001:2015 · Q144314)",
                },
                {
                  label: "Method",
                  value: "PMMA 플레이트 4장 · 25cm² · 1.3mg/cm²",
                },
                { label: "95% CI", value: "4.7 — 허용 17% 이내" },
                { label: "Test Date", value: "2026.07.27 ~ 07.31 완료" },
              ]}
            />
          </div>
        </article>
      </div>

      {/* ── Source documents ─────────────────────────────────
          The charts above are our redrawing of the reports; this is the
          reports themselves. Placing it here rather than in the
          certificate wall keeps the evidence next to the claim it backs. */}
      <TestReports />
    </section>
  );
}
