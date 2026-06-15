"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const HOVER_COLORS = ["#008FD5", "#20BEC6", "#662D91", "#ED008C", "#FFCB05", "#F7901E"];

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-fwd-azul">
          <span className="h-1.5 w-6 rounded-full bg-gradient-fwd" />
          {eyebrow}
        </span>
      )}

      <h2 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
        {typeof title === "string"
          ? title.split(" ").map((word, i) => (
              <span
                key={i}
                className="inline-block mr-[0.25em] cursor-default transition-all duration-200 hover:-translate-y-1 hover:font-black"
                onMouseEnter={(e) => {
                  const color = HOVER_COLORS[i % HOVER_COLORS.length] ?? "#008FD5";
                  (e.currentTarget as HTMLElement).style.color = color;
                  (e.currentTarget as HTMLElement).style.textShadow = `0 0 24px ${color}66`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "";
                  (e.currentTarget as HTMLElement).style.textShadow = "none";
                }}
              >
                {word}
              </span>
            ))
          : title}
      </h2>

      {description && (
        <p
          className={cn(
            "mt-3 max-w-2xl text-base text-text-muted sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
