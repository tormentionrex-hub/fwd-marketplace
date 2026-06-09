import type { ReactNode } from "react";

interface BrandBackgroundProps {
  children?: ReactNode;
  className?: string;
  intensity?: "subtle" | "normal" | "vivid";
}

const intensityOpacity: Record<NonNullable<BrandBackgroundProps["intensity"]>, string> = {
  subtle: "opacity-30",
  normal: "opacity-60",
  vivid: "opacity-100",
};

export default function BrandBackground({
  children,
  className = "",
  intensity = "subtle",
}: BrandBackgroundProps) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-cover bg-center ${intensityOpacity[intensity]}`}
        style={{ backgroundImage: "url('/fwd-arrows-bg.svg')" }}
      />
      {children}
    </div>
  );
}
