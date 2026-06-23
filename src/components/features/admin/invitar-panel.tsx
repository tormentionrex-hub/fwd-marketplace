"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Send, RefreshCw, Trash2, Mail } from "lucide-react";
import {
  confirmarEliminacion,
  toastExito,
  alertaError,
} from "@/lib/sweetalert-admin";

export type InvitacionRow = {
  id: string;
  email: string;
  rol: string | null;
  relativo: string | null;
};

type RolOpt = { value: string; label: string };

// Panel reutilizable para invitar por correo con un rol y gestionar las
// invitaciones enviadas (reenviar / revocar). Reusa /api/admin/invitar.
export function InvitarPanel({
  roles,
  rolDefault,
  etiquetaRol,
  invitaciones,
}: {
  roles: RolOpt[];
  rolDefault: string;
  etiquetaRol: Record<string, string>;
  invitaciones: InvitacionRow[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState(rolDefault);
  const [enviando, setEnviando] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function invitar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/invitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), rol }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alertaError(data?.error ?? "No se pudo enviar la invitación.");
        return;
      }
      toastExito(data?.mensaje ?? "Invitación enviada.");
      setEmail("");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function reenviar(id: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/invitar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alertaError(data?.error ?? "No se pudo reenviar la invitación.");
        return;
      }
      toastExito(data?.mensaje ?? "Invitación reenviada.");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  async function revocar(id: string, correo: string) {
    const ok = await confirmarEliminacion({
      titulo: "¿Revocar invitación?",
      texto: `${correo} ya no podrá registrarse con ese enlace.`,
      confirmText: "Revocar",
    });
    if (!ok) return;
    setBusy(id);
    try {
      const res = await fetch("/api/admin/invitar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alertaError(data?.error ?? "No se pudo revocar la invitación.");
        return;
      }
      toastExito(data?.mensaje ?? "Invitación revocada.");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Formulario de invitación */}
      <form
        onSubmit={invitar}
        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-white/60">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="persona@correo.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-fwd-blue focus:bg-white/10 focus:ring-2 focus:ring-fwd-blue/20 sm:max-w-md"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">Rol</label>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => {
              const activo = rol === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRol(r.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    activo
                      ? "bg-fwd-magenta text-white shadow-sm"
                      : "bg-white/5 text-white/55 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando || !email.trim()}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-fwd-blue px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-fwd-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {enviando ? "Enviando…" : "Enviar invitación"}
        </button>
      </form>

      {/* Invitaciones enviadas */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm">
        <h3 className="mb-4 font-display text-base font-bold text-white">
          Invitaciones enviadas ({invitaciones.length})
        </h3>
        {invitaciones.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Mail className="h-7 w-7 text-white/25" />
            <p className="text-sm text-white/40">No hay invitaciones pendientes.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-white/[0.07]">
            {invitaciones.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{inv.email}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-fwd-purple/20 px-2 py-0.5 text-[11px] font-semibold text-fwd-purple">
                      {inv.rol ? etiquetaRol[inv.rol] ?? inv.rol : "Estudiante"}
                    </span>
                    <span className="text-[11px] text-white/35">{inv.relativo ?? ""}</span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reenviar(inv.id)}
                    disabled={busy === inv.id}
                    title="Reenviar invitación"
                    className="rounded-lg p-1.5 text-fwd-turquoise transition hover:bg-fwd-turquoise/15 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => revocar(inv.id, inv.email)}
                    disabled={busy === inv.id}
                    title="Revocar invitación"
                    className="rounded-lg bg-red-500/15 p-1.5 text-red-500 transition hover:bg-red-500/25 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2.3} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
