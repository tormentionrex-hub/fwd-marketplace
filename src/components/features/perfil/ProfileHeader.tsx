"use client";

import { motion } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import ReputationDisplay from "./ReputationDisplay";
import ProfileActions from "./ProfileActions";
import { IconAward, IconMapPin, IconShieldCheck } from "@/components/ui/icons";
import type { PerfilPublico } from "@/types/perfil";

interface ProfileHeaderProps {
  perfil: PerfilPublico;
  /** Ruta pública del perfil, p. ej. `/es/perfil/usuario`. */
  profilePath: string;
}

const EASE = [0.21, 0.5, 0.27, 1] as const;

export default function ProfileHeader({ perfil, profilePath }: ProfileHeaderProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
      {/* Banner 300px */}
      <div
        className="relative h-[180px] sm:h-[240px] lg:h-[300px]"
        style={{
          backgroundImage: "linear-gradient(110deg, #008FD4 0%, #662D91 55%, #EC008C 100%)",
        }}
      >
        {/* Imagen de portada (opcional, lazy) sobre el banner de marca */}
        {perfil.portadaUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={perfil.portadaUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            />
          </>
        )}
        {/* Patrón geométrico de marca */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {[
          { top: "18%", left: "12%", size: 70, op: 0.12, dur: 8, drift: 18 },
          { top: "55%", left: "78%", size: 90, op: 0.1, dur: 10, drift: 22 },
          { top: "30%", left: "60%", size: 48, op: 0.14, dur: 7, drift: 14 },
        ].map((a, i) => (
          <motion.svg
            key={i}
            aria-hidden
            viewBox="0 0 66 76"
            className="absolute"
            style={{ top: a.top, left: a.left, width: a.size, height: a.size }}
            fill="#ffffff"
            opacity={a.op}
            animate={{ x: [0, a.drift, 0] }}
            transition={{ duration: a.dur, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M0 0 L66 38 L0 76 Z" />
          </motion.svg>
        ))}
      </div>

      {/* Información principal (encima del banner) */}
      <div className="px-6 pb-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative z-10 -mt-14 flex flex-col gap-5 sm:-mt-16 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-end">
            <Avatar name={perfil.nombre} src={perfil.fotoUrl} size={128} ring />
            <div className="text-center lg:pb-1 lg:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">
                  {perfil.nombre}
                </h1>
                {perfil.verificadoFwd && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-fwd-turquesa/15 px-3 py-1 text-xs font-semibold text-fwd-turquesa ring-1 ring-fwd-turquesa/30">
                    <IconShieldCheck width={14} height={14} />
                    Verificado por FWD Costa Rica
                  </span>
                )}
              </div>
              <p className="mt-1 text-text-muted">@{perfil.username}</p>
              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                  {perfil.rol}
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
                <span className="inline-flex items-center gap-1 text-sm text-text-muted">
                  <IconMapPin width={14} height={14} />
                  {perfil.ubicacion}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 lg:items-end lg:pb-1">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <ReputationDisplay
                value={perfil.reputacion}
                evaluaciones={perfil.evaluaciones}
                satisfaccion={perfil.satisfaccion}
              />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-fwd-azul/10 px-3 py-1.5 text-sm font-semibold text-fwd-azul">
                <IconAward width={15} height={15} />
                {perfil.proyectosCompletados} proyectos completados
              </span>
            </div>
            <ProfileActions
              nombre={perfil.nombre}
              username={perfil.username}
              mostrarContacto={perfil.mostrarContacto}
              email={perfil.contacto.email}
              profilePath={profilePath}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
