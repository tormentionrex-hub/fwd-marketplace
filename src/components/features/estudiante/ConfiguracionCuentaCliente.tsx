"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { cerrarSesionCliente } from "@/lib/logout-client";
import {
  AREAS_FWD, TECNOLOGIAS_FWD, TIPOS_PROYECTO, MODALIDADES, MODALIDAD_LABEL,
  completitudEmpleabilidad, NOTIF_ROWS, PRIV_ROWS,
  type Empleabilidad, type NotifPrefs, type PrivPrefs,
} from "@/lib/empleabilidad";

// ── Helpers de SweetAlert (tematizados claro/oscuro, sin emojis: REGLA #6) ──
function tema(): { background: string; color: string } {
  const dark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return dark ? { background: "#0f172a", color: "#f1f5f9" } : { background: "#ffffff", color: "#0C1B33" };
}
function estiloInput(): string {
  const dark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  return dark
    ? "background:#1e293b;color:#f1f5f9;border:1px solid rgba(255,255,255,0.15)"
    : "";
}
const MORADO = "#662D91";
const ROJO = "#dc2626";

function alertaError(mensaje: string) {
  void Swal.fire({ ...tema(), icon: "error", title: "Error", text: mensaje, confirmButtonColor: ROJO, confirmButtonText: "Entendido" });
}
function toastExito(mensaje: string) {
  void Swal.fire({ ...tema(), toast: true, position: "top-end", icon: "success", title: mensaje, showConfirmButton: false, timer: 2400, timerProgressBar: true });
}

interface EvaluacionRecibida {
  id: string;
  puntuacion: number;
  comentario: string | null;
  creado: string;
  proyecto: string | null;
  empresa: string;
}

interface Props {
  locale: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  reputacion: number;
  empleabilidad: Empleabilidad;
  notif: NotifPrefs;
  priv: PrivPrefs;
  evaluaciones: EvaluacionRecibida[];
}

// Interruptor on/off.
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ background: on ? "#662D91" : "rgba(148,163,184,0.5)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

// ── Iconos inline ──
const IcoChevron = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "none" }}><path d="M9 18l6-6-6-6" /></svg>
);

// Chip seleccionable (áreas, tecnologías, tipo de proyecto).
function ChipToggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
        (on
          ? "border-[#662D91] bg-[#662D91] text-white"
          : "border-[#E4E9F1] bg-transparent text-[#4C5E7C] hover:bg-[#F4F6FB] dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10")
      }
    >
      {label}
    </button>
  );
}

// "Cuenta" siempre va de primero.
const GRUPOS: { grupo: string; items: { id: string; label: string }[] }[] = [
  {
    grupo: "Cuenta",
    items: [
      { id: "info", label: "Información de cuenta" },
      { id: "seguridad", label: "Contraseña y seguridad" },
      { id: "reputacion", label: "Reputación de la cuenta" },
    ],
  },
  { grupo: "Empleabilidad", items: [{ id: "empleabilidad", label: "Preferencias de empleabilidad" }] },
  { grupo: "Notificaciones", items: [{ id: "notificaciones", label: "Notificaciones" }] },
  { grupo: "Privacidad", items: [{ id: "privacidad", label: "Privacidad" }] },
  {
    grupo: "General",
    items: [
      { id: "datos", label: "Datos y descargas" },
      { id: "ayuda", label: "Ayuda y soporte" },
    ],
  },
];
const IDS = GRUPOS.flatMap((g) => g.items.map((i) => i.id));

