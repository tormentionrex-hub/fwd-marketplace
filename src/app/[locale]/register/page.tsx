import type { Metadata } from "next";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata: Metadata = {
  title: "Crea tu cuenta · FWD Costa Rica",
};

export default function RegisterPage() {
  return (
    <AuthShell highlight="el futuro">
      <RegisterForm />
    </AuthShell>
  );
}
