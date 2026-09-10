"use client";

import { ArrowUp } from "lucide-react";
import RollText from "./RollText";

// Same order as the page and the top nav: Philosophy now sits before Reviews.
const MENU = [
  { href: "#concept", label: "Concept" },
  { href: "#philosophy", label: "Philosophy" },
  { href: "#reviews", label: "Reviews" },
  { href: "#science", label: "Science" },
  { href: "#inquiry", label: "B2B Inquiry" },
];

/* HISKIN is the brand; the company behind it is 주식회사 지디엠, and it is the
   company that has to appear here. Korean e-commerce law (전자상거래법 제10조)
   requires the trade name, representative, address, business registration
   number and mail-order registration number to be shown, so these are a legal
   obligation rather than decoration — do not trim them to tidy the layout. */
const COMPANY = {
  name: "주식회사 지디엠",
  ceo: "김주현",
  privacyOfficer: "김주현",
  bizNo: "166-86-02812",
  mailOrderNo: "2024-충북청주-0228",
  email: "sm44800@naver.com",
  tel: "043-241-2011",
  // Reordered into the standard Korean postal form — postcode first, then the
  // road address, then the building detail. Same data as supplied.
  address: "(28171) 충북 청주시 흥덕구 강내면 월곡길 38 충청대학 R동 120호",
  hours: "평일 10:00 - 18:00 (점심시간 12:00 - 14:00) · 토·일·공휴일 휴무",
};

/* The FTC's public lookup, which is what "사업자정보확인" links to everywhere
   else. It takes the registration number with the hyphens stripped. */
const FTC_LOOKUP = `https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${COMPANY.bizNo.replace(/-/g, "")}`;

const LEGAL = [
  { label: "상호", value: COMPANY.name },
  { label: "대표", value: COMPANY.ceo },
  { label: "개인정보관리책임자", value: COMPANY.privacyOfficer },
  { label: "통신판매업신고번호", value: COMPANY.mailOrderNo },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="px-6 py-16 md:px-[80px] md:py-24">
        <div className="flex flex-col justify-between gap-14 md:flex-row">
          <div>
            <p className="font-display type-wordmark font-bold">HISKIN</p>
            <div className="mt-10 space-y-2 type-body-sm text-white/60">
              <p>
                <span className="mr-3 font-semibold text-white/85">TEL</span>
                <a
                  href={`tel:${COMPANY.tel.replace(/-/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {COMPANY.tel}
                </a>
              </p>
              <p>
                <span className="mr-3 font-semibold text-white/85">E-MAIL</span>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="transition-colors hover:text-white"
                >
                  {COMPANY.email}
                </a>
              </p>
              <p className="flex gap-3">
                <span className="shrink-0 font-semibold text-white/85">
                  ADDRESS
                </span>
                <span>{COMPANY.address}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            {MENU.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group/roll type-body-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                <RollText>{item.label}</RollText>
              </a>
            ))}
          </div>
        </div>

        {/* ── Statutory business details ────────────────────────── */}
        <div className="mt-16 border-t border-white/12 pt-8 md:mt-20">
          <div className="flex flex-wrap gap-x-5 gap-y-2 type-body-sm text-white/45">
            {LEGAL.map((row) => (
              <p key={row.label}>
                <span className="mr-1.5 text-white/70">{row.label}</span>
                {row.value}
              </p>
            ))}
            <p>
              <span className="mr-1.5 text-white/70">사업자등록번호</span>
              {COMPANY.bizNo}
              <a
                href={FTC_LOOKUP}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-2 underline decoration-white/25 underline-offset-2 transition-colors hover:text-white hover:decoration-white/60"
              >
                사업자정보확인
              </a>
            </p>
          </div>
          <p className="mt-3 type-body-sm text-white/45">
            <span className="mr-1.5 text-white/70">고객센터</span>
            {COMPANY.tel} · {COMPANY.hours}
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="type-body-sm text-white/40">
            Copyright © 2026 {COMPANY.name}. All Rights Reserved
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 self-start type-body-sm text-white/70 transition-colors hover:text-white md:self-auto"
            aria-label="Scroll to top"
          >
            <ArrowUp
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1"
              strokeWidth={1.5}
            />
            Top
          </button>
        </div>
      </div>
    </footer>
  );
}
