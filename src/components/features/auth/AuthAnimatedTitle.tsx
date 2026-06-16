"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const FWD_COLORS = ["#20BEC6", "#ED008C", "#662D91", "#008FD5", "#FFCB05", "#F7901E"];

interface Props {
  highlight: string;
}

export default function AuthAnimatedTitle({ highlight }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef  = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const desc  = descRef.current;
    if (!title || !desc) return;

    const chars = title.querySelectorAll<HTMLSpanElement>(".auth-char");

    gsap.fromTo(
      chars,
      { opacity: 0, y: 40, rotateX: -70 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.028,
        duration: 0.65,
        ease: "back.out(1.5)",
        delay: 0.1,
        clearProps: "transform,opacity",
      },
    );

    gsap.fromTo(
      desc,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.85 },
    );
  }, []);

  const renderWord = (word: string, color: string, wordIdx: number) => {
    return word.split("").map((char, ci) => (
      <span
        key={`${wordIdx}-${ci}`}
        className="auth-char inline-block cursor-default"
        style={{ color, whiteSpace: "pre" }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          const hoverColor = FWD_COLORS[wordIdx % FWD_COLORS.length] ?? "#20BEC6";
          gsap.to(el, {
            y: -10,
            color: hoverColor,
            textShadow: `0 0 18px ${hoverColor}99`,
            scale: 1.15,
            duration: 0.18,
            ease: "power2.out",
          });
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          gsap.to(el, {
            y: 0,
            color,
            textShadow: "none",
            scale: 1,
            duration: 0.38,
            ease: "elastic.out(1,0.5)",
          });
        }}
      >
        {char}
      </span>
    ));
  };

  const beforeWords = "Avancemos hacia".split(" ");
  const afterWord   = "juntos.";
  const highlightWords = highlight.split(" ");

  return (
    <>
      <h2
        ref={titleRef}
        className="mt-4 font-display text-4xl font-black leading-tight xl:text-5xl"
        style={{ perspective: "600px" }}
      >
        {beforeWords.map((word, wi) => (
          <span key={`b${wi}`} className="inline-block">
            {renderWord(word, "#ffffff", wi)}
            <span className="auth-char inline-block" style={{ color: "#ffffff", whiteSpace: "pre" }}> </span>
          </span>
        ))}

        {/* Palabras destacadas — color sólido + glow pulsante */}
        {highlightWords.map((word, wi) => (
          <span key={`h${wi}`} className="inline-block auth-highlight-word">
            {word.split("").map((char, ci) => (
              <span
                key={`h${wi}-${ci}`}
                className="auth-char inline-block cursor-default"
                style={{ color: "#FFCB05", whiteSpace: "pre" }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    y: -10,
                    scale: 1.18,
                    color: "#F7901E",
                    textShadow: "0 0 22px rgba(255,203,5,0.9), 0 0 40px rgba(247,144,30,0.6)",
                    duration: 0.18,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    y: 0,
                    scale: 1,
                    color: "#FFCB05",
                    textShadow: "none",
                    duration: 0.38,
                    ease: "elastic.out(1,0.5)",
                  });
                }}
              >
                {char}
              </span>
            ))}
            {wi < highlightWords.length - 1 && (
              <span className="auth-char inline-block" style={{ color: "#FFCB05", whiteSpace: "pre" }}> </span>
            )}
          </span>
        ))}

        <span className="auth-char inline-block" style={{ color: "#ffffff", whiteSpace: "pre" }}> </span>
        <span className="inline-block">
          {renderWord(afterWord, "#ffffff", beforeWords.length + highlightWords.length)}
        </span>
      </h2>

      <style>{`
        @keyframes authPulse {
          0%, 100% { text-shadow: 0 0 10px rgba(255,203,5,0.4); }
          50%       { text-shadow: 0 0 22px rgba(255,203,5,0.85), 0 0 40px rgba(247,144,30,0.4); }
        }
        .auth-highlight-word { animation: authPulse 2.5s ease-in-out infinite; }
      `}</style>

      <p
        ref={descRef}
        className="mt-5 text-base leading-relaxed"
        style={{ color: "rgba(255,255,255,0.7)", opacity: 0 }}
      >
        Una comunidad que avanza en una misma dirección. Únete al
        marketplace que impulsa el progreso de Costa Rica.
      </p>
    </>
  );
}
