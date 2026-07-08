"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/text-field";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";

// Formulario de la página /unirse. El email y el rol vienen del token firmado
// (se muestran, no se editan); el servidor los re-valida. La persona solo crea
// su nombre, edad (opcional) y contraseña, queda registrada con su rol y entra.
export function RegistroInvitacionForm({
  token,
  email,
  rolLabel,
}: {
  token: string;
  email: string;
  rolLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get("nombre") ?? "").trim();
    const edad = String(fd.get("edad") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const passwordConfirm = String(fd.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/registro-invitacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'same-origin',
        body: JSON.stringify({ token, nombre, edad: edad || undefined, password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "No se pudo crear la cuenta.");
        return;
      }

      if (data?.perfil) {
        localStorage.setItem("fwd_perfil", JSON.stringify(data.perfil));
        sessionStorage.setItem("fwd_active", "true");
      }
      if (data?.redirectTo) {
        localStorage.setItem("fwd_dashboard", data.redirectTo);
        localStorage.setItem("fwd_redirect", data.redirectTo);
      }

      // Forzar navegación completa para que el navegador incluya las cookies
      // `fwd_session`/`fwd_new_session` en la siguiente petición al servidor.
      const destino = data?.redirectTo ?? "/";
      window.location.assign(destino);
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
          <IconCheck className="h-4 w-4" />
          <span>
            Invitación como {rolLabel}: {email}
          </span>
        </div>
        <h1 className="font-display text-3xl font-black text-fwd-ink dark:text-white">
          Completá tu registro
        </h1>
        <p className="mt-2 text-fwd-ink/60 dark:text-white/60">
          Creá tu contraseña para activar tu cuenta de {rolLabel}.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <TextField
          id="nombre"
          name="nombre"
          label="Nombre completo"
          placeholder="Ana Mora"
          autoComplete="name"
          minLength={2}
          maxLength={100}
          required
        />

        <TextField
          id="edad"
          name="edad"
          type="number"
          label="Edad (opcional)"
          placeholder="25"
          min={0}
          max={120}
        />

        <TextField
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />

        <TextField
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          label="Confirmar contraseña"
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white shadow-sm transition hover:bg-fwd-purple disabled:opacity-60"
        >
          {loading ? "Creando cuenta…" : "Registrarme"}
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
}
