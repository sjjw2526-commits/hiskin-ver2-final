"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TestReports from "./TestReports";

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────
   B2B 신뢰 섹션 — 국제 표준 시험법 검증.

   ⚠️ 소비자 노출 정책 (INGREDIENTS.md §4 · 카피 스펙 §6/§18):
   제품의 SPF/UVA-PF "실측 절대값"은 화면·그래프·데이터 어디에도 두지
   않는다. 국내 표시 상한이 SPF 50+ 이므로 실측 69.0 등을 광고에 노출하면
   표시·광고 위반 소지가 있다. 소비자 표기는 SPF 50+ / PA++++ 로 통일하고,
   여기서는 "국제 표준 시험법으로 검증했고 기준을 충족했다"는 정성적 사실과
   방법론(ISO·Study No.·시험기관·시험일·임계파장)만 보여준다. 실제 수치는
   B2B 파트너가 시험성적서 원문(아래 뷰어)에서 확인한다.
   ──────────────────────────────────────────────────────────────── */

/* ISO 24444는 피험자를 세 ITA° 구간에 분산하도록 요구한다. 구간 분포는
   SPF 값이 아니라 패널의 유효성을 보여주는 정보라 그대로 유지한다. */
const ITA_BANDS = [
  { band: "28° ~ 40°", n: 1 },
  { band: "41° ~ 55°", n: 6 },
  { band: "56° 초과", n: 3 },
];

/* λc(임계파장)는 시험성적서 원문과 일치하는 값이라 유지한다(광범위 차단
   기준 = 370nm 이상). UVA-PF 절대값은 표에서 제거했다. */
const PLATE_LC = [
  { n: 1, lc: 377.3 },
  { n: 2, lc: 377.85 },
  { n: 3, lc: 377.54 },
  { n: 4, lc: 377.82 },
];

/* λc 곡선은 측정된 임계파장을 기준으로 재구성한 모식도(흡광 스펙트럼
   원본은 성적서에 없음). 광범위 차단을 시각적으로만 전달한다. */
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
          <dd className="text-right type-body-sm text-ink">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Takeaway({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-[9px]">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5 type-body text-mute">
          <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-rose md:mt-[10px]" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Section 06.5 — Proven Protection.
 *
 * Two cards: in-vivo SPF and in-vitro UVA. Both present the qualitative
 * result (criteria met) and the methodology, never the product's measured
 * absolute values. The report PDFs at the bottom carry the actual figures
 * for B2B partners who open them.
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

      // Left-to-right line draw for the schematic absorbance curve.
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

  return (
    <section
      id="clinical"
      ref={sectionRef}
      className="bg-paper px-6 py-16 md:px-[80px] md:py-36"
    >
      {/* ── Heading ──────────────────────────────────────────── */}
      <div className="max-w-3xl">
        <p data-clin-head className="eyebrow-tag mb-6">
          Proven Protection
        </p>
        <h2
          data-clin-head
          className="type-h2 font-display font-semibold text-ink"
        >
          Tested against
          <br className="hidden md:block" /> international standards.
        </h2>
        <p data-clin-head className="mt-7 type-sub text-mute">
          제품의 자외선 차단 성능을 국제 표준 시험법에 따라 객관적으로
          검증했습니다.
        </p>
      </div>

      {/* ── Metric cards ─────────────────────────────────────── */}
      <div
        data-clin-grid
        className="mt-14 grid grid-cols-1 gap-[12px] md:mt-20 md:grid-cols-2"
      >
        {/* ══ Card 01 — In-vivo SPF ══════════════════════════ */}
        <article
          data-clin-card
          className="flex flex-col border border-black/[0.08] p-7 md:p-9"
        >
          <p className="type-caption font-semibold uppercase tracking-[0.08em] text-mute">
            In-Vivo Clinical Trial
            <span className="ml-2 text-ink/45">(ISO 24444:2019/AMD 1:2022)</span>
          </p>

          <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display type-metric font-semibold text-ink">
              SPF 50+
            </p>
          </div>

          <p className="mt-5 inline-flex w-fit items-center gap-2 border border-rose/40 bg-rose/[0.07] px-3 py-[7px] type-caption font-semibold text-rose">
            인체적용시험 기준 충족
          </p>

          <Takeaway
            items={[
              "인체적용시험 피험자 전원이 표기 기준 SPF 50+를 충족했습니다.",
              "ISO 24444 국제 표준 인체적용시험법에 따라 공인 시험기관에서 검증했습니다.",
            ]}
          />

          {/* Panel composition by ITA° band — validity of the panel, not an
              SPF value. */}
          <figure className="mt-9">
            <table className="w-full border-t border-black/[0.08] type-caption tabular-nums">
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
            <figcaption className="mt-4 type-caption text-mute">
              ISO 24444가 요구하는 세 ITA° 구간에 피험자를 분산해 진행한
              유효 패널입니다. 개인별 실측값은 시험성적서 원문에서 확인할 수
              있습니다.
            </figcaption>
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
                { label: "Standard", value: "ISO 24444:2019 / AMD 1:2022" },
                { label: "Panel", value: "10명 · 19~53세 · ITA° 38~58" },
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
            <p className="font-display type-metric font-semibold text-ink">
              PA++++
            </p>
          </div>

          <p className="mt-5 inline-flex w-fit items-center gap-2 border border-rose/40 bg-rose/[0.07] px-3 py-[7px] type-caption font-semibold text-rose">
            광범위 자외선 차단 기준 충족
          </p>

          <Takeaway
            items={[
              "PMMA 플레이트 전 구간이 PA++++ 기준을 충족했습니다.",
              "임계파장 377.6nm으로 광범위 자외선 차단 기준(370nm 이상)을 충족합니다.",
            ]}
          />

          {/* Schematic absorbance — critical wavelength only (no absolute
              UVA-PF values). */}
          <figure data-plot-uva className="mt-9">
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
              모식도입니다.
            </figcaption>

            {/* Per-plate critical wavelength (λc only) */}
            <table className="mt-6 w-full border-t border-black/[0.08] type-caption tabular-nums">
              <thead>
                <tr className="type-caption uppercase tracking-[0.08em] text-mute">
                  <th className="py-2 text-left font-semibold">Plate</th>
                  <th className="py-2 text-right font-semibold">λc (nm)</th>
                </tr>
              </thead>
              <tbody>
                {PLATE_LC.map((p) => (
                  <tr key={p.n} className="border-t border-black/[0.05]">
                    <td className="py-[6px] text-left text-mute">#{p.n}</td>
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
                { label: "Standard", value: "ISO 24443:2021" },
                {
                  label: "Method",
                  value: "PMMA 플레이트 4장 · 25cm² · 1.3mg/cm²",
                },
                { label: "Test Date", value: "2026.07.27 ~ 07.31 완료" },
              ]}
            />
          </div>
        </article>
      </div>

      {/* ── Source documents ─────────────────────────────────
          The cards above state the result; these are the reports themselves,
          where a B2B partner can read the full measured figures. */}
      <TestReports />
    </section>
  );
}
