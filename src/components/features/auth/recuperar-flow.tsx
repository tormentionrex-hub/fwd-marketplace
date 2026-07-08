"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TextField } from "@/components/ui/text-field";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { tiempoRelativo } from "@/lib/tiempo";

type Paso = "solicitar" | "verificar" | "nueva" | "exito";

const PASSWORD_RULES = [
  { id: "len", label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "Una minúscula", test: (v: string) => /[a-z]/.test(v) },
  { id: "num", label: "Un número", test: (v: string) => /[0-9]/.test(v) },
  { id: "special", label: "Un carácter especial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

const inputClass =
  "w-full rounded-xl border border-fwd-ink/12 dark:border-white/15 bg-fwd-mist/40 dark:bg-white/5 px-4 py-3 text-[0.95rem] text-fwd-ink dark:text-white outline-none transition placeholder:text-fwd-ink/35 dark:placeholder:text-white/35 focus:border-fwd-blue focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/15";

const botonClass =
  "group mt-1 flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60";

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <p
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {msg}
    </p>
  );
}

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecuperarFlow() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>("solicitar");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [ultimaSesion, setUltimaSesion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: solicitar
  async function solicitar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const valor = String(
      new FormData(e.currentTarget).get("email") ?? "",
    ).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: valor }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        // 404 → el correo no está registrado; mostramos el mensaje del servidor.
        setError(d.error ?? "No se pudo enviar el código.");
        return;
      }
      setEmail(valor);
      setUltimaSesion(typeof d.ultimaSesion === "string" ? d.ultimaSesion : null);
      setPaso("verificar");
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={paso}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {paso === "solicitar" && (
            <div>
              <header className="mb-8">
                <h1 className="font-display text-3xl font-black text-fwd-ink dark:text-white">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-2 text-fwd-ink/60 dark:text-white/60">
                  Ingresá tu correo y te enviaremos un código de recuperación.
                </p>
              </header>
              <form onSubmit={solicitar} className="flex flex-col gap-5">
                {error && <ErrorBanner msg={error} />}
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                />
                <button type="submit" disabled={loading} className={`${botonClass} bg-fwd-blue hover:bg-fwd-purple`}>
                  {loading ? "Enviando…" : "Enviar código"}
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
              <p className="mt-8 text-center text-sm text-fwd-ink/60 dark:text-white/60">
                <Link href="/login" className="font-semibold text-fwd-blue hover:text-fwd-purple transition">
                  Volver a iniciar sesión
                </Link>
              </p>
            </div>
          )}

          {paso === "verificar" && (
            <PasoVerificar
              email={email}
              ultimaSesion={ultimaSesion}
              onError={setError}
              error={error}
              onVerificado={(tok) => {
                setResetToken(tok);
                setError(null);
                setPaso("nueva");
              }}
            />
          )}

          {paso === "nueva" && (
            <PasoNueva
              resetToken={resetToken}
              error={error}
              onError={setError}
              onListo={() => {
                setError(null);
                setPaso("exito");
              }}
            />
          )}

          {paso === "exito" && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-3xl font-black text-fwd-ink dark:text-white">
                ¡Contraseña actualizada!
              </h1>
              <p className="mt-2 text-fwd-ink/60 dark:text-white/60">
                Ya podés iniciar sesión con tu nueva contraseña.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className={`${botonClass} mx-auto mt-8 bg-fwd-blue hover:bg-fwd-purple`}
              >
                Ir a iniciar sesión
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- Paso 2: verificar OTP ----------
function PasoVerificar({
  email,
  ultimaSesion,
  error,
  onError,
  onVerificado,
}: {
  email: string;
  ultimaSesion: string | null;
  error: string | null;
  onError: (m: string | null) => void;
  onVerificado: (resetToken: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [expira, setExpira] = useState(900); // 15 min
  const [reenviarEn, setReenviarEn] = useState(60);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setExpira((s) => (s > 0 ? s - 1 : 0));
      setReenviarEn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const code = digits.join("");
  const ultimaSesionTexto = tiempoRelativo(ultimaSesion);

  async function verificar(codigo: string) {
    onError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codigo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? "Código incorrecto.");
        setDigits(["", "", "", "", "", ""]);
        refs.current[0]?.focus();
        return;
      }
      onVerificado(data.resetToken);
    } catch {
      onError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function setDigit(i: number, val: string) {
    const limpio = val.replace(/\D/g, "");
    if (!limpio) {
      setDigits((d) => d.map((x, idx) => (idx === i ? "" : x)));
      return;
    }
    const next = [...digits];
    // Soporta pegar varios dígitos a la vez.
    for (let k = 0; k < limpio.length && i + k < 6; k++) {
      next[i + k] = limpio[k]!;
    }
    setDigits(next);
    const ultimo = Math.min(i + limpio.length, 5);
    refs.current[ultimo]?.focus();
    const unido = next.join("");
    if (unido.length === 6) verificar(unido);
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  async function reenviar() {
    if (reenviarEn > 0) return;
    onError(null);
    await fetch("/api/auth/password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setExpira(900);
    setReenviarEn(60);
    setDigits(["", "", "", "", "", ""]);
    refs.current[0]?.focus();
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black text-fwd-ink dark:text-white">Verificá el código</h1>
        <p className="mt-2 text-fwd-ink/60 dark:text-white/60">
          Enviamos un código de 6 dígitos a <strong className="text-fwd-ink dark:text-white">{email}</strong>.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <p
          aria-live="polite"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          Hemos enviado un código de verificación a tu correo electrónico.
        </p>
        <p className="rounded-xl border border-fwd-ink/10 dark:border-white/10 bg-fwd-mist/40 dark:bg-white/5 px-4 py-3 text-sm text-fwd-ink/70 dark:text-white/70">
          {ultimaSesionTexto
            ? <>Última sesión de esta cuenta: <strong className="text-fwd-ink dark:text-white">{ultimaSesionTexto}</strong>.</>
            : "Esta cuenta todavía no ha iniciado sesión."}
        </p>
        {error && <ErrorBanner msg={error} />}

        <div className="flex justify-between gap-2" role="group" aria-label="Código de verificación">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              aria-label={`Dígito ${i + 1}`}
              className="h-14 w-full rounded-xl border border-fwd-ink/12 dark:border-white/15 bg-fwd-mist/40 dark:bg-white/5 text-center text-2xl font-bold text-fwd-ink dark:text-white outline-none transition focus:border-fwd-blue focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/15"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm" aria-live="polite">
          <span className="text-fwd-ink/60 dark:text-white/60">
            {expira > 0 ? <>Expira en <strong>{mmss(expira)}</strong></> : "El código expiró"}
          </span>
          <button
            type="button"
            onClick={reenviar}
            disabled={reenviarEn > 0}
            className="font-semibold text-fwd-blue transition hover:text-fwd-purple disabled:cursor-not-allowed disabled:text-fwd-ink/35"
          >
            {reenviarEn > 0 ? `Reenviar en ${reenviarEn}s` : "Reenviar código"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => verificar(code)}
          disabled={loading || code.length !== 6}
          className={`${botonClass} bg-fwd-blue hover:bg-fwd-purple`}
        >
          {loading ? "Verificando…" : "Verificar código"}
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

// ---------- Paso 3: nueva contraseña ----------
function PasoNueva({
  resetToken,
  error,
  onError,
  onListo,
}: {
  resetToken: string;
  error: string | null;
  onError: (m: string | null) => void;
  onListo: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const cumplidas = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const valida = cumplidas === PASSWORD_RULES.length;
  const coincide = confirmar.length > 0 && password === confirmar;
  const puede = valida && coincide && !loading;

  const fuerzaColor =
    cumplidas <= 2 ? "bg-red-500" : cumplidas <= 4 ? "bg-fwd-yellow" : "bg-green-500";
  const fuerzaTexto = cumplidas <= 2 ? "Débil" : cumplidas <= 4 ? "Media" : "Fuerte";

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!puede) return;
    onError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        onError(d.error ?? "No se pudo cambiar la contraseña.");
        return;
      }
      onListo();
    } catch {
      onError("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-black text-fwd-ink dark:text-white">Nueva contraseña</h1>
        <p className="mt-2 text-fwd-ink/60 dark:text-white/60">Definí una contraseña segura para tu cuenta.</p>
      </header>

      <form onSubmit={enviar} className="flex flex-col gap-5">
        {error && <ErrorBanner msg={error} />}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-fwd-ink/80 dark:text-white/80">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={mostrar ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              className={`${inputClass} pr-16`}
            />
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-fwd-blue"
            >
              {mostrar ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fwd-ink/10">
                  <div
                    className={`h-full rounded-full transition-all ${fuerzaColor}`}
                    style={{ width: `${(cumplidas / PASSWORD_RULES.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-fwd-ink/60 dark:text-white/60">{fuerzaTexto}</span>
              </div>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <li
                      key={rule.id}
                      className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-fwd-ink/45 dark:text-white/45"}`}
                    >
                      {ok ? (
                        <IconCheck className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <span className="block h-3.5 w-3.5 rounded-full border border-fwd-ink/30" />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmar" className="text-sm font-medium text-fwd-ink/80 dark:text-white/80">
            Confirmar contraseña
          </label>
          <input
            id="confirmar"
            type={mostrar ? "text" : "password"}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repetí la contraseña"
            autoComplete="new-password"
            required
            aria-invalid={confirmar.length > 0 && !coincide}
            className={inputClass}
          />
          {confirmar.length > 0 && !coincide && (
            <p className="text-xs text-red-600">Las contraseñas no coinciden.</p>
          )}
        </div>

        <button type="submit" disabled={!puede} className={`${botonClass} bg-fwd-blue hover:bg-fwd-purple`}>
          {loading ? "Guardando…" : "Cambiar contraseña"}
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
}
