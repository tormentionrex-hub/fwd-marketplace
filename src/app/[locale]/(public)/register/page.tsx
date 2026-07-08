import type { Metadata } from "next";
import Image from "next/image";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { RegisterForm } from "@/components/features/auth/register-form";
import SelectorRolRegistro from "@/components/features/auth/selector-rol-registro";

export const metadata: Metadata = {
  title: "Crea tu cuenta · FWD Costa Rica",
};

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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
      <SelectorRolRegistro locale={locale} />
      <RegisterForm />
    </AuthShell>
  );
}
