import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import ChatView from "@/components/features/chat/ChatView";
import { IconArrowLeft } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Mensajes · FWD Marketplace",
};

export default async function MensajesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  const volverHref =
    user.roles.nombre === "empresario"
      ? `/${locale}/empresario`
      : `/${locale}/dashboard/estudiante`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href={volverHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-fwd-azul"
      >
        <IconArrowLeft width={16} height={16} />
        Volver
      </Link>
      <ChatView />
    </div>
  );
}
