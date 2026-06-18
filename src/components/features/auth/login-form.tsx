"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/ui/text-field";
import { IconArrowRight } from "@/components/ui/icons";
import { SocialAuthButtons } from "@/components/features/auth/social-auth-buttons";
import { PasswordToggle } from "@/components/ui/password-toggle";
import AnimatedFormTitle from "@/components/features/auth/AnimatedFormTitle";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "No se pudo iniciar sesión");
        return;
      }

      // Perfil público (nombre, foto) -> localStorage. Lo privado va en la cookie.
      if (data?.perfil) {
        localStorage.setItem("fwd_perfil", JSON.stringify(data.perfil));
      }

      router.push(data?.redirectTo ?? "/");
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
        <AnimatedFormTitle
          text="Inicia sesión"
          accentFrom="#20BEC6"
          accentTo="#662D91"
        />
        <p className="mt-1 text-fwd-ink/60 pl-4 border-l-2 border-fwd-ink/8">
          Bienvenido de vuelta. Sigamos avanzando.
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
            <label htmlFor="password" className="text-sm font-medium text-fwd-ink/80 dark:text-white/80">
              Contraseña
            </label>
            <Link
              href="/recuperar"
              className="text-sm font-medium transition-all duration-200 hover:tracking-wide"
              style={{ color: "#008FD5" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#662D91"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#008FD5"; }}
            >
              ¿La olvidaste?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 dark:bg-white/5 dark:border-white/15 dark:text-white px-4 py-3 pr-11 text-[0.95rem] text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 dark:placeholder:text-white/35 focus:border-fwd-blue focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/15"
            />
            <PasswordToggle
              visible={showPwd}
              onToggle={() => setShowPwd((v) => !v)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-fwd-ink/70 dark:text-white/70">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-fwd-ink/25 accent-fwd-blue"
          />
          Mantener la sesión iniciada
        </label>

        <button
          type="submit"
          disabled={loading}
          className="group relative mt-1 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: "linear-gradient(135deg, #008FD5, #662D91)",
            boxShadow: "0 4px 20px rgba(0,143,213,0.35)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(102,45,145,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,143,213,0.35)";
          }}
        >
          <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700 pointer-events-none" />
          <span className="relative z-10">{loading ? "Avanzando…" : "Iniciar sesión"}</span>
          <IconArrowRight className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </form>

      <div className="mt-6">
        <SocialAuthButtons />
      </div>

      <p className="mt-8 text-center text-sm text-fwd-ink/60 dark:text-white/60">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-bold transition-all duration-200 relative group/link"
          style={{ color: "#ED008C" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#662D91"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#ED008C"; }}
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
