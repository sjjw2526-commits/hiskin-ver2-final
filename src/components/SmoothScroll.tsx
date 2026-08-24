"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

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
      lenis.scrollTo(el as HTMLElement, { offset: -78, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
