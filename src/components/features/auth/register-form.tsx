"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";
import { IconArrowRight } from "@/components/ui/icons";
import { PasswordToggle } from "@/components/ui/password-toggle";
import { SocialAuthButtons } from "@/components/features/auth/social-auth-buttons";
import AnimatedFormTitle from "@/components/features/auth/AnimatedFormTitle";

// Persistencia del form en sessionStorage: si el usuario navega a /terminos y
// vuelve, recupera lo que llevaba escrito (excepto password). Se limpia al
// registrar con éxito.
const STORAGE_KEY = "fwd_register_form_state";
const PERSISTED_FIELDS = [
  "firstName",
  "lastName",
  "secondLastName",
  "identificationNumber",
  "age",
  "companyName",
  "email",
] as const;
type PersistedField = (typeof PERSISTED_FIELDS)[number];
type PersistedState = Partial<Record<PersistedField, string>> & { terms?: boolean };

function loadPersisted(): PersistedState {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch {
    return {};
  }
}

function savePersisted(form: HTMLFormElement, terms: boolean) {
  if (typeof window === "undefined") return;
  const fd = new FormData(form);
  const data: PersistedState = { terms };
  for (const key of PERSISTED_FIELDS) {
    const v = fd.get(key);
    if (typeof v === "string") data[key] = v;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / privacy mode: ignorar */
  }
}

/** Reglas de validación de la contraseña: se marcan con check al cumplirse. */
const PASSWORD_RULES = [
  { id: "len", label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "Una minúscula", test: (v: string) => /[a-z]/.test(v) },
  { id: "num", label: "Un número", test: (v: string) => /[0-9]/.test(v) },
  { id: "special", label: "Un carácter especial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
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
  const [initial] = useState<PersistedState>(() => loadPersisted());
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [terms, setTerms]       = useState<boolean>(initial.terms ?? false);
  const [showPwd, setShowPwd]   = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));
  const canSubmit     = passwordValid && terms && !loading;

  function handleFormInput(e: React.FormEvent<HTMLFormElement>) {
    savePersisted(e.currentTarget, terms);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const secondLastName = String(formData.get("secondLastName") ?? "").trim();
    const identificationNumber = String(formData.get("identificationNumber") ?? "").trim();
    const age = String(formData.get("age") ?? "").trim();
    const companyName = String(formData.get("companyName") ?? "").trim();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          secondLastName: secondLastName || undefined,
          identificationNumber: identificationNumber || undefined,
          age: age ? Number(age) : undefined,
          companyName: companyName || undefined,
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "No se pudo crear la cuenta");
        return;
      }

      // Limpiar el borrador del form: ya quedó creada la cuenta.
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignorar */
      }

      // Cuenta creada pero PENDIENTE de aprobación del admin: no hay sesión,
      // mostramos un mensaje en vez de redirigir.
      if (data?.pending) {
        setPendingMsg(
          data?.mensaje ??
            "Tu cuenta está pendiente de aprobación por un administrador.",
        );
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

  if (pendingMsg) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-fwd-yellow/20 text-fwd-orange">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-black text-fwd-ink">
          Cuenta pendiente de aprobación
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-fwd-ink/60">{pendingMsg}</p>
        <Link
          href="/login"
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white transition hover:bg-fwd-purple"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <AnimatedFormTitle
          text="Crea tu cuenta"
          accentFrom="#ED008C"
          accentTo="#662D91"
        />
        <p className="mt-1 text-fwd-ink/60 pl-4 border-l-2 border-fwd-ink/8">
          Forma parte de la comunidad que avanza hacia el futuro.
        </p>
      </header>

      <form onSubmit={handleSubmit} onInput={handleFormInput} className="flex flex-col gap-5">
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
            defaultValue={initial.firstName ?? ""}
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
            defaultValue={initial.lastName ?? ""}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="secondLastName"
            name="secondLastName"
            label="Segundo Apellido"
            placeholder="Quirós"
            autoComplete="additional-name"
            maxLength={50}
            pattern="[\p{L}\s'’\-]*"
            title="Solo letras, espacios y guiones (máx. 50)"
            defaultValue={initial.secondLastName ?? ""}
          />
          <TextField
            id="identificationNumber"
            name="identificationNumber"
            label="Número de identificación"
            placeholder="Ej. 1-2345-6789, 12345678A, 12-3456789"
            autoComplete="off"
            minLength={8}
            maxLength={20}
            pattern="[A-Za-z0-9\-]+"
            title="Letras, números y guiones (8–20). Admite cédula CR, DNI/NIE ES, SSN/EIN US, CURP MX, etc."
            defaultValue={initial.identificationNumber ?? ""}
            required
          />
        </div>

        <TextField
          id="age"
          name="age"
          type="number"
          label="Edad"
          placeholder="18"
          min={18}
          max={99}
          step={1}
          inputMode="numeric"
          onInput={(e) => {
            const t = e.currentTarget;
            if (t.value.length > 2) t.value = t.value.slice(0, 2);
          }}
          defaultValue={initial.age ?? ""}
          required
        />

        <TextField
          id="companyName"
          name="companyName"
          label="Nombre de empresa"
          placeholder="FWD Costa Rica S.A."
          autoComplete="organization"
          minLength={2}
          maxLength={200}
          defaultValue={initial.companyName ?? ""}
          required
        />

        <TextField
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          autoComplete="email"
          defaultValue={initial.email ?? ""}
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
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              aria-invalid={password.length > 0 && !passwordValid}
              className={`w-full rounded-xl border bg-fwd-mist/40 px-4 py-3 pr-20 text-[0.95rem] text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 focus:bg-white focus:ring-4 ${
                passwordValid
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500/15"
                  : "border-fwd-ink/12 focus:border-fwd-blue focus:ring-fwd-blue/15"
              }`}
            />
            {passwordValid ? (
              <span
                className="absolute right-11 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-green-500 text-white"
                aria-label="Contraseña válida"
              >
                <CheckIcon className="h-4 w-4" />
              </span>
            ) : null}
            <PasswordToggle
              visible={showPwd}
              onToggle={() => setShowPwd((v) => !v)}
            />
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
          className="group relative mt-1 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, #ED008C, #662D91)"
              : "rgba(0,0,0,0.15)",
            boxShadow: canSubmit ? "0 4px 20px rgba(237,0,140,0.35)" : "none",
          }}
          onMouseEnter={(e) => {
            if (canSubmit) e.currentTarget.style.boxShadow = "0 8px 30px rgba(102,45,145,0.55)";
          }}
          onMouseLeave={(e) => {
            if (canSubmit) e.currentTarget.style.boxShadow = "0 4px 20px rgba(237,0,140,0.35)";
          }}
        >
          {canSubmit && <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700 pointer-events-none" />}
          <span className="relative z-10">{loading ? "Avanzando…" : "Crear cuenta"}</span>
          <IconArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </form>

      <div className="mt-6">
        <SocialAuthButtons />
      </div>

      <p className="mt-8 text-center text-sm text-fwd-ink/60">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-bold transition-all duration-200"
          style={{ color: "#008FD5" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#662D91"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#008FD5"; }}
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
