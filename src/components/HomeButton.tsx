"use client";

import { Link } from "@/i18n/navigation";
import { Home } from "lucide-react";

export default function HomeButton() {
  return (
    <Link
      href="/"
      className="group fixed right-6 top-6 z-50 inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95"
      style={{
        background: "linear-gradient(135deg, #008FD5, #20BEC6)",
        boxShadow: "0 4px 20px rgba(0,143,213,0.4)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px rgba(0,143,213,0.65), 0 0 0 3px rgba(32,190,198,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 20px rgba(0,143,213,0.4)";
      }}
    >
      {/* Shine sweep */}
      <span className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/30 transition-transform duration-500 group-hover:translate-x-[200%]" />
      <Home
        size={16}
        className="relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12"
      />
      <span className="relative z-10">Home</span>
    </Link>
  );
}
