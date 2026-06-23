"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Send, Mail, RefreshCw, Trash2, Check, X, Inbox } from "lucide-react";
import {
  confirmarEliminacion,
  confirmarAccion,
  toastExito,
  alertaError,
} from "@/lib/sweetalert-admin";
import { PanelCard } from "./panel-card";
import type {
  InvitacionItem,
  SolicitudItem,
} from "@/server/services/dashboard-admin.service";

// Roles que se pueden invitar (en sync con ROLES_INVITABLES de
// src/server/auth/roles.ts). Solo 'owner' y 'admin' acceden al panel por ahora;
// 'staff'/'moderator' se crean pero su acceso se habilita más adelante.
const ROLES: Array<{ value: string; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "moderator", label: "Moderador" },
];

const ETIQUETA_ROL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  moderator: "Moderador",
  estudiante: "Estudiante",
  empresario: "Empresario",
};

export function InvitacionesPanel({
  invitaciones,
  solicitudes,
}: {
  invitaciones: InvitacionItem[];
  solicitudes: SolicitudItem[];
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<string>("admin");
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

  async function accionInvitacion(id: string, metodo: "PATCH" | "DELETE") {
    if (metodo === "DELETE") {
      const ok = await confirmarEliminacion({
        titulo: "¿Revocar invitación?",
        texto: "La persona ya no podrá registrarse con ese enlace.",
        confirmText: "Revocar",
      });
      if (!ok) return;
    }
    setBusy(id);
    try {
      const res = await fetch("/api/admin/invitar", {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alertaError(data?.error ?? "No se pudo procesar la invitación.");
        return;
      }
      toastExito(data?.mensaje ?? "Listo.");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  async function accionSolicitud(id: string, accion: "aprobar" | "rechazar") {
    const ok =
      accion === "aprobar"
        ? await confirmarAccion({
            titulo: "¿Aprobar esta solicitud?",
            texto: "Se enviará una invitación al correo para completar el registro.",
            confirmText: "Aprobar",
            icon: "question",
          })
        : await confirmarAccion({
            titulo: "¿Rechazar esta solicitud?",
            texto: "Se le notificará por correo que fue rechazada.",
            confirmText: "Rechazar",
            icon: "warning",
            peligro: true,
          });
    if (!ok) return;
    setBusy(id);
    try {
      const res = await fetch("/api/admin/verificaciones", {
        method: accion === "aprobar" ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alertaError(data?.error ?? "No se pudo procesar la solicitud.");
        return;
      }
      toastExito(accion === "aprobar" ? "Invitación enviada." : "Solicitud rechazada.");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Invitar nuevo miembro ─────────────────────────── */}
      <PanelCard title="Invitar miembro">
        <form onSubmit={invitar} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/55">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="persona@correo.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-fwd-blue focus:bg-white/10 focus:ring-2 focus:ring-fwd-blue/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/55">
              Rol
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => {
                const activo = rol === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRol(r.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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
            <p className="mt-1.5 text-xs text-white/35">
              Owner y Admin acceden al panel. Staff y Moderador se crean para uso futuro.
            </p>
          </div>

          <button
            type="submit"
            disabled={enviando || !email.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-fwd-blue px-4 py-2.5 text-sm font-bold text-white shadow transition hover:bg-fwd-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {enviando ? "Enviando…" : "Enviar invitación"}
          </button>
        </form>
      </PanelCard>

      {/* ── Invitaciones enviadas ─────────────────────────── */}
      <PanelCard title={`Invitaciones enviadas (${invitaciones.length})`}>
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
                  <p className="truncate text-sm font-medium text-white">
                    {inv.email}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-fwd-purple/20 px-2 py-0.5 text-[11px] font-semibold text-fwd-purple">
                      {inv.rol ? ETIQUETA_ROL[inv.rol] ?? inv.rol : "Estudiante"}
                    </span>
                    <span className="text-[11px] text-white/35">
                      {inv.relativo ?? ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => accionInvitacion(inv.id, "PATCH")}
                    disabled={busy === inv.id}
                    title="Reenviar invitación"
                    className="rounded-lg p-1.5 text-fwd-turquoise transition hover:bg-fwd-turquoise/15 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => accionInvitacion(inv.id, "DELETE")}
                    disabled={busy === inv.id}
                    title="Revocar invitación"
                    className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-400/15 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      {/* ── Solicitudes de acceso ─────────────────────────── */}
      <PanelCard title={`Solicitudes de acceso (${solicitudes.length})`}>
        {solicitudes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Inbox className="h-7 w-7 text-white/25" />
            <p className="text-sm text-white/40">No hay solicitudes pendientes.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-white/[0.07]">
            {solicitudes.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {s.email}
                  </p>
                  <p className="text-[11px] text-white/35">{s.relativo ?? ""}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => accionSolicitud(s.id, "aprobar")}
                    disabled={busy === s.id}
                    title="Aprobar solicitud"
                    className="rounded-lg p-1.5 text-emerald-500 transition hover:bg-emerald-500/15 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => accionSolicitud(s.id, "rechazar")}
                    disabled={busy === s.id}
                    title="Rechazar solicitud"
                    className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-400/15 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
    </div>
  );
}
