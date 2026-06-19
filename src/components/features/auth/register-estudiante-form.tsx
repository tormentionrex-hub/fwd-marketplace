"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";
import { IconArrowRight, IconArrowLeft, IconCheck } from "@/components/ui/icons";
import { GraduationCap } from "lucide-react";
import gsap from "gsap";

type Step = "email" | "datos";

const FWD_COLORS = ["#20BEC6", "#ED008C", "#662D91", "#008FD5", "#FFCB05"];

function AnimatedHeading({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLSpanElement>(".reg-char");
    gsap.fromTo(chars,
      { opacity: 0, y: 30, rotateX: -60 },
      { opacity: 1, y: 0, rotateX: 0, stagger: 0.03, duration: 0.55, ease: "back.out(1.4)", delay: 0.1 }
    );
  }, []);

  return (
    <h1 ref={ref} className="font-display text-3xl font-black text-fwd-ink" style={{ perspective: "500px" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="reg-char inline-block cursor-default"
          style={{ whiteSpace: "pre" }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -8, color: FWD_COLORS[i % FWD_COLORS.length] ?? "#20BEC6", scale: 1.15, duration: 0.15, ease: "power2.out" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, color: "#1a1633", scale: 1, duration: 0.35, ease: "elastic.out(1,0.5)" })}
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

export function RegisterEstudianteForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerificado, setEmailVerificado] = useState("");

  // ── Paso 1: verificar que el email fue invitado ──────────────────────────
  async function handleVerificarEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/verificar-invitacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Error al verificar el correo.");
        return;
      }

      setEmailVerificado(email);
      setStep("datos");
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Paso 2: completar el registro ────────────────────────────────────────
  async function handleRegistro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register-estudiante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: emailVerificado,
          password,
        }),
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

      router.push(data?.redirectTo ?? "/dashboard/estudiante");
      router.refresh();
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render: paso 1 ───────────────────────────────────────────────────────
  if (step === "email") {
    return (
      <div>
        <header className="mb-8">
          <AnimatedHeading text="Registro de estudiante" />
          <p className="mt-2 text-fwd-ink/60">
            El acceso es solo por invitación. Ingresá el correo con el que fuiste invitado.
          </p>
        </header>

        <form onSubmit={handleVerificarEmail} className="flex flex-col gap-5">
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">{error}</p>
              {error.includes("invitado") && (
                <p className="mt-1 text-red-600/80">
                  ¿Querés unirte?{" "}
                  <Link href="/solicitar-acceso" className="font-semibold underline hover:text-red-800">
                    Solicitá una invitación al equipo FWD
                  </Link>
                  .
                </p>
              )}
            </div>
          )}

          <TextField
            id="email"
            name="email"
            type="email"
            label="Correo de invitación"
            placeholder="tu@correo.com"
            autoComplete="email"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white shadow-sm transition hover:bg-fwd-purple disabled:opacity-60"
          >
            {loading ? "Verificando…" : "Verificar invitación"}
            <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Botón de Registro Estudiante movido aquí desde el header */}
          <Link
            href="/registro/estudiante"
            className="group flex h-9 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-sm transition-all duration-400 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #662D91, #EC008C)", boxShadow: "0 4px 18px rgba(102,45,145,0.35)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "linear-gradient(135deg, #008FD5, #20BEC6)";
              el.style.boxShadow = "0 8px 30px rgba(0,143,213,0.55), 0 0 40px rgba(32,190,198,0.3)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "linear-gradient(135deg, #662D91, #EC008C)";
              el.style.boxShadow = "0 4px 18px rgba(102,45,145,0.35)";
            }}
          >
            <GraduationCap size={16} strokeWidth={2.2} className="transition-transform group-hover:rotate-[-6deg]" />
            Registro Estudiante
          </Link>
        </form>

        <p className="mt-8 text-center text-sm text-fwd-ink/60">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-fwd-blue hover:text-fwd-purple transition">
            Inicia sesión
          </Link>
        </p>
      </div>
    );
  }

  // ── Render: paso 2 ───────────────────────────────────────────────────────
  return (
    <div>
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 border border-green-200">
          <IconCheck className="h-4 w-4" />
          <span>Invitación verificada: {emailVerificado}</span>
        </div>
        <h1 className="font-display text-3xl font-black text-fwd-ink">
          Completá tu registro
        </h1>
        <p className="mt-2 text-fwd-ink/60">
          Tu correo fue confirmado. Completá los datos para crear tu cuenta.
        </p>
      </header>

      <form onSubmit={handleRegistro} className="flex flex-col gap-5">
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
            minLength={2}
            maxLength={50}
            pattern="[\p{L}\s'’\-]+"
            title="Solo letras, espacios y guiones (2–50)"
            required
          />
          <TextField
            id="lastName"
            name="lastName"
            label="Apellido"
            placeholder="Mora"
            autoComplete="family-name"
            minLength={2}
            maxLength={50}
            pattern="[\p{L}\s'’\-]+"
            title="Solo letras, espacios y guiones (2–50)"
            required
          />
        </div>

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
          {loading ? "Creando cuenta…" : "Crear mi cuenta"}
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={() => { setStep("email"); setError(null); }}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-fwd-ink/50 hover:text-fwd-ink transition"
        >
          <IconArrowLeft className="h-4 w-4" />
          Cambiar correo
        </button>
      </form>
    </div>
  );
}
