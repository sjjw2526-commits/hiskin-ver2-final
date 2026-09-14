"use client";

import { Fragment, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, Loader2, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Each tab asks for what that kind of partner actually needs, rather than
 * repeating one form under three names (2026-09-14). The quantity field
 * changes its label between distributor and sample; a clinic is asked what it
 * is interested in instead. `guide` is the placeholder in the message box.
 */
const TABS = [
  {
    id: "distributor",
    label: "Distributor / Wholesale",
    quantityLabel: "Expected Order Quantity / 예상 주문 수량",
    guide: "유통 지역, 판매 채널, 예상 일정 등 파트너십에 필요한 내용을 남겨주세요",
    cta: "Send Inquiry",
  },
  {
    id: "sample",
    label: "Sample Request",
    quantityLabel: "Requested Sample Quantity / 요청 샘플 수량",
    guide: "샘플 요청 목적과 검토 중인 시장·채널 등 관련 내용을 남겨주세요",
    cta: "Request Sample",
  },
  {
    id: "clinic",
    label: "Clinic & Aesthetic",
    quantityLabel: null,
    guide: "클리닉 도입, 제품 구매, 협업 등 문의하실 내용을 남겨주세요",
    cta: "Send Inquiry",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const INTERESTS = ["클리닉 도입", "제품 구매", "협업", "기타"];

const COUNTRIES = [
  "United States",
  "Japan",
  "China",
  "Vietnam",
  "Thailand",
  "Singapore",
  "Indonesia",
  "United Arab Emirates",
  "Germany",
  "France",
  "United Kingdom",
  "Australia",
  "Other",
];

/**
 * Only Netlify answers a form post, and only on the deployed site. The dev
 * server replies 200 to POST / with the page itself, which is indistinguishable
 * from a real acceptance — so without this check, submitting locally shows the
 * success modal for an inquiry that went nowhere. Refusing outright is the
 * honest behaviour: better a clear "not here" than a false receipt.
 *
 * Private network addresses count as local too: the dev server is opened
 * from a phone on the same Wi-Fi (next.config.ts, allowedDevOrigins), and
 * there the hostname is the computer's LAN address, not localhost.
 */
const isLocalHost = () =>
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(
    window.location.hostname
  );

const fieldCls =
  "w-full border-b border-hairline bg-transparent py-3 type-field text-ink outline-none transition-colors placeholder:text-mute/50 focus:border-ink";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block type-body-sm text-mute">{label}</span>
      {children}
    </label>
  );
}

/**
 * Copy broken where the owner broke it, at every width. Where a column is too
 * narrow to hold one of the lines, balance splits it evenly instead of
 * leaving its last word stranded on a row of its own.
 */
function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <span key={i} className="block text-balance">
      {line}
    </span>
  ));
}

/**
 * pef-style inquiry: eyebrow tag, headline + Korean sub-copy on the left;
 * light outline tabs, underline-style labeled inputs, consent checkbox and a
 * slim black submit button on the right.
 */
