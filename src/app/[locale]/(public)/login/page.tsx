import type { Metadata } from "next";
import { FwdMarketplaceLogo } from "@/components/ui/fwd-logo";
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
        <FwdMarketplaceLogo className="h-10 lg:h-12" forceLight={true} />
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
