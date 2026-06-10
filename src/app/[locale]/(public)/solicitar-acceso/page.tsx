import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { FwdLogo } from "@/components/ui/fwd-logo";

export const metadata: Metadata = {
  title: "Solicitar acceso · FWD Costa Rica",
};

const CORREO = "contacto@fwdcostarica.com";

export default function SolicitarAccesoPage() {
  const mailto = `mailto:${CORREO}?subject=${encodeURIComponent(
    "Solicitud de invitación a FWD Marketplace",
  )}&body=${encodeURIComponent(
    "Hola equipo FWD,\n\nMe gustaría solicitar una invitación para unirme a FWD Marketplace.\n\nNombre:\nCorreo:\nComentario:\n",
  )}`;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-fwd-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <FwdLogo />
          <Link
            href="/login"
            className="text-sm font-semibold text-fwd-blue transition hover:text-fwd-purple"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fwd-blue">
          Acceso por invitación
        </p>
        <h1 className="mt-3 font-display text-3xl font-black text-fwd-ink sm:text-4xl">
          Solicitá una invitación
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-fwd-ink/70">
          FWD Marketplace es una comunidad por invitación: el ingreso de estudiantes es
          aprobado por el equipo de FWD · Costa Rica. Si todavía no recibiste tu invitación,
          escribinos y con gusto revisamos tu solicitud.
        </p>

        <a
          href={mailto}
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-7 font-semibold text-white shadow-sm transition hover:bg-fwd-purple"
        >
          Escribir al equipo FWD
          <span aria-hidden="true">▶</span>
        </a>

        <p className="mt-4 text-sm text-fwd-ink/60">
          O escribinos directamente a{" "}
          <a href={`mailto:${CORREO}`} className="font-semibold text-fwd-blue hover:text-fwd-purple">
            {CORREO}
          </a>
          .
        </p>

        <div className="mt-10 border-t border-fwd-ink/10 pt-6">
          <Link
            href="/register-estudiante"
            className="text-sm font-semibold text-fwd-blue transition hover:text-fwd-purple"
          >
            ¿Ya tenés invitación? Registrate →
          </Link>
        </div>
      </main>
    </div>
  );
}