export default function InquiryForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<TabId>("distributor");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [failedLocally, setFailedLocally] = useState(false);

  useGSAP(
    () => {
      gsap.from("[data-form-head]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from("[data-form-panel]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-form-panel]", start: "top 80%" },
      });
    },
    { scope: sectionRef }
  );

  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const isClinic = active.quantityLabel === null;

  /**
   * Netlify collects form posts at the site root. The build bot finds the
   * form by scanning the deployed HTML for data-netlify, which works here
   * because the page is prerendered by output: "export" — the markup is in
   * out/index.html before a browser ever runs.
   *
   * The bot only sees the first tab, and a field it has not seen is dropped
   * from every submission. So both tab-specific fields — quantity and
   * interest — are always in the markup, the one that does not apply simply
   * hidden, and the hidden one is taken out of the post here so a quantity
   * typed before switching to the clinic tab does not ride along.
   *
   * Posting by fetch rather than letting the browser submit keeps the user
   * on the page, but it also means a failure is ours to surface. It is not
   * caught silently: an inquiry that never arrived must never be reported
   * as received.
   *
   * This only works on the deployed site. Locally there is no Netlify to
   * receive the post, so submitting shows the error state — that is
   * expected, not a bug.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;
    const form = e.currentTarget;

    if (isLocalHost()) {
      setFailedLocally(true);
      setStatus("error");
      return;
    }

    setFailedLocally(false);
    setStatus("loading");

    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      params.append(key, typeof value === "string" ? value : value.name);
    });
    params.delete(isClinic ? "quantity" : "interest");

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
      setAgreed(false);
    } catch {
      setStatus("error");
    }
  };

  return (
    // A pale wash of the brand pink, so the page closes on a section that
    // reads as the call to act, set apart from the white gallery above it.
    // Lightened from #f7edf0 on 2026-09-14: the deeper pink next to grey
    // type made the section look tired.
    <section
      id="inquiry"
      ref={sectionRef}
      className="bg-[#fbf4f6] px-6 py-16 md:px-[80px] md:py-36"
    >
      <div className="grid gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-24">
        {/* Left: headline */}
        <div className="break-keep @container">
          <p data-form-head className="eyebrow-tag mb-6">
            Partnership
          </p>
          {/* Two lines, as written. At full size "Beyond Borders." is 7.85
              times its font size wide, more than this column holds below
              about 1540px, and it broke into three. So from lg the size is
              also capped by the column's own width (cqi) — the `!` because
              .type-h1 is unlayered and would otherwise win. Below lg the
              column is too narrow for any sensible display size, and it
              wraps as before; on a phone the column is full width and it
              fits. */}
          <h2
            data-form-head
            className="type-h1 font-display font-semibold lg:text-[length:min(4.25rem,5vw,12.2cqi)]!"
          >
            HISKIN,
            <br />
            Beyond Borders.
          </h2>
          <p data-form-head className="mt-8 type-lead font-medium text-ink">
            <Lines
              lines={["HISKIN과 새로운 시장을 함께 만들어갈", "글로벌 파트너를 기다립니다"]}
            />
          </p>
          <p data-form-head className="mt-4 type-sub text-mute">
            <Lines
              lines={[
                "유통 · 도매 · 클리닉 등 다양한 파트너십을 통해",
                "HISKIN의 가능성을 더 넓은 시장으로 이어가고자 합니다",
              ]}
            />
          </p>
          <p
            data-form-head
            className="mt-10 max-w-sm border-t border-hairline pt-6 type-body-sm text-mute"
          >
            <Lines
              lines={["문의 내용을 남겨주시면", "영업일 기준 2일 이내 회신드립니다"]}
            />
          </p>
        </div>

        {/* Right: form */}
        <div data-form-panel>
          {/* Light outline tabs; only the open one is filled. Stacked on a
              phone, where three abreast would squeeze each label to two
              lines. */}
          <div className="mb-12 grid grid-cols-1 gap-[10px] sm:grid-cols-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`border px-4 py-[11px] type-body-sm font-medium transition-colors duration-300 ${
                  tab === t.id
                    ? "border-ink bg-ink text-white"
                    : "border-ink/20 bg-transparent text-ink/60 hover:border-ink/45 hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form
            name="b2b-inquiry"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="grid gap-x-10 gap-y-8 sm:grid-cols-2 md:gap-y-10"
          >
            {/* Netlify matches the post to the form by this value. */}
            <input type="hidden" name="form-name" value="b2b-inquiry" />
            {/* Which tab was open. It is React state, not an input, so
                without this the message arrives with no idea whether it is a
                distributor, a sample request or a clinic. */}
            <input type="hidden" name="inquiryType" value={active.label} />
            {/* Honeypot: invisible to a person, irresistible to a bot.
                Anything that fills it in is discarded by Netlify. */}
            <p className="hidden">
              <label>
                Do not fill this in <input name="bot-field" />
              </label>
            </p>
            <Field label="Name / 이름 *">
              <input
                name="name"
                required
                className={fieldCls}
                autoComplete="name"
              />
            </Field>
            <Field label="Company / 회사명 *">
              <input
                name="company"
                required
                className={fieldCls}
                autoComplete="organization"
              />
            </Field>
            <Field label="Business Email / 이메일 *">
              <input
                name="email"
                type="email"
                required
                className={fieldCls}
                autoComplete="email"
              />
            </Field>
            <Field label="Country / 국가 *">
              <select
                name="country"
                required
                defaultValue=""
                className={`${fieldCls} appearance-none`}
              >
                <option value="" disabled />
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            {/* Both stay in the markup on every tab — see handleSubmit. */}
            <div className="sm:col-span-2" hidden={isClinic}>
              <Field label={active.quantityLabel ?? TABS[0].quantityLabel}>
                <input name="quantity" className={fieldCls} />
              </Field>
            </div>
            <div className="sm:col-span-2" hidden={!isClinic}>
              <Field label="Partnership Interest / 관심 분야 *">
                <select
                  name="interest"
                  required={isClinic}
                  defaultValue=""
                  className={`${fieldCls} appearance-none`}
                >
                  <option value="" disabled />
                  {INTERESTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Message / 문의내용 *">
                <textarea
                  name="message"
                  required
                  rows={4}
                  className={`${fieldCls} resize-none`}
                  placeholder={active.guide}
                />
              </Field>
            </div>

            {status === "error" && (
              <p
                role="alert"
                className="type-body-sm text-rose sm:col-span-2"
              >
                {failedLocally ? (
                  <>
                    로컬 환경에서는 문의가 전송되지 않습니다. 배포된 사이트에서
                    테스트해주세요.
                  </>
                ) : (
                  <>
                    전송에 실패했습니다. 잠시 후 다시 시도해주시거나,{" "}
                    <a
                      href="mailto:sm44800@naver.com"
                      className="underline underline-offset-2"
                    >
                      sm44800@naver.com
                    </a>
                    으로 보내주세요.
                  </>
                )}
              </p>
            )}

            {/* A slim button sized to its label rather than a bar across the
                panel. It stays under the consent line at every width: beside
                it, the consent text was squeezed to five lines on a laptop.
                Full width on a phone, where it is the thumb's target. The
                minimum width is the longer label's, so switching tabs does
                not make the button jump. */}
            <div className="flex flex-col items-start gap-7 sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="consent"
                  value="개인정보 수집·이용 동의함"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
                />
                <span className="type-body-sm text-mute">
                  I agree to the collection and use of personal information.
                  <br />
                  개인정보 수집 및 이용에 동의합니다.
                </span>
              </label>

              <button
                type="submit"
                disabled={status === "loading"}
                className="group flex w-full shrink-0 items-center justify-center gap-2.5 bg-ink px-9 py-3.5 type-body-sm font-semibold uppercase tracking-[0.08em] text-white transition-opacity duration-300 hover:opacity-85 disabled:opacity-70 sm:w-auto sm:min-w-[240px]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    {active.cta}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      strokeWidth={1.8}
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {status === "success" && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/70 p-6 backdrop-blur-sm"
          onClick={() => setStatus("idle")}
          role="dialog"
          aria-modal
        >
          <div
            className="relative w-full max-w-md bg-paper p-10 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              onClick={() => setStatus("idle")}
              className="absolute right-5 top-5 text-mute transition-colors hover:text-ink"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-ink">
              <Check className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <h3 className="font-display type-h3 font-semibold">
              {tab === "sample" ? "Request Received" : "Inquiry Received"}
            </h3>
            <p className="mt-4 break-keep type-body-sm text-mute">
              <span className="font-medium text-ink">{active.label}</span>{" "}
              문의가 정상적으로 접수되었습니다.
              <br />
              영업일 기준 2일 이내 입력하신 비즈니스 이메일로 회신드립니다.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 w-full bg-ink py-3.5 type-body-sm font-medium text-white transition-opacity hover:opacity-85"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
