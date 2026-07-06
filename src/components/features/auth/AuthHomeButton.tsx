"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { IconHome } from "@/components/ui/icons";
import { GraduationCap } from "lucide-react";

type AuthHomeButtonProps = {
  userRole?: string | null;
  showHome?: boolean;
  showStudentRegister?: boolean;
};

const baseBubbleClass =
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold leading-none text-white shadow-lg transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 sm:px-5";

const defaultShadow = "0 4px 18px rgba(237,0,140,0.45)";
const hoverShadow =
  "0 8px 28px rgba(237,0,140,0.65), 0 0 0 3px rgba(237,0,140,0.2)";

export default function AuthHomeButton({
  userRole,
  showHome = true,
  showStudentRegister = true,
}: AuthHomeButtonProps) {
  const pathname = usePathname();
  const onStudentRegisterPage =
    pathname?.includes("/register-estudiante") ||
    pathname?.includes("/registro/estudiante");
  const onLoginPage = pathname?.includes("/login");
  const shouldShowStudentRegister =
    showStudentRegister &&
    userRole !== "estudiante" &&
    !onStudentRegisterPage &&
    !onLoginPage;

  return (
    <div className="fixed right-3 top-3 z-[1000] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:right-5 sm:top-5 sm:gap-3 lg:right-6 lg:top-6">
      {showHome ? (
        <Link
          href="/"
          aria-label="Ir al inicio"
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
            className="shrink-0 transition-transform duration-200 group-hover:rotate-[-6deg]"
          />
          <span>Inicio</span>
        </Link>
      ) : null}

      {shouldShowStudentRegister ? (
        <Link
          href="/register-estudiante"
          aria-label="Ir al registro de estudiante"
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
            className="shrink-0 transition-transform duration-200 group-hover:rotate-[-6deg]"
          />
          <span>Registro estudiante</span>
        </Link>
      ) : null}
    </div>
  );
}
