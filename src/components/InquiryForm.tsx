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

const fieldCls =
  "w-full border-b border-hairline bg-transparent py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-mute/50 focus:border-ink";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] text-mute">{label}</span>
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
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");

    // NOTE: 백엔드 연동 지점 — 실제 API/이메일 서비스 연결 시 이 부분을 교체하세요.
    // 예: await fetch("/api/inquiry", { method: "POST", body: new FormData(e.currentTarget) })
    setTimeout(() => {
      setStatus("success");
      (e.target as HTMLFormElement).reset();
      setAgreed(false);
    }, 1400);
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
            className="text-display-lg font-display font-semibold"
          >
            Bring HISKIN
            <br />
            to Your Market.
          </h2>
          <p
            data-form-head
            className="mt-8 max-w-md text-[16.5px] leading-relaxed text-mute"
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
                className={`border px-4 py-3.5 text-[13px] font-medium transition-all duration-300 ${
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
            onSubmit={handleSubmit}
            className="grid gap-x-10 gap-y-7 sm:grid-cols-2"
          >
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
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
              />
              <span className="text-[13px] leading-relaxed text-mute">
                I agree to the collection and use of personal information.
                <br />
                개인정보 수집 및 이용에 동의합니다.
              </span>
            </label>

            <button
              type="submit"
              disabled={status !== "idle"}
              className="group mt-2 flex w-full items-center justify-center gap-2 bg-ink px-8 py-4.5 text-[15px] font-medium text-white transition-opacity duration-300 hover:opacity-85 disabled:opacity-70 sm:col-span-2"
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
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              Inquiry Received
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-mute">
              <span className="font-medium text-ink">{activeTabLabel}</span>{" "}
              문의가 정상적으로 접수되었습니다.
              <br />
              영업일 기준 2일 내 공식 이메일로 회신드리겠습니다.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-8 w-full bg-ink py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
