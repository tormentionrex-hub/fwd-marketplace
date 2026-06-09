"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import QrCode, { qrToPngDataUrl } from "./QrCode";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconFacebook,
  IconLinkedin,
  IconShare,
  IconTwitterX,
  IconWhatsapp,
} from "@/components/ui/icons";

interface ShareProfileModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  nombre: string;
  username: string;
}

export default function ShareProfileModal({
  open,
  onClose,
  url,
  nombre,
  username,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const texto = `Mirá el perfil profesional de ${nombre} en FWD Costa Rica`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso si el portapapeles no está disponible.
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${nombre} · FWD Costa Rica`, text: texto, url });
      } catch {
        // El usuario canceló el diálogo nativo.
      }
    } else {
      copyLink();
    }
  };

  const downloadQr = () => {
    const dataUrl = qrToPngDataUrl(url);
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${username}.png`;
    a.click();
  };

  const redes = [
    {
      label: "WhatsApp",
      Icon: IconWhatsapp,
      color: "#25D366",
      href: `https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`,
    },
    {
      label: "LinkedIn",
      Icon: IconLinkedin,
      color: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      label: "X",
      Icon: IconTwitterX,
      color: "#0F172A",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Facebook",
      Icon: IconFacebook,
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Compartir perfil" description={`@${username}`}>
      <div className="flex flex-col gap-6">
        {/* Enlace + copiar */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2 pl-4">
          <span className="min-w-0 flex-1 truncate text-sm text-text-muted" title={url}>
            {url}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              copied
                ? "bg-fwd-turquesa/15 text-fwd-turquesa"
                : "bg-fwd-azul text-white hover:bg-fwd-azul/90"
            }`}
          >
            {copied ? <IconCheck width={16} height={16} /> : <IconCopy width={16} height={16} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        {/* Redes sociales */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Compartir en redes
          </p>
          <div className="flex flex-wrap gap-3">
            {redes.map(({ label, Icon, color, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Compartir en ${label}`}
                className="group flex flex-col items-center gap-1.5"
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-full text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: color }}
                >
                  <Icon width={20} height={20} />
                </span>
                <span className="text-xs text-text-muted">{label}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={nativeShare}
              aria-label="Más opciones para compartir"
              className="group flex flex-col items-center gap-1.5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-text transition-transform group-hover:scale-110 ring-1 ring-border">
                <IconShare width={20} height={20} />
              </span>
              <span className="text-xs text-text-muted">Más</span>
            </button>
          </div>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center gap-3 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Código QR del perfil
          </p>
          <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
            <QrCode value={url} size={180} dark="#0F172A" light="#FFFFFF" />
          </div>
          <button
            type="button"
            onClick={downloadQr}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-2"
          >
            <IconDownload width={16} height={16} />
            Descargar QR (PNG)
          </button>
        </div>
      </div>
    </Modal>
  );
}
