import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { RegistroInvitacionForm } from "@/components/features/auth/registro-invitacion-form";
import { verificarInvitacion } from "@/server/auth/invite-token";

export const metadata: Metadata = {
  title: "Completar invitación · FWD Costa Rica",
};

// Página dinámica: depende del token de la URL.
export const dynamic = "force-dynamic";

const ETIQUETA_ROL: Record<string, string> = {
  admin: "administrador",
  editor: "editor",
  moderator: "moderador",
  empresario: "empresario",
  estudiante: "estudiante",
};

// URL: /es/unirse?token=... — registro por invitación.
// Valida el token firmado en el servidor; si es válido muestra el formulario,
// si no, un mensaje de error. El email y el rol salen del token (no editables).
export default async function UnirsePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const payload = token ? verificarInvitacion(token) : null;

  if (!payload || !token) {
    return (
      <AuthShell highlight="FWD Costa Rica">
        <div>
          <h1 className="font-display text-3xl font-black text-fwd-ink dark:text-white">
            Invitación no válida
          </h1>
          <p className="mt-3 text-fwd-ink/60 dark:text-white/60">
            El enlace de invitación es inválido o ya venció. Pedile al equipo de
            FWD que te envíe una nueva invitación.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-fwd-blue px-6 font-semibold text-white transition hover:bg-fwd-purple"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell highlight="el equipo FWD">
      <RegistroInvitacionForm
        token={token}
        email={payload.email}
        rolLabel={ETIQUETA_ROL[payload.rol] ?? payload.rol}
      />
    </AuthShell>
  );
}
