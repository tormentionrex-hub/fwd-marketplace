"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AnimationsInit() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    /* ── 1. Hero entrance (staggered on load) */
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .from("[data-hero='badge']", {
        opacity: 0, x: -30, duration: 0.7, delay: 0.3,
      })
      .from("[data-hero='title']", {
        opacity: 0, y: 60, duration: 0.9,
      }, "-=0.3")
      .from("[data-hero='desc']", {
        opacity: 0, y: 30, duration: 0.7,
      }, "-=0.5")
      .from("[data-hero='cta'] > *", {
        opacity: 0, y: 20, stagger: 0.15, duration: 0.6,
      }, "-=0.4");

    /* ── 2. Scroll-triggered section headings */
    gsap.utils.toArray<HTMLElement>("[data-reveal='heading']").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    /* ── 3. Fade-up generic elements */
    gsap.utils.toArray<HTMLElement>("[data-reveal='fade-up']").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });

    /* ── 4. Staggered card grids */
    gsap.utils.toArray<HTMLElement>("[data-reveal='stagger']").forEach((container) => {
      const children = container.children;
      gsap.from(children, {
        opacity: 0,
        y: 50,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    /* ── 5. Fade from left */
    gsap.utils.toArray<HTMLElement>("[data-reveal='fade-left']").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        x: -60,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });

    /* ── 6. Fade from right */
    gsap.utils.toArray<HTMLElement>("[data-reveal='fade-right']").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        x: 60,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });

    /* ── 7. Scale-in cards */
    gsap.utils.toArray<HTMLElement>("[data-reveal='scale']").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        scale: 0.88,
        duration: 0.7,
        ease: "back.out(1.6)",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });


    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
