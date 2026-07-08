// Helpers de SweetAlert2 para el panel de administración.
// Tematizados (claro/oscuro según la clase .dark del <html>) y sin emojis
// (REGLA #6): los íconos son los SVG propios de SweetAlert. Solo se usan en
// componentes de cliente (event handlers).
import Swal from "sweetalert2";

const ROJO = "#EF4444";
const AZUL = "#008FD4";
const GRIS = "#6B7280";

function tema(): { background: string; color: string } {
  const dark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  return dark
    ? { background: "#111827", color: "#F1F5F9" }
    : { background: "#FFFFFF", color: "#0C1B33" };
}

// Confirmación destructiva (eliminar). Devuelve true si el usuario confirma.
export async function confirmarEliminacion(opts: {
  titulo?: string;
  texto?: string;
  confirmText?: string;
}): Promise<boolean> {
  const r = await Swal.fire({
    ...tema(),
    icon: "warning",
    title: opts.titulo ?? "¿Eliminar?",
    text: opts.texto ?? "Esta acción no se puede deshacer.",
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? "Eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: ROJO,
    cancelButtonColor: GRIS,
    reverseButtons: true,
    focusCancel: true,
  });
  return r.isConfirmed;
}

// Confirmación genérica (acciones no destructivas). Devuelve true si confirma.
export async function confirmarAccion(opts: {
  titulo: string;
  texto?: string;
  confirmText?: string;
  icon?: "warning" | "question" | "info";
  peligro?: boolean;
}): Promise<boolean> {
  const r = await Swal.fire({
    ...tema(),
    icon: opts.icon ?? "question",
    title: opts.titulo,
    ...(opts.texto ? { text: opts.texto } : {}),
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? "Confirmar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: opts.peligro ? ROJO : AZUL,
    cancelButtonColor: GRIS,
    reverseButtons: true,
  });
  return r.isConfirmed;
}

// Pide un motivo (textarea obligatorio). Devuelve el texto o null si cancela.
export async function pedirMotivo(opts: {
  titulo: string;
  texto?: string;
  label?: string;
  placeholder?: string;
  confirmText?: string;
  peligro?: boolean;
}): Promise<string | null> {
  const r = await Swal.fire({
    ...tema(),
    icon: "warning",
    title: opts.titulo,
    ...(opts.texto ? { text: opts.texto } : {}),
    input: "textarea",
    inputLabel: opts.label ?? "Motivo",
    inputPlaceholder: opts.placeholder ?? "Escribí el motivo…",
    inputAttributes: { "aria-label": opts.label ?? "Motivo" },
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? "Confirmar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: opts.peligro ? ROJO : AZUL,
    cancelButtonColor: GRIS,
    reverseButtons: true,
    inputValidator: (valor) =>
      !valor || !valor.trim() ? "El motivo es obligatorio" : undefined,
  });
  return r.isConfirmed ? String(r.value ?? "").trim() : null;
}

// Toast de éxito (esquina superior derecha, se cierra solo).
export function toastExito(mensaje: string): void {
  void Swal.fire({
    ...tema(),
    toast: true,
    position: "top-end",
    icon: "success",
    title: mensaje,
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
  });
}

// Alerta de error (modal con botón de cierre).
export function alertaError(mensaje: string, titulo = "Error"): void {
  void Swal.fire({
    ...tema(),
    icon: "error",
    title: titulo,
    text: mensaje,
    confirmButtonText: "Entendido",
    confirmButtonColor: ROJO,
  });
}
