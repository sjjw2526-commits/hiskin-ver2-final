"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useIntro } from "./IntroContext";

const LETTERS = ["H", "I", "S", "K", "I", "N"];

export default function Preloader() {
  const { setIntroDone } = useIntro();
  const [hidden, setHidden] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const group = groupRef.current;
      if (!overlay || !group) return;

      const finish = () => {
        document.documentElement.classList.remove("is-loading");
        setIntroDone(true);
        setHidden(true);
      };

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        finish();
        return;
      }

      const letters = group.querySelectorAll<HTMLElement>("[data-letter]");
      const dots = group.querySelectorAll<HTMLElement>("[data-dot]");

      const tl = gsap.timeline();

      tl.from(letters, {
        yPercent: 130,
        opacity: 0,
        duration: 0.85,
        ease: "power4.out",
        stagger: 0.07,
        delay: 0.25,
      })
        .from(
          dots,
          {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.06,
          },
          "<0.15"
        )
        .to({}, { duration: 0.55 }) // hold
        .to(dots, {
          opacity: 0,
          width: 0,
          marginLeft: 0,
          marginRight: 0,
          duration: 0.45,
          ease: "power3.inOut",
        })
        .call(() => {
          // Measure after dots collapsed, then dissolve into the nav logo
          const logo = document.getElementById("nav-logo");
          const sub = gsap.timeline({ onComplete: finish });

          if (logo) {
            const logoRect = logo.getBoundingClientRect();
            const groupRect = group.getBoundingClientRect();
            const scale = logoRect.height / groupRect.height;

            sub
              .to(group, {
                x: logoRect.left - groupRect.left,
                y:
                  logoRect.top -
                  groupRect.top +
                  (logoRect.height - groupRect.height * scale) / 2,
                scale,
                transformOrigin: "left top",
                duration: 0.9,
                ease: "power4.inOut",
              })
              .to(
                overlay,
                { backgroundColor: "rgba(255,255,255,0)", duration: 0.7 },
                "<0.2"
              )
              .to(group, { opacity: 0, duration: 0.25 }, "-=0.15");
          } else {
            sub.to(overlay, { opacity: 0, duration: 0.6 });
          }
        });
    },
    { scope: overlayRef }
  );

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-paper"
      aria-hidden
    >
      <div
        ref={groupRef}
        className="flex items-baseline font-display type-counter font-semibold text-ink"
      >
        {LETTERS.map((letter, i) => (
          <span key={i} className="flex items-baseline overflow-hidden">
            <span data-letter className="inline-block">
              {letter}
            </span>
            {i < LETTERS.length - 1 && (
              /* em-relative on purpose: the dot scales with .type-counter,
                 which a fixed step from the type scale could not do. */
              <span
                data-dot
                className="mx-[0.35em] inline-block text-[0.35em] leading-none text-mute"
              >
                ·
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
