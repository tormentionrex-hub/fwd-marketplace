"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { IconMail, IconUser, IconLock } from "@/components/ui/icons";

export default function RegisterForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        router.push(`/${locale}/dashboard/estudiante`);
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear la cuenta.");
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
        label="Nombre completo"
        type="text"
        name="name"
        autoComplete="name"
        required
        placeholder="Tu nombre"
        icon={<IconUser width={18} height={18} />}
      />
      <Input
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="tucorreo@ejemplo.com"
        icon={<IconMail width={18} height={18} />}
      />
      <PasswordInput
        label="Contraseña"
        name="password"
        autoComplete="new-password"
        required
        placeholder="Mínimo 8 caracteres"
        icon={<IconLock width={18} height={18} />}
        hint="Usa al menos 8 caracteres con letras y números."
      />

      <Button type="submit" fullWidth size="lg" loading={pending} className="mt-2">
        {pending ? "Creando cuenta..." : "Registrarme"}
      </Button>
      <p className="text-center text-xs text-text-muted">
        Al registrarte aceptas nuestros Términos y Política de Privacidad.
      </p>
    </form>
  );
}
