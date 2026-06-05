"use client";

import { useState } from "react";
import Link from "next/link";
import { TextField } from "@/components/ui/text-field";

export function LoginForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // TODO: conectar con Supabase Auth (signInWithPassword)
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black text-fwd-ink">
          Inicia sesión
        </h1>
        <p className="mt-2 text-fwd-ink/60">
          Bienvenido de vuelta. Sigamos avanzando.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          autoComplete="email"
          required
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-fwd-ink/80">
              Contraseña
            </label>
            <Link
              href="#"
              className="text-sm font-medium text-fwd-blue hover:text-fwd-purple transition"
            >
              ¿La olvidaste?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 px-4 py-3 text-[0.95rem] text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 focus:border-fwd-blue focus:bg-white focus:ring-4 focus:ring-fwd-blue/15"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-fwd-ink/70">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-fwd-ink/25 accent-fwd-blue"
          />
          Mantener la sesión iniciada
        </label>

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white shadow-sm transition hover:bg-fwd-purple disabled:opacity-60"
        >
          {loading ? "Avanzando…" : "Iniciar sesión"}
          <span className="transition-transform group-hover:translate-x-1">▶</span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-fwd-ink/60">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-semibold text-fwd-blue hover:text-fwd-purple transition"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
