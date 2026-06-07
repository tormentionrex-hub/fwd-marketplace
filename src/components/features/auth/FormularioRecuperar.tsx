"use client";

import Link from "next/link";
import { useState } from "react";

// Formulario de recuperación de contraseña (Sefora · Página 07).
// Maneja los dos pasos del flujo en el cliente:
//   "solicitar" → pedir el enlace por correo
//   "nueva"     → definir la nueva contraseña (se llega desde el correo)
//
// La lógica real de Supabase Auth se conectará más adelante en los
// puntos marcados con TODO.
type Paso = "solicitar" | "nueva";

export default function FormularioRecuperar({
  locale,
  pasoInicial,
}: {
  locale: string;
  pasoInicial: Paso;
}) {
  const [paso] = useState<Paso>(pasoInicial);

  if (paso === "nueva") {
    return <PasoNuevaContrasena locale={locale} />;
  }
  return <PasoSolicitarEnlace />;
}

// --- PASO 1 — SOLICITAR ENLACE ---
function PasoSolicitarEnlace() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Supabase maneja el envío del correo automáticamente.
    // await supabase.auth.resetPasswordForEmail(correo, { redirectTo });
    setEnviado(true);
  }

  // Mensaje de confirmación tras solicitar el enlace.
  if (enviado) {
    return (
      <div className="rounded-xl border border-fwd-azul/30 bg-fwd-azul/5 p-6 text-center">
        <p className="text-lg font-medium text-fwd-azul">
          Revisá tu bandeja de entrada
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Te enviamos un enlace de recuperación a{" "}
          <span className="font-medium">{correo}</span>. El enlace es de un solo
          uso y expira en 1 hora.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Ingresá tu correo registrado y te enviaremos un enlace para restablecer
        tu contraseña.
      </p>
      <input
        type="email"
        required
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="Correo electrónico"
        className="h-11 rounded-md border border-black/[.12] px-3 dark:border-white/[.18] dark:bg-transparent"
      />
      <button
        type="submit"
        className="h-11 rounded-full bg-fwd-azul font-medium text-white transition-colors hover:opacity-90"
      >
        Enviar enlace de recuperación
      </button>
    </form>
  );
}

// --- PASO 2 — NUEVA CONTRASEÑA ---
function PasoNuevaContrasena({ locale }: { locale: string }) {
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [guardada, setGuardada] = useState(false);

  const coinciden = contrasena.length > 0 && contrasena === confirmar;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coinciden) return;
    // TODO: actualizar la contraseña con el token del enlace.
    // await supabase.auth.updateUser({ password: contrasena });
    setGuardada(true);
  }

  // Al guardar correctamente, se redirige al inicio de sesión.
  if (guardada) {
    return (
      <div className="rounded-xl border border-fwd-azul/30 bg-fwd-azul/5 p-6 text-center">
        <p className="text-lg font-medium text-fwd-azul">
          Contraseña actualizada
        </p>
        <Link
          href={`/${locale}/login`}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-fwd-azul px-6 font-medium text-white transition-colors hover:opacity-90"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Definí tu nueva contraseña.
      </p>

      {/* Campo nueva contraseña con botón mostrar / ocultar */}
      <div className="relative">
        <input
          type={mostrar ? "text" : "password"}
          required
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="Nueva contraseña"
          className="h-11 w-full rounded-md border border-black/[.12] px-3 pr-16 dark:border-white/[.18] dark:bg-transparent"
        />
        <button
          type="button"
          onClick={() => setMostrar((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fwd-azul hover:underline"
        >
          {mostrar ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      {/* Campo confirmar nueva contraseña */}
      <input
        type={mostrar ? "text" : "password"}
        required
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        placeholder="Confirmar nueva contraseña"
        className="h-11 rounded-md border border-black/[.12] px-3 dark:border-white/[.18] dark:bg-transparent"
      />

      {/* Aviso si las contraseñas no coinciden */}
      {confirmar.length > 0 && !coinciden && (
        <p className="text-sm text-fwd-magenta">Las contraseñas no coinciden.</p>
      )}

      <button
        type="submit"
        disabled={!coinciden}
        className="h-11 rounded-full bg-fwd-azul font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Guardar contraseña
      </button>
    </form>
  );
}
