import type { Metadata } from "next";
import { AuthShell } from "@/components/features/auth/auth-shell";
import { RecuperarFlow } from "@/components/features/auth/recuperar-flow";

export const metadata: Metadata = {
  title: "Recuperar contraseña · FWD Costa Rica",
};

export default function RecuperarPage() {
  return (
    <AuthShell highlight="tu cuenta">
      <RecuperarFlow />
    </AuthShell>
  );
}
