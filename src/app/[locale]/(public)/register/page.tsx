import type { Metadata } from "next";
import Image from "next/image";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata: Metadata = {
  title: "Crea tu cuenta · FWD Costa Rica",
};

export default function RegisterPage() {
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
      <RegisterForm />
    </AuthShell>
  );
}
