"use client";

import { useState, useEffect, useRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";
import { IconArrowRight, IconArrowLeft, IconCheck } from "@/components/ui/icons";
import { Mail } from "lucide-react";
import gsap from "gsap";
import { PROVINCIAS_CR, cantonesDe, distritosDe, GENERACIONES_FWD, MODULOS_FWD, SEDES_FWD } from "@/lib/costaRica";

// Select con el mismo estilo que TextField (para combinar con el formulario).
function SelectField({
  id,
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fwd-ink/80 dark:text-white/80">
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 dark:bg-white/5 dark:border-white/15 dark:text-white dark:[color-scheme:dark] px-4 py-3 text-[0.95rem] text-fwd-ink outline-none transition focus:border-fwd-blue focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/15"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

type Step = "email" | "datos";

const FWD_COLORS = ["#20BEC6", "#ED008C", "#662D91", "#008FD5", "#FFCB05"];

// Requisitos de la contraseña (deben coincidir con el schema del servidor).
const PASSWORD_RULES: { id: string; label: string; test: (v: string) => boolean }[] = [
  { id: "len", label: "Mínimo 8 caracteres", test: (v) => v.length >= 8 },
  { id: "upper", label: "Una mayúscula", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "Una minúscula", test: (v) => /[a-z]/.test(v) },
  { id: "num", label: "Un número", test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "Un carácter especial", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

// Burbujas de colores que "explotan" hacia afuera al crear la cuenta.
const BURST_BUBBLES = [
  { s: 10, x: "-54px", y: "-40px", c: "#22c55e" },
  { s: 8,  x: "50px",  y: "-46px", c: "#20BEC6" },
  { s: 12, x: "60px",  y: "18px",  c: "#FFCB05" },
  { s: 7,  x: "-58px", y: "26px",  c: "#008FD5" },
  { s: 9,  x: "12px",  y: "-62px", c: "#EC008C" },
  { s: 8,  x: "-22px", y: "60px",  c: "#662D91" },
  { s: 6,  x: "42px",  y: "50px",  c: "#22c55e" },
  { s: 7,  x: "-46px", y: "-6px",  c: "#FFCB05" },
];

// Overlay de éxito: bolita verde con check + burbujas explotando. Se muestra
// ~1.9s tras crear la cuenta, antes de redirigir al dashboard.
function SuccessOverlay() {
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 24,
        background: "rgba(11,17,32,0.85)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        animation: "fwdExitoBg 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes fwdExitoBg { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fwdExitoPop { 0%{transform:scale(0);opacity:0} 55%{transform:scale(1.18);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes fwdExitoRing { 0%{transform:scale(0.5);opacity:.55} 100%{transform:scale(2.5);opacity:0} }
        @keyframes fwdExitoCheck { to { stroke-dashoffset: 0 } }
        @keyframes fwdExitoText { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fwdExitoBubble { from{transform:translate(0,0) scale(1);opacity:1} to{transform:translate(var(--bx),var(--by)) scale(0);opacity:0} }
      `}</style>

      <div style={{ position: "relative", width: 130, height: 130, display: "grid", placeItems: "center" }}>
        {/* Anillos que explotan (burbuja reventando) */}
        <span style={{ position: "absolute", width: 88, height: 88, borderRadius: "50%", border: "3px solid #22c55e", animation: "fwdExitoRing 0.9s ease-out forwards" }} />
        <span style={{ position: "absolute", width: 88, height: 88, borderRadius: "50%", border: "3px solid #22c55e", opacity: 0, animation: "fwdExitoRing 0.9s ease-out 0.3s forwards" }} />

        {/* Burbujas de colores disparadas hacia afuera */}
        {BURST_BUBBLES.map((b, i) => (
          <span
            key={i}
            style={{
              position: "absolute", width: b.s, height: b.s, borderRadius: "50%", background: b.c,
              ["--bx" as string]: b.x, ["--by" as string]: b.y,
              animation: `fwdExitoBubble 0.7s ease-out ${0.12 + i * 0.02}s forwards`,
            }}
          />
        ))}

        {/* Bolita verde con el check */}
        <div
          style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            display: "grid", placeItems: "center",
            boxShadow: "0 10px 40px rgba(34,197,94,0.5)",
            animation: "fwdExitoPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" style={{ strokeDasharray: 32, strokeDashoffset: 32, animation: "fwdExitoCheck 0.4s ease-out 0.35s forwards" }} />
          </svg>
        </div>
      </div>

      <p
        style={{
          color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em",
          textAlign: "center", padding: "0 24px",
          animation: "fwdExitoText 0.5s ease-out 0.45s both",
        }}
      >
        ¡Cuenta creada exitosamente!
      </p>
    </div>,
    document.body,
  );
}

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
    <h1 ref={ref} className="font-display text-3xl font-black text-fwd-ink dark:text-white" style={{ perspective: "500px" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="reg-char inline-block cursor-default"
          style={{ whiteSpace: "pre" }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -8, color: FWD_COLORS[i % FWD_COLORS.length] ?? "#20BEC6", scale: 1.15, duration: 0.15, ease: "power2.out" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#1a1633", scale: 1, duration: 0.35, ease: "elastic.out(1,0.5)" })}
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
  const [provincia, setProvincia] = useState("");
  const [canton, setCanton] = useState("");
  const [distrito, setDistrito] = useState("");
  const [password, setPassword] = useState("");
  const [exito, setExito] = useState(false);

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
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
    const telefono = String(formData.get("telefono") ?? "").trim();
    const generacion = String(formData.get("generacion") ?? "");
    const modulo = String(formData.get("modulo") ?? "");
    const sede = String(formData.get("sede") ?? "");

    if (!PASSWORD_RULES.every((r) => r.test(password))) {
      setError("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (!provincia || !canton || !distrito) {
      setError("Elegí tu provincia, cantón y distrito de residencia.");
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
          phone: telefono || undefined,
          generationFwd: generacion ? Number(generacion) : undefined,
          moduloCompletado: modulo || undefined,
          sede: sede || undefined,
          provincia,
          canton,
          distrito,
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
      if (data?.redirectTo) {
        localStorage.setItem("fwd_dashboard", data.redirectTo);
        localStorage.setItem("fwd_redirect", data.redirectTo);
      }

      // Animación de éxito antes de redirigir al dashboard.
      const destino = data?.redirectTo ?? "/dashboard/estudiante";
      setExito(true);
      setTimeout(() => {
        router.push(destino);
        router.refresh();
      }, 1900);
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
          <p className="mt-2 text-fwd-ink/60 dark:text-white/60">
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

          {/* Solicitar invitación al equipo FWD (acceso solo por invitación) */}
          <Link
            href="/solicitar-acceso"
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
            <Mail size={16} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5" />
            Solicitar invitación
          </Link>
        </form>

        <p className="mt-8 text-center text-sm text-fwd-ink/60 dark:text-white/60">
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
        <h1 className="font-display text-3xl font-black text-fwd-ink dark:text-white">
          Completá tu registro
        </h1>
        <p className="mt-2 text-fwd-ink/60 dark:text-white/60">
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="telefono"
            name="telefono"
            type="tel"
            label="Teléfono"
            placeholder="8888-8888"
            autoComplete="tel"
            inputMode="tel"
            pattern="[0-9()+\-\s]{8,20}"
            title="Ingresá un teléfono válido (8 dígitos)"
            required
          />
          <SelectField id="generacion" name="generacion" label="Generación FWD" defaultValue="" required>
            <option value="" disabled>Seleccioná tu generación</option>
            {GENERACIONES_FWD.map((g) => (
              <option key={g} value={g}>Generación {g}</option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField id="modulo" name="modulo" label="Módulo completado" defaultValue="" required>
            <option value="" disabled>Seleccioná un módulo</option>
            {MODULOS_FWD.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </SelectField>
          <SelectField id="sede" name="sede" label="Sede de graduación" defaultValue="" required>
            <option value="" disabled>Seleccioná tu sede</option>
            {SEDES_FWD.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SelectField
            id="provincia"
            label="Provincia donde vive"
            value={provincia}
            onChange={(e) => { setProvincia(e.target.value); setCanton(""); setDistrito(""); }}
            required
          >
            <option value="" disabled>Seleccioná tu provincia</option>
            {PROVINCIAS_CR.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </SelectField>
          <SelectField
            id="canton"
            label="Cantón donde vive"
            value={canton}
            onChange={(e) => { setCanton(e.target.value); setDistrito(""); }}
            required
          >
            <option value="" disabled>
              {provincia ? "Seleccioná tu cantón" : "Elegí una provincia primero"}
            </option>
            {cantonesDe(provincia).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </SelectField>
        </div>

        <SelectField
          id="distrito"
          label="Distrito donde vive"
          value={distrito}
          onChange={(e) => setDistrito(e.target.value)}
          required
        >
          <option value="" disabled>
            {canton ? "Seleccioná tu distrito" : "Elegí un cantón primero"}
          </option>
          {distritosDe(canton).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </SelectField>

        <div className="flex flex-col gap-1.5">
          <TextField
            id="password"
            name="password"
            type="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={128}
            required
          />
          {/* Requisitos con validación en vivo */}
          <ul className="mt-1 grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    ok ? "text-green-600 dark:text-green-400" : "text-fwd-ink/45 dark:text-white/45"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                      ok ? "bg-green-500 text-white" : "bg-fwd-ink/15 dark:bg-white/15 text-transparent"
                    }`}
                  >
                    <IconCheck className="h-2.5 w-2.5" />
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

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

        <label className="flex items-start gap-2.5 text-sm text-fwd-ink/70 dark:text-white/70">
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
          className="inline-flex items-center justify-center gap-1.5 text-sm text-fwd-ink/50 dark:text-white/50 hover:text-fwd-ink dark:hover:text-white transition"
        >
          <IconArrowLeft className="h-4 w-4" />
          Cambiar correo
        </button>
      </form>

      {exito && <SuccessOverlay />}
    </div>
  );
}
