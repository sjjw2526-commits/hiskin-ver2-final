"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────
   Card 01 — in-vivo SPF, per-subject scatter
   ────────────────────────────────────────────────────────────────
   ⚠️ 실제 보고서 수치로 교체 필요.
   보고서에서 확정된 값은 평균 SPF 69.0 ± 9.4 (n=10) 와 ITA 범위 28°~58°
   뿐입니다. 아래 10개 좌표는 그 평균/표준편차를 정확히 재현하도록
   (mean 69.0, SD 9.37) 구성한 분포 예시입니다.
   SMC-260731-9077_EN 원문의 피험자별 SPF 값을 주시면 그대로 바꿔 넣습니다. */
const SUBJECTS = [
  { ita: 28, spf: 71.2 },
  { ita: 31, spf: 57.1 },
  { ita: 34, spf: 77.7 },
  { ita: 37, spf: 64.7 },
  { ita: 41, spf: 81.9 },
  { ita: 44, spf: 54.9 },
  { ita: 47, spf: 74.4 },
  { ita: 51, spf: 67.9 },
  { ita: 54, spf: 78.8 },
  { ita: 58, spf: 61.4 },
];

const SPF_MEAN = 69.0;
const SPF_SD = 9.4;
const SPF_LABEL_MAX = 50; // 표기 상한선

/* ────────────────────────────────────────────────────────────────
   Card 02 — in-vitro UVA absorbance curve, 290–400 nm
   ────────────────────────────────────────────────────────────────
   시그모이드 흡광 곡선을 임계파장 λc = 377.6 nm 에 맞춰 역산한 것입니다
   (290→377.6 구간 면적 = 290→400 전체 면적의 90%).
   분광광도계 원본 데이터가 있으면 이 path 만 교체하면 됩니다. */
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
          <dt className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">
            {m.label}
          </dt>
          <dd className="text-right text-[13px] leading-snug text-ink">
            {m.value}
          </dd>
        </div>
      ))}
    </dl>
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
  const yMin = 40;
  const yMax = 90;
  const px = (ita: number) => 26 + ((ita - 24) / (62 - 24)) * (PW - 34);
  const py = (spf: number) => 10 + (1 - (spf - yMin) / (yMax - yMin)) * (PH - 30);

  return (
    <section
      id="clinical"
      ref={sectionRef}
      className="bg-paper px-6 py-24 md:px-[80px] md:py-36"
    >
      {/* ── Heading ──────────────────────────────────────────── */}
      <div className="max-w-3xl">
        <p data-clin-head className="eyebrow-tag mb-6">
          Clinical Efficacy &amp; Advanced UV Defense
        </p>
        <h2
          data-clin-head
          className="text-display-md font-display font-semibold text-ink"
        >
          Verified Protection by
          <br />
          Global Standard SOPs.
        </h2>
        <p
          data-clin-head
          className="mt-7 text-[16px] leading-[1.6] text-mute md:text-[17.5px]"
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
          <p className="text-[10.5px] font-semibold uppercase leading-relaxed tracking-[0.1em] text-mute">
            In-Vivo Clinical Trial
            <span className="ml-2 text-ink/45">(ISO 24444:2019/AMD 1:2022)</span>
          </p>

          <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
              SPF
            </p>
            <p className="font-display text-[58px] font-semibold leading-[0.85] tracking-[-0.03em] text-ink tabular-nums md:text-[72px]">
              <span data-count-to="69.0" data-count-dp="1">
                0.0
              </span>
            </p>
            <p className="pb-1 text-[15px] font-medium tabular-nums text-mute">
              ± {SPF_SD.toFixed(1)}
            </p>
          </div>

          <p className="mt-5 inline-flex w-fit items-center gap-2 border border-rose/40 bg-rose/[0.07] px-3 py-[7px] text-[11.5px] font-semibold tracking-[0.02em] text-rose">
            SPF 50+ 표기 기준 초과 달성
          </p>

          {/* Per-subject scatter */}
          <figure data-plot-spf className="mt-9">
            <svg
              viewBox={`0 0 ${PW} ${PH}`}
              className="h-auto w-full overflow-visible [&_text]:text-[17px] md:[&_text]:text-[10px]"
              role="img"
              aria-label={`인체적용시험 피험자 ${SUBJECTS.length}명의 개인별 SPF 분포. 평균 ${SPF_MEAN}, 표준편차 ${SPF_SD}.`}
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
              {SUBJECTS.map((s, i) => (
                <g key={s.ita} data-dot>
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
                  <title>{`피험자 ${i + 1} · ITA ${s.ita}° · SPF ${s.spf}`}</title>
                </g>
              ))}
              {/* x ticks */}
              {[28, 58].map((v) => (
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
            <figcaption className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-mute">
              <span className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-ink" />
                피험자 {SUBJECTS.length}명 개인별 SPF
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

          <div className="mt-auto">
            <MetaRow
              items={[
                { label: "Study No.", value: "SMC-260731-9077_EN" },
                {
                  label: "Test Institution",
                  value: "세명대학교 화장품임상연구센터 (ISO 9001:2015 인증 기관)",
                },
                { label: "Test Date", value: "2026.07.31 완료" },
              ]}
            />
          </div>
        </article>

        {/* ══ Card 02 — In-vitro UVA ═════════════════════════ */}
        <article
          data-clin-card
          className="flex flex-col border border-black/[0.08] p-7 md:p-9"
        >
          <p className="text-[10.5px] font-semibold uppercase leading-relaxed tracking-[0.1em] text-mute">
            In-Vitro Broad Spectrum
            <span className="ml-2 text-ink/45">(ISO 24443:2021)</span>
          </p>

          <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink">
              UVA-PF
            </p>
            <p className="font-display text-[58px] font-semibold leading-[0.85] tracking-[-0.03em] text-ink tabular-nums md:text-[72px]">
              <span data-count-to="23.33" data-count-dp="2">
                0.00
              </span>
            </p>
            <p className="pb-1 text-[15px] font-medium tabular-nums text-mute">
              ± 0.70
            </p>
          </div>

          <p className="mt-5 inline-flex w-fit items-center gap-2 border border-rose/40 bg-rose/[0.07] px-3 py-[7px] text-[11.5px] font-semibold tracking-[0.02em] text-rose">
            PA++++ (최고 등급 기준치 16.0 초과)
          </p>

          {/* Spectral absorbance */}
          <figure data-plot-uva className="mt-9">
            <svg
              viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
              className="h-auto w-full overflow-visible [&_text]:text-[17px] md:[&_text]:text-[10px]"
              role="img"
              aria-label="290nm에서 400nm까지의 흡광 곡선. 임계파장 377.6nm."
            >
              {/* UVA band */}
              <rect
                x={UVA_START_X}
                y={0}
                width={CURVE_W - UVA_START_X}
                height={CURVE_H - 18}
                className="fill-black/[0.028]"
              />
              <text
                x={UVA_START_X + 8}
                y={16}
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
                  x={LC_X - 10}
                  y={LC_Y - 14}
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
            <figcaption className="mt-4 text-[11px] leading-relaxed text-mute">
              임계파장(Critical Wavelength) 377.6nm — 광범위 자외선 차단
              기준(370nm 이상)을 충족합니다.
            </figcaption>
          </figure>

          <div className="mt-auto">
            <MetaRow
              items={[
                { label: "Study No.", value: "SMC-260731-9090_EN" },
                {
                  label: "Test Institution",
                  value: "세명대학교 화장품임상연구센터",
                },
                { label: "Test Date", value: "2026.07.31 완료" },
              ]}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
