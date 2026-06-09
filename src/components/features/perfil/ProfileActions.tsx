"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ShareProfileModal from "./ShareProfileModal";
import { IconMail, IconShare, IconUserPlus } from "@/components/ui/icons";

interface ProfileActionsProps {
  nombre: string;
  username: string;
  mostrarContacto: boolean;
  email?: string | undefined;
  /** Ruta del perfil; fallback usado para el QR/compartir antes de leer window. */
  profilePath: string;
}

export default function ProfileActions({
  nombre,
  username,
  mostrarContacto,
  email,
  profilePath,
}: ProfileActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [url, setUrl] = useState(profilePath);

  // En el cliente usamos la URL pública absoluta real.
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const puedeContactar = mostrarContacto && Boolean(email);
  const invitarHref = email
    ? `mailto:${email}?subject=${encodeURIComponent("Invitación a un proyecto · FWD Costa Rica")}&body=${encodeURIComponent(
        `Hola ${nombre},\n\nVi tu perfil profesional en FWD Costa Rica y me gustaría invitarte a colaborar en un proyecto.\n\nPerfil: ${url}\n\n¡Saludos!`,
      )}`
    : undefined;

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
        {puedeContactar && (
          <Button href={`mailto:${email}`} variant="outline" size="sm">
            <IconMail width={16} height={16} />
            Contactar
          </Button>
        )}
        {puedeContactar && invitarHref && (
          <Button href={invitarHref} size="sm">
            <IconUserPlus width={16} height={16} />
            Invitar a proyecto
          </Button>
        )}
        <Button
          onClick={() => setShareOpen(true)}
          variant={puedeContactar ? "outline" : "primary"}
          size="sm"
        >
          <IconShare width={16} height={16} />
          Compartir
        </Button>
      </div>

      <ShareProfileModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={url}
        nombre={nombre}
        username={username}
      />
    </>
  );
}
