"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { IconMail, IconLock } from "@/components/ui/icons";

export default function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push(`/${locale}/dashboard/estudiante`);
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo iniciar sesión.");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Input
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="tucorreo@ejemplo.com"
        icon={<IconMail width={18} height={18} />}
      />
      <div className="flex flex-col gap-1.5">
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          icon={<IconLock width={18} height={18} />}
        />
        <Link
          href={`/${locale}/auth/recuperar`}
          className="self-end text-xs font-medium text-fwd-azul hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" fullWidth size="lg" loading={pending} className="mt-2">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
