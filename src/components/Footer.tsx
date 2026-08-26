"use client";

import { ArrowUp } from "lucide-react";
import RollText from "./RollText";

const MENU = [
  { href: "#concept", label: "Concept" },
  { href: "#reviews", label: "Reviews" },
  { href: "#philosophy", label: "Philosophy" },
  { href: "#science", label: "Science" },
  { href: "#inquiry", label: "B2B Inquiry" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="px-6 py-16 md:px-[80px] md:py-24">
        <div className="flex flex-col justify-between gap-14 md:flex-row">
          <div>
            <p className="font-display type-wordmark font-bold">
              HISKIN
            </p>
            <div className="mt-10 space-y-2 type-body-sm text-white/60">
              <p>
                <span className="mr-3 font-semibold text-white/85">TEL</span>
                +82 (0)2-0000-0000
              </p>
              <p>
                <span className="mr-3 font-semibold text-white/85">E-MAIL</span>
                <a
                  href="mailto:b2b@hiskin.co.kr"
                  className="transition-colors hover:text-white"
                >
                  b2b@hiskin.co.kr
                </a>
              </p>
              <p>
                <span className="mr-3 font-semibold text-white/85">
                  ADDRESS
                </span>
                Seoul, Republic of Korea
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

        <div className="mt-20 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="type-caption text-white/40">
            Copyright © 2026 HISKIN Inc. All Rights Reserved
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
