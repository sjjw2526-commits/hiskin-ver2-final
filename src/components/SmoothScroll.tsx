"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** The fixed navbar's height; scroll targets land just below it. */
export const HEADER_OFFSET = 78;

// The running Lenis instance, when there is one (desktop, motion allowed).
// Lenis owns the scroll position there, so components scroll through it and
// stay on the same easing as every other scroll on the page.
let active: Lenis | null = null;

/**
 * Smooth-scrolls until `el`'s top sits just below the navbar: through Lenis
 * where it runs, native smooth scrolling on phones, and a plain jump when the
 * reader prefers reduced motion.
 */
export function scrollToElement(el: HTMLElement, duration = 1) {
  if (active) {
    active.scrollTo(el, { offset: -HEADER_OFFSET, duration });
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
    behavior: reduced ? "auto" : "smooth",
  });
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  // Triggers are measured when they are created, before the images below them
  // have loaded. Every photo that arrives late changes the page height, and
  // every trigger under it is then aiming at a position that has moved. One
  // re-measure once the page has genuinely finished loading fixes the lot.
  // Kept out of the Lenis effect below because that one returns early when
  // the reader prefers reduced motion — the stale measurements happen either
  // way.
  useEffect(() => {
    if (document.readyState === "complete") {
      ScrollTrigger.refresh();
      return;
    }
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Second half of the reset started by the inline script in the document
  // head. Browsers can put the offset back a second time — after bfcache
  // restore, and on the reload that follows a Fast Refresh — so this pins it
  // again once React is running, before Lenis reads the position below.
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.scrollTo(0, 0);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // Phones already scroll with momentum, and a touch drag moves the page
    // itself rather than the wheel delta Lenis smooths — so the two run as
    // competing eases over the same gesture and the result reads as stutter.
    // Native scrolling is the smoother of the two here; ScrollTrigger drives
    // off it either way.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    // Tuned to project-pef.com's wheel feel, measured on 2026-09-13 with the
    // same wheel input on both sites (one 100px notch, from the first frame
    // that moves): the reference reaches 50% / 90% / 99% of the notch at
    // ~156 / 453 / 671ms. That shape is a ~1s ease-out-quart; the previous
    // 1.15s expo-out leapt off the mark (50% at ~108ms), and Lenis's default
    // lerp 0.1 measured the same. Anchor links and the science accordion pass
    // their own durations to scrollTo and keep this easing.
    const lenis = new Lenis({
      duration: 1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
    active = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anchor links → smooth scroll
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!target) return;
      const id = target.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -HEADER_OFFSET, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      active = null;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
