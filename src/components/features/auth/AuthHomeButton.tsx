"use client";

import { Link } from "@/i18n/navigation";
import { IconHome } from "@/components/ui/icons";

export default function AuthHomeButton() {
  return (
    <Link
      href="/"
      className="group absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 lg:right-6 lg:top-6"
      style={{
        background: "linear-gradient(135deg, #ED008C, #662D91)",
        boxShadow: "0 4px 18px rgba(237,0,140,0.45)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 28px rgba(237,0,140,0.65), 0 0 0 3px rgba(237,0,140,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 18px rgba(237,0,140,0.45)";
      }}
    >
      <IconHome
        width={16}
        height={16}
        className="transition-transform duration-200 group-hover:rotate-[-6deg]"
      />
      Inicio
    </Link>
  );
}
