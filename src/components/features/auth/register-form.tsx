"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";

type Role = "estudiante" | "empresario";

/** Reglas de validación de la contraseña: se marcan con check al cumplirse. */
const PASSWORD_RULES = [
  { id: "len", label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "Una minúscula", test: (v: string) => /[a-z]/.test(v) },
  { id: "num", label: "Un número", test: (v: string) => /[0-9]/.test(v) },
] as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M5 10.5l3.5 3.5L15 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentStatus, setStudentStatus] = useState<StudentStatus>("en_curso");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "No se pudo crear la cuenta");
        return;
      }

      // Perfil público (nombre, foto) -> localStorage. Lo privado va en la cookie.
      if (data?.perfil) {
        localStorage.setItem("fwd_perfil", JSON.stringify(data.perfil));
      }

      router.push(data?.redirectTo ?? "/empresario");
      router.refresh();
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black text-fwd-ink">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-fwd-ink/60">
          Forma parte de la comunidad que avanza hacia el futuro.
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            name="firstName"
            label="Nombre"
            placeholder="Ana"
            autoComplete="given-name"
            required
          />
          <TextField
            id="lastName"
            name="lastName"
            label="Apellido"
            placeholder="Mora"
            autoComplete="family-name"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="cedula"
            name="cedula"
            label="Cédula"
            placeholder="1-2345-6789"
            inputMode="numeric"
            autoComplete="off"
            required
          />
          <TextField
            id="age"
            name="age"
            type="number"
            label="Edad"
            placeholder="18"
            min={1}
            max={120}
            required
          />
        </div>

        <TextField
          id="residence"
          name="residence"
          label="Lugar de residencia"
          placeholder="Cantón, provincia"
          autoComplete="address-level2"
          required
        />

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-fwd-ink/80">
            Quiero registrarme como
          </legend>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-fwd-mist/60 p-1">
            {(
              [
                { value: "estudiante", label: "Soy Estudiante" },
                { value: "empresario", label: "Soy Empresario" },
              ] as const
            ).map((opt) => {
              const active = role === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center justify-center rounded-lg px-3 py-2.5 text-center text-sm font-medium transition ${
                    active
                      ? "bg-fwd-blue text-white shadow-sm"
                      : "text-fwd-ink/70 hover:text-fwd-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={active}
                    onChange={() => setRole(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          autoComplete="email"
          required
        />

        {/* Contraseña con validación en vivo y check al ser válida */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-fwd-ink/80">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              aria-invalid={password.length > 0 && !passwordValid}
              className={`w-full rounded-xl border bg-fwd-mist/40 px-4 py-3 pr-11 text-[0.95rem] text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 focus:bg-white focus:ring-4 ${
                passwordValid
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500/15"
                  : "border-fwd-ink/12 focus:border-fwd-blue focus:ring-fwd-blue/15"
              }`}
            />
            {passwordValid ? (
              <span
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-green-500 text-white"
                aria-label="Contraseña válida"
              >
                <CheckIcon className="h-4 w-4" />
              </span>
            ) : null}
          </div>

          <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    ok ? "text-green-600" : "text-fwd-ink/45"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                      ok ? "bg-green-500 text-white" : "bg-fwd-ink/15 text-transparent"
                    }`}
                  >
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-fwd-ink/70">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-fwd-ink/25 accent-fwd-blue"
          />
          <span>
            Acepto los{" "}
            <Link
              href="/terminos"
              className="font-medium text-fwd-blue hover:text-fwd-purple"
            >
              Términos y Condiciones
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`group mt-1 flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold text-white shadow-sm transition ${
            canSubmit
              ? "bg-fwd-blue hover:bg-fwd-purple"
              : "cursor-not-allowed bg-fwd-ink/25"
          }`}
        >
          {loading ? "Avanzando…" : "Crear cuenta"}
          <span className="transition-transform group-hover:translate-x-1">▶</span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-fwd-ink/60">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-fwd-blue hover:text-fwd-purple transition"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