export default function ConfiguracionCuentaCliente({ locale, nombre: nombreInicial, correo: correoInicial, telefono: telInicial, reputacion, empleabilidad: empInicial, notif: notifInicial, priv: privInicial, evaluaciones }: Props) {
  const router = useRouter();
  const [nombre, setNombre] = useState(nombreInicial);
  const [correo, setCorreo] = useState(correoInicial);
  const [telefono, setTelefono] = useState<string | null>(telInicial);
  const [mostrarCorreo, setMostrarCorreo] = useState(false);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({ Cuenta: true, Empleabilidad: true, Notificaciones: true, Privacidad: true, General: true });
  const [activo, setActivo] = useState("info");
  const [emp, setEmp] = useState<Empleabilidad>(empInicial);
  const [guardandoEmp, setGuardandoEmp] = useState(false);
  const [notif, setNotif] = useState<NotifPrefs>(notifInicial);
  const [priv, setPriv] = useState<PrivPrefs>(privInicial);

  // Scroll-spy: resalta el apartado según el scroll.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActivo(e.target.id); });
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    IDS.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const pctEmp = completitudEmpleabilidad(emp);

  function toggleEmp(key: "areas" | "tecnologias" | "tipoProyecto", value: string) {
    setEmp((e) => ({
      ...e,
      [key]: e[key].includes(value) ? e[key].filter((x) => x !== value) : [...e[key], value],
    }));
  }

  async function guardarEmp() {
    setGuardandoEmp(true);
    try {
      const res = await fetch("/api/estudiante/preferencias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empleabilidad: emp }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { alertaError(data?.error ?? "No se pudieron guardar las preferencias."); return; }
      if (data?.empleabilidad) setEmp(data.empleabilidad);
      toastExito("Preferencias guardadas");
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setGuardandoEmp(false);
    }
  }

  // Auto-guardado de toggles (notificaciones / privacidad): optimista + revertir si falla.
  async function patchPref(seccion: "notif" | "priv", valor: NotifPrefs | PrivPrefs): Promise<boolean> {
    try {
      const res = await fetch("/api/estudiante/preferencias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [seccion]: valor }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function toggleNotif(key: keyof NotifPrefs) {
    const nuevo = { ...notif, [key]: !notif[key] };
    setNotif(nuevo);
    if (!(await patchPref("notif", nuevo))) { setNotif(notif); alertaError("No se pudo guardar el cambio."); }
  }

  async function togglePriv(key: keyof PrivPrefs) {
    const nuevo = { ...priv, [key]: !priv[key] };
    setPriv(nuevo);
    if (!(await patchPref("priv", nuevo))) { setPriv(priv); alertaError("No se pudo guardar el cambio."); }
  }

  // ── Datos y descargas ──
  async function descargarCv() {
    try {
      const res = await fetch("/api/estudiante/cv/descargar");
      if (res.ok) window.open(res.url, "_blank");
      else alertaError("No tenés un CV cargado. Subilo en Mi perfil → Currículum.");
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    }
  }

  function descargarDatos() {
    window.location.href = "/api/estudiante/datos";
  }

  // ── Ayuda y soporte ──
  async function escribirEquipo() {
    const r = await Swal.fire({
      ...tema(), title: "Escribir al equipo FWD", input: "textarea",
      inputPlaceholder: "Contanos en qué te ayudamos...", inputAttributes: { style: estiloInput() },
      showCancelButton: true, confirmButtonText: "Enviar", cancelButtonText: "Cancelar", confirmButtonColor: MORADO,
      inputValidator: (v) => (!v || v.trim().length < 5 ? "Escribí tu mensaje" : undefined),
    });
    if (!r.isConfirmed || !r.value) return;
    const res = await fetch("/api/contacto", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: correo, mensaje: String(r.value).trim() }),
    });
    if (!res.ok) { const d = await res.json().catch(() => null); alertaError(d?.error ?? "No se pudo enviar el mensaje."); return; }
    toastExito("Mensaje enviado al equipo FWD");
  }

  // ── Reputación: apelar una evaluación (se envía al equipo por contacto) ──
  async function apelar(ev: EvaluacionRecibida) {
    const r = await Swal.fire({
      ...tema(), title: "Apelar evaluación",
      html: `Evaluación de <b>${ev.empresa}</b>${ev.proyecto ? ` — ${ev.proyecto}` : ""} (${ev.puntuacion}/5).<br>Contanos por qué apelás; el equipo de FWD lo revisará.`,
      input: "textarea", inputPlaceholder: "Motivo de la apelación...", inputAttributes: { style: estiloInput() },
      showCancelButton: true, confirmButtonText: "Enviar apelación", cancelButtonText: "Cancelar", confirmButtonColor: MORADO,
      inputValidator: (v) => (!v || v.trim().length < 10 ? "Escribí el motivo (mínimo 10 caracteres)" : undefined),
    });
    if (!r.isConfirmed || !r.value) return;
    const mensaje =
      `APELACIÓN DE EVALUACIÓN\nEmpresa: ${ev.empresa}\nProyecto: ${ev.proyecto ?? "—"}\n` +
      `Puntuación: ${ev.puntuacion}/5\nComentario: ${ev.comentario ?? "—"}\n\nMotivo del estudiante:\n${String(r.value).trim()}`;
    const res = await fetch("/api/contacto", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: correo, mensaje }),
    });
    if (!res.ok) { const d = await res.json().catch(() => null); alertaError(d?.error ?? "No se pudo enviar la apelación."); return; }
    toastExito("Apelación enviada al equipo FWD");
  }

  function irA(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActivo(id);
  }

  const dominio = correo.split("@")[1] ?? "";
  const localMasked = "•".repeat(Math.min((correo.split("@")[0] ?? "").length, 14));
  const correoVisible = mostrarCorreo ? correo : `${localMasked}@${dominio}`;

  // ── CRUD de cada campo ──
  async function patch(campo: "nombre" | "correo" | "telefono", valor: string): Promise<boolean> {
    const res = await fetch("/api/estudiante/cuenta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campo, valor }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) { alertaError(data?.error ?? "No se pudo guardar el cambio."); return false; }
    return true;
  }

  async function editarNombre() {
    const r = await Swal.fire({
      ...tema(), title: "Editar nombre", input: "text", inputValue: nombre,
      inputAttributes: { maxlength: "80", style: estiloInput() },
      showCancelButton: true, confirmButtonText: "Guardar", cancelButtonText: "Cancelar", confirmButtonColor: MORADO,
      inputValidator: (v) => (!v || v.trim().length < 2 ? "Ingresá un nombre válido" : undefined),
    });
    if (!r.isConfirmed || !r.value) return;
    const val = String(r.value).trim();
    if (await patch("nombre", val)) { setNombre(val); toastExito("Nombre actualizado"); router.refresh(); }
  }

  async function editarCorreo() {
    const r = await Swal.fire({
      ...tema(), title: "Editar correo electrónico", input: "email", inputValue: correo,
      inputAttributes: { style: estiloInput() },
      showCancelButton: true, confirmButtonText: "Guardar", cancelButtonText: "Cancelar", confirmButtonColor: MORADO,
      inputValidator: (v) => (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Ingresá un correo válido" : undefined),
    });
    if (!r.isConfirmed || !r.value) return;
    const val = String(r.value).trim();
    if (await patch("correo", val)) { setCorreo(val); toastExito("Correo actualizado"); router.refresh(); }
  }

  async function editarTelefono() {
    const r = await Swal.fire({
      ...tema(), title: telefono ? "Editar teléfono" : "Añadir teléfono", input: "tel", inputValue: telefono ?? "",
      inputPlaceholder: "8888-8888", inputAttributes: { style: estiloInput() },
      showCancelButton: true, confirmButtonText: "Guardar", cancelButtonText: "Cancelar", confirmButtonColor: MORADO,
      inputValidator: (v) => (v && !/^[0-9()+\-\s]{8,20}$/.test(v) ? "Ingresá un teléfono válido" : undefined),
    });
    if (!r.isConfirmed || r.value === undefined) return;
    const val = String(r.value).trim();
    if (await patch("telefono", val)) { setTelefono(val || null); toastExito("Teléfono actualizado"); }
  }

  async function editarContrasena() {
    const s = estiloInput();
    const r = await Swal.fire({
      ...tema(), title: "Cambiar contraseña", focusConfirm: false,
      html:
        `<input id="sw-actual" type="password" class="swal2-input" placeholder="Contraseña actual" style="${s}">` +
        `<input id="sw-nueva" type="password" class="swal2-input" placeholder="Nueva contraseña" style="${s}">` +
        `<input id="sw-conf" type="password" class="swal2-input" placeholder="Confirmar nueva contraseña" style="${s}">`,
      showCancelButton: true, confirmButtonText: "Cambiar", cancelButtonText: "Cancelar", confirmButtonColor: MORADO,
      preConfirm: () => {
        const actual = (document.getElementById("sw-actual") as HTMLInputElement).value;
        const nueva = (document.getElementById("sw-nueva") as HTMLInputElement).value;
        const conf = (document.getElementById("sw-conf") as HTMLInputElement).value;
        if (!actual || !nueva) { Swal.showValidationMessage("Completá todos los campos"); return false; }
        if (nueva.length < 8) { Swal.showValidationMessage("La nueva contraseña debe tener al menos 8 caracteres"); return false; }
        if (nueva !== conf) { Swal.showValidationMessage("Las contraseñas no coinciden"); return false; }
        return { actual, nueva, confirmar: conf };
      },
    });
    if (!r.isConfirmed || !r.value) return;
    const res = await fetch("/api/estudiante/cambiar-contrasena", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) { alertaError(data?.error ?? "No se pudo cambiar la contraseña."); return; }
    toastExito("Contraseña actualizada");
  }

  async function cerrarSesion() {
    await cerrarSesionCliente();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  async function deshabilitar() {
    const r = await Swal.fire({
      ...tema(), icon: "warning", title: "¿Deshabilitar tu cuenta?",
      text: "Tu cuenta quedará inactiva y se cerrará tu sesión. Para reactivarla, contactá al equipo de FWD.",
      showCancelButton: true, confirmButtonText: "Deshabilitar", cancelButtonText: "Cancelar",
      confirmButtonColor: "#F7901E", cancelButtonColor: "#6B7280", reverseButtons: true, focusCancel: true,
    });
    if (!r.isConfirmed) return;
    const res = await fetch("/api/estudiante/cuenta/deshabilitar", { method: "POST" });
    if (!res.ok) { const d = await res.json().catch(() => null); alertaError(d?.error ?? "No se pudo deshabilitar la cuenta."); return; }
    await cerrarSesionCliente();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  async function eliminar() {
    const r = await Swal.fire({
      ...tema(), icon: "warning", title: "Eliminar cuenta permanentemente",
      html: "Esta acción <b>no se puede deshacer</b>. Se borrarán tu cuenta y todos tus datos.<br>Escribí <b>ELIMINAR</b> para confirmar.",
      input: "text", inputPlaceholder: "ELIMINAR", inputAttributes: { style: estiloInput() },
      showCancelButton: true, confirmButtonText: "Eliminar cuenta", cancelButtonText: "Cancelar",
      confirmButtonColor: ROJO, cancelButtonColor: "#6B7280", reverseButtons: true, focusCancel: true,
      inputValidator: (v) => (v !== "ELIMINAR" ? "Escribí ELIMINAR para confirmar" : undefined),
    });
    if (!r.isConfirmed) return;
    const res = await fetch("/api/estudiante/cuenta", { method: "DELETE" });
    if (!res.ok) { const d = await res.json().catch(() => null); alertaError(d?.error ?? "No se pudo eliminar la cuenta."); return; }
    await cerrarSesionCliente();
    router.push(`/${locale}/login`);
    router.refresh();
  }

  // ── Estilos compartidos ──
  const cardCls = "rounded-2xl border border-[#E4E9F1] dark:border-white/10 bg-white dark:bg-white/[0.03] p-6";
  const tituloCls = "mb-4 text-lg font-bold text-[#0C1B33] dark:text-white";
  const labelCls = "text-sm font-semibold text-[#0C1B33] dark:text-white";
  const valorCls = "text-sm text-[#6B7B96] dark:text-white/60";
  const btnCls = "shrink-0 rounded-lg bg-[#F4F6FB] dark:bg-white/10 px-4 py-2 text-sm font-semibold text-[#4C5E7C] dark:text-white/80 transition-colors hover:bg-[#EAEEF6] dark:hover:bg-white/20";
  const inputCfg = "rounded-lg border border-[#E4E9F1] dark:border-white/15 bg-white dark:bg-white/5 dark:text-white dark:[color-scheme:dark] px-3 py-2 text-sm text-[#0C1B33] outline-none transition-colors focus:border-[#662D91] focus:ring-2 focus:ring-[#662D91]/15";

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-[#0C1B33] dark:text-white">Configuración</h1>
        <p className="mt-1 text-sm text-[#6B7B96] dark:text-white/60">Administrá tu cuenta y tu seguridad.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        {/* ── Sub-navegación (estilo Discord) ── */}
        <nav className="flex flex-col gap-3 lg:sticky lg:top-4 lg:self-start">
          {GRUPOS.map((g) => {
            const open = abiertos[g.grupo] ?? true;
            return (
              <div key={g.grupo}>
                <button
                  type="button"
                  onClick={() => setAbiertos((a) => ({ ...a, [g.grupo]: !open }))}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7B96] dark:text-white/50 transition-colors hover:text-[#0C1B33] dark:hover:text-white"
                >
                  <IcoChevron open={open} />
                  {g.grupo}
                </button>
                {open && (
                  <div className="mt-1 flex flex-col gap-0.5 pl-1">
                    {g.items.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => irA(s.id)}
                        className={
                          "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors " +
                          (activo === s.id
                            ? "bg-[#F0E7F7] dark:bg-purple-900/30 text-[#662D91] dark:text-purple-300 font-semibold"
                            : "text-[#4C5E7C] dark:text-white/70 hover:bg-[#F4F6FB] dark:hover:bg-white/10 hover:text-[#0C1B33] dark:hover:text-white")
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Contenido ── */}
        <div className="flex flex-col gap-6">
          {/* Preferencias de empleabilidad */}
          <section id="empleabilidad" className={cardCls} style={{ scrollMarginTop: 24, order: 4 }}>
            <h2 className={tituloCls}>Preferencias de empleabilidad</h2>
            <p className={`${valorCls} -mt-3 mb-4`}>Ayudan a recomendarte mejores proyectos. Actualizalas cuando cambien.</p>

            {/* Medidor de completitud */}
            <div className="mb-6 rounded-xl bg-[#F4F6FB] dark:bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0C1B33] dark:text-white">Perfil de empleabilidad</span>
                <span className="text-sm font-bold text-[#662D91] dark:text-purple-300">{pctEmp}% completo</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E4E9F1] dark:bg-white/10">
                <div className="h-full rounded-full transition-all" style={{ width: `${pctEmp}%`, background: "linear-gradient(90deg,#662D91,#EC008C)" }} />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <p className={`${labelCls} mb-2`}>Áreas de interés</p>
                <div className="flex flex-wrap gap-2">
                  {AREAS_FWD.map((a) => (
                    <ChipToggle key={a} label={a} on={emp.areas.includes(a)} onClick={() => toggleEmp("areas", a)} />
                  ))}
                </div>
              </div>

              <div>
                <p className={`${labelCls} mb-2`}>Tecnologías</p>
                <div className="flex flex-wrap gap-2">
                  {TECNOLOGIAS_FWD.map((t) => (
                    <ChipToggle key={t} label={t} on={emp.tecnologias.includes(t)} onClick={() => toggleEmp("tecnologias", t)} />
                  ))}
                </div>
              </div>

              <div>
                <p className={`${labelCls} mb-2`}>Modalidad preferida</p>
                <div className="flex flex-wrap gap-2">
                  {MODALIDADES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEmp((e) => ({ ...e, modalidad: m }))}
                      className={
                        "rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
                        (emp.modalidad === m
                          ? "bg-[#662D91] text-white"
                          : "bg-[#F4F6FB] dark:bg-white/10 text-[#4C5E7C] dark:text-white/80 hover:bg-[#EAEEF6] dark:hover:bg-white/20")
                      }
                    >
                      {MODALIDAD_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <p className={labelCls}>Disponibilidad (horas/semana)</p>
                  <input
                    type="number" min={1} max={168}
                    value={emp.disponibilidadHoras ?? ""}
                    onChange={(e) => setEmp((s) => ({ ...s, disponibilidadHoras: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Ej. 20" className={inputCfg}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className={labelCls}>Disponible desde</p>
                  <input
                    type="date"
                    value={emp.fechaInicio ?? ""}
                    onChange={(e) => setEmp((s) => ({ ...s, fechaInicio: e.target.value || null }))}
                    className={inputCfg}
                  />
                </div>
              </div>

              <div>
                <p className={`${labelCls} mb-2`}>Tipo de proyecto</p>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_PROYECTO.map((t) => (
                    <ChipToggle key={t} label={t} on={emp.tipoProyecto.includes(t)} onClick={() => toggleEmp("tipoProyecto", t)} />
                  ))}
                </div>
              </div>

              <div>
                <p className={`${labelCls} mb-1`}>Expectativa de pago (rango)</p>
                <p className="mb-2 text-xs text-[#6B7B96] dark:text-white/50">Privado: solo mejora tus recomendaciones. No se muestra a las empresas.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number" min={0}
                    value={emp.pagoMin ?? ""}
                    onChange={(e) => setEmp((s) => ({ ...s, pagoMin: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Mínimo" className={`${inputCfg} w-32`}
                  />
                  <span className="text-[#6B7B96] dark:text-white/50">—</span>
                  <input
                    type="number" min={0}
                    value={emp.pagoMax ?? ""}
                    onChange={(e) => setEmp((s) => ({ ...s, pagoMax: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Máximo" className={`${inputCfg} w-32`}
                  />
                  <select
                    value={emp.pagoMoneda}
                    onChange={(e) => setEmp((s) => ({ ...s, pagoMoneda: e.target.value === "USD" ? "USD" : "CRC" }))}
                    className={`${inputCfg} w-24`}
                  >
                    <option value="CRC">CRC</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={guardarEmp}
                  disabled={guardandoEmp}
                  className="rounded-lg bg-[#662D91] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#54277a] disabled:opacity-60"
                >
                  {guardandoEmp ? "Guardando…" : "Guardar preferencias"}
                </button>
              </div>
            </div>
          </section>

          {/* Información de cuenta */}
          <section id="info" className={cardCls} style={{ scrollMarginTop: 24, order: 1 }}>
            <h2 className={tituloCls}>Información de cuenta</h2>
            <div className="divide-y divide-[#E4E9F1] dark:divide-white/10">
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Nombre de usuario</p>
                  <p className={`${valorCls} truncate`}>{nombre}</p>
                </div>
                <button type="button" onClick={editarNombre} className={btnCls}>Editar</button>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Correo electrónico</p>
                  <p className={`${valorCls} truncate`}>
                    {correoVisible}{" "}
                    <button type="button" onClick={() => setMostrarCorreo((v) => !v)} className="font-semibold text-[#662D91] dark:text-purple-400 hover:underline">
                      {mostrarCorreo ? "Ocultar" : "Mostrar"}
                    </button>
                  </p>
                </div>
                <button type="button" onClick={editarCorreo} className={btnCls}>Editar</button>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Número de teléfono</p>
                  <p className={`${valorCls} truncate`}>
                    {telefono ?? "Todavía no has añadido un número de teléfono."}
                  </p>
                </div>
                <button type="button" onClick={editarTelefono} className={btnCls}>{telefono ? "Editar" : "Añadir"}</button>
              </div>
            </div>
          </section>

          {/* Contraseña y seguridad */}
          <section id="seguridad" className={cardCls} style={{ scrollMarginTop: 24, order: 2 }}>
            <h2 className={tituloCls}>Contraseña y seguridad</h2>
            <div className="divide-y divide-[#E4E9F1] dark:divide-white/10">
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Contraseña</p>
                  <p className={valorCls}>••••••••••</p>
                </div>
                <button type="button" onClick={editarContrasena} className={btnCls}>Editar</button>
              </div>
              <div className="py-4">
                <p className={`${labelCls} mb-2`}>Dispositivos con sesión iniciada</p>
                <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F4F6FB] dark:bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#662D91] text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0C1B33] dark:text-white">Este dispositivo</p>
                      <p className="text-xs text-[#6B7B96] dark:text-white/50">Sesión activa · navegador actual</p>
                    </div>
                  </div>
                  <button type="button" onClick={cerrarSesion} className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Reputación de la cuenta */}
          <section id="reputacion" className={cardCls} style={{ scrollMarginTop: 24, order: 3 }}>
            <h2 className={tituloCls}>Reputación de la cuenta</h2>
            <div className="mb-4 flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#FFCB05] to-[#F7901E] text-white">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </span>
              <div>
                <p className="text-2xl font-black text-[#0C1B33] dark:text-white">{reputacion.toFixed(1)}</p>
                <p className={valorCls}>Se construye con tus proyectos y las evaluaciones de las empresas.</p>
              </div>
            </div>

            {evaluaciones.length === 0 ? (
              <p className={valorCls}>Todavía no recibiste evaluaciones. Aparecerán acá cuando completes proyectos.</p>
            ) : (
              <div className="divide-y divide-[#E4E9F1] dark:divide-white/10">
                {evaluaciones.map((ev) => (
                  <div key={ev.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0C1B33] dark:text-white">{ev.empresa}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F7901E]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          {ev.puntuacion}/5
                        </span>
                      </div>
                      {ev.proyecto && <p className="text-xs text-[#6B7B96] dark:text-white/50">{ev.proyecto}</p>}
                      {ev.comentario && <p className={`${valorCls} mt-1`}>{ev.comentario}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => apelar(ev)}
                      className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#662D91] transition-colors hover:bg-[#F0E7F7] dark:text-purple-400 dark:hover:bg-purple-900/30"
                    >
                      Apelar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notificaciones */}
          <section id="notificaciones" className={cardCls} style={{ scrollMarginTop: 24, order: 5 }}>
            <h2 className={tituloCls}>Notificaciones</h2>
            <p className={`${valorCls} -mt-3 mb-2`}>Elegí sobre qué querés recibir avisos.</p>
            <div className="divide-y divide-[#E4E9F1] dark:divide-white/10">
              {NOTIF_ROWS.map((r) => (
                <div key={r.key} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className={labelCls}>{r.titulo}</p>
                    <p className={valorCls}>{r.desc}</p>
                  </div>
                  <Toggle on={notif[r.key]} onClick={() => toggleNotif(r.key)} />
                </div>
              ))}
            </div>
          </section>

          {/* Privacidad */}
          <section id="privacidad" className={cardCls} style={{ scrollMarginTop: 24, order: 6 }}>
            <h2 className={tituloCls}>Privacidad</h2>
            <p className={`${valorCls} -mt-3 mb-2`}>Controlá qué se muestra de tu perfil y quién puede contactarte.</p>
            <div className="divide-y divide-[#E4E9F1] dark:divide-white/10">
              {PRIV_ROWS.map((r) => (
                <div key={r.key} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className={labelCls}>{r.titulo}</p>
                    <p className={valorCls}>{r.desc}</p>
                  </div>
                  <Toggle on={priv[r.key]} onClick={() => togglePriv(r.key)} />
                </div>
              ))}
              {/* Visibilidad del CV: se gobierna en Mi perfil (no duplicar la fuente de verdad) */}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Visibilidad del CV</p>
                  <p className={valorCls}>Se gestiona en Mi perfil → Currículum.</p>
                </div>
                <a href={`/${locale}/dashboard/estudiante/perfil`} className={btnCls}>Ir a Mi perfil</a>
              </div>
            </div>
          </section>

          {/* Datos y descargas */}
          <section id="datos" className={cardCls} style={{ scrollMarginTop: 24, order: 7 }}>
            <h2 className={tituloCls}>Datos y descargas</h2>
            <div className="divide-y divide-[#E4E9F1] dark:divide-white/10">
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Descargar mi CV</p>
                  <p className={valorCls}>Bajá el currículum que tenés cargado.</p>
                </div>
                <button type="button" onClick={descargarCv} className={btnCls}>Descargar</button>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Descargar mis datos</p>
                  <p className={valorCls}>Un archivo con toda la información de tu cuenta (JSON).</p>
                </div>
                <button type="button" onClick={descargarDatos} className={btnCls}>Descargar</button>
              </div>
            </div>
          </section>

          {/* Ayuda y soporte */}
          <section id="ayuda" className={cardCls} style={{ scrollMarginTop: 24, order: 8 }}>
            <h2 className={tituloCls}>Ayuda y soporte</h2>
            <div className="divide-y divide-[#E4E9F1] dark:divide-white/10">
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Escribir al equipo FWD</p>
                  <p className={valorCls}>¿Tenés una duda o un problema? Contanos.</p>
                </div>
                <button type="button" onClick={escribirEquipo} className={btnCls}>Escribir</button>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className={labelCls}>Términos y condiciones</p>
                  <p className={valorCls}>Políticas de uso de la plataforma.</p>
                </div>
                <a href={`/${locale}/terminos`} className={btnCls}>Ver</a>
              </div>
            </div>
          </section>

          {/* Zona de peligro */}
          <section style={{ order: 30 }} className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50/40 dark:bg-red-500/[0.04] p-6">
            <h2 className="mb-4 text-lg font-bold text-[#0C1B33] dark:text-white">Zona de peligro</h2>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={labelCls}>Cerrar sesión</p>
                  <p className={valorCls}>Salí de tu cuenta en este dispositivo.</p>
                </div>
                <button type="button" onClick={cerrarSesion} className={btnCls}>Cerrar sesión</button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={labelCls}>Deshabilita tu cuenta</p>
                  <p className={valorCls}>Deshabilitá temporalmente tu cuenta.</p>
                </div>
                <button type="button" onClick={deshabilitar} className="shrink-0 rounded-lg bg-[#F4F6FB] dark:bg-white/10 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                  Deshabilitar cuenta
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={labelCls}>Cierra tu cuenta</p>
                  <p className={valorCls}>Cerrá tu cuenta permanentemente.</p>
                </div>
                <button type="button" onClick={eliminar} className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
