"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useIntro } from "./IntroContext";
import RollText from "./RollText";

const LINKS = [
  { href: "#concept", label: "Concept" },
  { href: "#philosophy", label: "Philosophy" },
  { href: "#reviews", label: "Reviews" },
  { href: "#science", label: "Science" },
  { href: "#archive", label: "Archive" },
];

export default function Navbar() {
  const { introDone } = useIntro();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-paper transition-shadow duration-500 ${
          scrolled ? "shadow-[0_1px_0_0_var(--color-hairline)]" : ""
        }`}
      >
        <nav className="flex h-[78px] items-center justify-between px-6 md:px-[80px]">
          {/* Nav logo — revealed once the giant hero logo has shrunk down */}
          <a
            href="#top"
            id="nav-logo"
            className={`font-display type-logo font-bold transition-opacity duration-300 ${
              introDone ? "opacity-100" : "opacity-0"
            }`}
            aria-label="HISKIN — back to top"
          >
            HISKIN
          </a>

          <div
            className={`hidden items-center gap-11 transition-opacity delay-150 duration-700 md:flex ${
              introDone ? "opacity-100" : "opacity-0"
            }`}
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group/roll type-nav font-medium text-ink"
              >
                <RollText>{link.label}</RollText>
              </a>
            ))}
            <a
              href="#inquiry"
              className="group/roll ml-2 flex items-center gap-2 type-nav font-medium text-ink"
            >
              <RollText>B2B Inquiry</RollText>
              <ArrowRight
                className="h-[18px] w-[18px] transition-transform duration-300 group-hover/roll:translate-x-1"
                strokeWidth={1.8}
              />
            </a>
          </div>

          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className={`transition-opacity duration-700 md:hidden ${
              introDone ? "opacity-100" : "opacity-0"
            }`}
          >
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[90] bg-paper transition-all duration-500 md:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex h-[78px] items-center justify-between px-6">
          <span className="font-display type-logo font-bold">
            HISKIN
          </span>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex flex-col px-6 pt-10">
          {LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`border-b border-hairline py-5 font-display type-h3 font-semibold transition-all duration-500 ${
                menuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: `${100 + i * 60}ms` }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#inquiry"
            onClick={() => setMenuOpen(false)}
            className="mt-10 flex items-center justify-center gap-2 bg-ink px-6 py-4 text-center type-body-sm font-medium text-white"
          >
            B2B Inquiry <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </>
  );
}
