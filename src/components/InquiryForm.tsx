"use client";

import { useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, Loader2, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const TABS = [
  { id: "distributor", label: "Distributor / Wholesale" },
  { id: "sample", label: "Sample Request" },
  { id: "clinic", label: "Clinic & Aesthetic" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
 */
const isLocalHost = () =>
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(
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
 * pef-style inquiry: eyebrow tag, headline + Korean sub-copy on the left;
 * rectangular outline tabs, underline-style labeled inputs, consent
 * checkbox, and a full-width black submit bar on the right.
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

  /**
   * Netlify collects form posts at the site root. The build bot finds the
   * form by scanning the deployed HTML for data-netlify, which works here
   * because the page is prerendered by output: "export" — the markup is in
   * out/index.html before a browser ever runs.
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

  const activeTabLabel = TABS.find((t) => t.id === tab)?.label;

  return (
    <section
      id="inquiry"
      ref={sectionRef}
      className="px-6 py-16 md:px-[80px] md:py-36"
    >
      <div className="grid gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-24">
        {/* Left: headline */}
        <div>
          <p data-form-head className="eyebrow-tag mb-6">
            Become a Partner
          </p>
          <h2
            data-form-head
            className="type-h1 font-display font-semibold"
          >
            Bring HISKIN
            <br />
            to Your Market.
          </h2>
          <p
            data-form-head
            className="mt-8 max-w-md type-sub text-mute"
          >
            해외 유통사, 도매상, 에스테틱 및 클리닉 파트너를 찾습니다. 아래
            양식을 남겨주시면 영업일 기준 2일 내 회신드립니다.
          </p>
        </div>

        {/* Right: form */}
        <div data-form-panel>
          {/* Rectangular tabs */}
          <div className="mb-10 grid grid-cols-1 gap-[10px] sm:grid-cols-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`border px-4 py-3.5 type-body-sm font-medium transition-all duration-300 ${
                  tab === t.id
                    ? "border-ink bg-paper-alt text-ink"
                    : "border-hairline bg-transparent text-mute hover:text-ink"
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
            className="grid gap-x-10 gap-y-7 sm:grid-cols-2"
          >
            {/* Netlify matches the post to the form by this value. */}
            <input type="hidden" name="form-name" value="b2b-inquiry" />
            {/* Which tab was open. It is React state, not an input, so
                without this the message arrives with no idea whether it is a
                distributor, a sample request or a clinic. */}
            <input type="hidden" name="inquiryType" value={activeTabLabel ?? tab} />
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
            <Field label="Official Email / 이메일 *">
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
            <div className="sm:col-span-2">
              <Field
                label={
                  tab === "sample"
                    ? "Requested Sample Quantity / 샘플 수량"
                    : "Target Order Quantity / 목표 주문 수량"
                }
              >
                <input name="quantity" className={fieldCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Message / 문의내용 *">
                <textarea
                  name="message"
                  required
                  rows={4}
                  className={`${fieldCls} resize-none`}
                  placeholder="취급 채널, 유통 지역, 예상 일정 등을 알려주세요."
                />
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
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

            <button
              type="submit"
              disabled={status === "loading"}
              className="group mt-2 flex w-full items-center justify-center gap-2 bg-ink px-8 py-4.5 type-body font-medium text-white transition-opacity duration-300 hover:opacity-85 disabled:opacity-70 sm:col-span-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit B2B Inquiry
                  <ArrowRight
                    className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={1.8}
                  />
                </>
              )}
            </button>
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
              Inquiry Received
            </h3>
            <p className="mt-4 type-body-sm text-mute">
              <span className="font-medium text-ink">{activeTabLabel}</span>{" "}
              문의가 정상적으로 접수되었습니다.
              <br />
              영업일 기준 2일 내 공식 이메일로 회신드리겠습니다.
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
