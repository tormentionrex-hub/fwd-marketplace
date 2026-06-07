"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";

type StudentStatus = "en_curso" | "ex_estudiante";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentStatus, setStudentStatus] = useState<StudentStatus>("en_curso");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

      router.push("/empresario");
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
            Condición estudiantil
          </legend>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-fwd-mist/60 p-1">
            {(
              [
                { value: "en_curso", label: "Estudiante en curso" },
                { value: "ex_estudiante", label: "Ex-Estudiante" },
              ] as const
            ).map((opt) => {
              const active = studentStatus === opt.value;
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
                    name="studentStatus"
                    value={opt.value}
                    checked={active}
                    onChange={() => setStudentStatus(opt.value)}
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

        <TextField
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <label className="flex items-start gap-2.5 text-sm text-fwd-ink/70">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-fwd-ink/25 accent-fwd-blue"
          />
          <span>
            Acepto los{" "}
            <Link href="#" className="font-medium text-fwd-blue hover:text-fwd-purple">
              Términos
            </Link>{" "}
            y la{" "}
            <Link href="#" className="font-medium text-fwd-blue hover:text-fwd-purple">
              Política de privacidad
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white shadow-sm transition hover:bg-fwd-purple disabled:opacity-60"
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
