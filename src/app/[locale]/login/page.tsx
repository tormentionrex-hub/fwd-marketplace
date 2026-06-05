import type { Metadata } from "next";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Inicia sesión · FWD Costa Rica",
};

export default function LoginPage() {
  return (
    <AuthShell highlight="el futuro">
      <LoginForm />
    </AuthShell>
  );
}
