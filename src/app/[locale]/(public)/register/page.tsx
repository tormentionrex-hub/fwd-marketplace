import type { Metadata } from "next";
import { FwdMarketplaceLogo } from "@/components/ui/fwd-logo";
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
        <FwdMarketplaceLogo className="h-10 lg:h-12" forceLight={true} />
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
