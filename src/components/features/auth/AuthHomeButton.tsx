"use client";

import { Link } from "@/i18n/navigation";
import { IconHome } from "@/components/ui/icons";
import { GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";

type AuthHomeButtonProps = {
  userRole?: string | null;
};

const baseBubbleClass =
  "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95";

const defaultShadow = "0 4px 18px rgba(237,0,140,0.45)";
const hoverShadow =
  "0 8px 28px rgba(237,0,140,0.65), 0 0 0 3px rgba(237,0,140,0.2)";

export default function AuthHomeButton({ userRole }: AuthHomeButtonProps) {
  const pathname = usePathname();
  const onRegisterPage = pathname?.includes("register-estudiante") || pathname?.includes("registro/estudiante");
  const showStudentRegister = userRole !== "estudiante" && !onRegisterPage;

  return (
    <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-3 lg:right-6 lg:top-6">
      <Link
        href="/"
        className={baseBubbleClass}
        style={{
          background: "linear-gradient(135deg, #ED008C, #662D91)",
          boxShadow: defaultShadow,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = hoverShadow;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = defaultShadow;
        }}
      >
        <IconHome
          width={16}
          height={16}
          className="transition-transform duration-200 group-hover:rotate-[-6deg]"
        />
        Inicio
      </Link>

      {showStudentRegister ? (
        <Link
          href="/registro/estudiante"
          className={baseBubbleClass}
          style={{
            background: "linear-gradient(135deg, #662D91, #EC008C)",
            boxShadow: defaultShadow,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = hoverShadow;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = defaultShadow;
          }}
        >
          <GraduationCap
            size={16}
            strokeWidth={2.2}
            className="transition-transform duration-200 group-hover:rotate-[-6deg]"
          />
          Registro Estudiante
        </Link>
      ) : null}
    </div>
  );
}
