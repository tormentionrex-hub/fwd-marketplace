import type { Metadata } from "next";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { RegisterEstudianteForm } from "@/components/features/auth/register-estudiante-form";

export const metadata: Metadata = {
  title: "Registro de estudiante · FWD Costa Rica",
};

export default function RegisterEstudiantePage() {
  return (
    <AuthShell highlight="tu potencial">
      <RegisterEstudianteForm />
    </AuthShell>
  );
}
