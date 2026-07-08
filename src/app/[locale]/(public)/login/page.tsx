import type { Metadata } from "next";
import Image from "next/image";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Inicia sesión · FWD Costa Rica",
};

export default function LoginPage() {
  return (
    <AuthShell
      highlight="el futuro"
      logo={
        <Image
          src="/imagenes/fwd-marketplace.png"
          alt="FWD Marketplace"
          width={1412}
          height={1114}
          priority
          className="h-28 w-auto object-contain lg:h-36"
        />
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
