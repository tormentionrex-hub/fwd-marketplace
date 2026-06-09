"use client";

import { motion } from "framer-motion";
import TechBadge from "./TechBadge";
import { IconExternalLink, IconGithub, IconStar } from "@/components/ui/icons";
import { isValidHttpUrl } from "@/lib/utils/url";
import type { ProyectoPublico } from "@/types/perfil";

export default function ProjectShowcaseCard({ proyecto }: { proyecto: ProyectoPublico }) {
  const repoUrl = isValidHttpUrl(proyecto.repoUrl) ? proyecto.repoUrl : undefined;
  const demoUrl = isValidHttpUrl(proyecto.demoUrl) ? proyecto.demoUrl : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.21, 0.5, 0.27, 1] }}
      whileHover={{ y: -8 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-300/40 dark:hover:shadow-black/40"
    >
      {/* Cover: captura del proyecto o cover de color de marca */}
      <div
        className="relative flex h-40 items-center justify-center overflow-hidden"
        style={{ backgroundColor: proyecto.color }}
      >
        {proyecto.imagenUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proyecto.imagenUrl}
              alt={`Captura del proyecto ${proyecto.titulo}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        ) : (
          <svg
            viewBox="0 0 66 76"
            className="h-20 w-20 transition-transform duration-500 group-hover:scale-110"
            fill="#ffffff"
            opacity={0.22}
            aria-hidden
          >
            <path d="M0 0 L66 38 L0 76 Z" />
          </svg>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
          {proyecto.estado}
        </span>
        <span
          className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700"
          title={
            proyecto.evaluaciones
              ? `${proyecto.calificacion.toFixed(1)} de 5 · ${proyecto.evaluaciones} evaluaciones`
              : `${proyecto.calificacion.toFixed(1)} de 5`
          }
        >
          <IconStar width={13} height={13} className="text-fwd-amarillo" />
          {proyecto.calificacion.toFixed(1)}
          {proyecto.evaluaciones ? (
            <span className="font-medium text-slate-500">({proyecto.evaluaciones})</span>
          ) : null}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-text">{proyecto.titulo}</h3>
          <span className="shrink-0 text-xs text-text-muted">{proyecto.fecha}</span>
        </div>
        {proyecto.evaluaciones ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-text-muted">
            <IconStar width={12} height={12} className="text-fwd-amarillo" />
            {proyecto.calificacion.toFixed(1)} · {proyecto.evaluaciones} evaluaciones
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
          {proyecto.descripcion}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {proyecto.tecnologias.map((tech) => (
            <li key={tech}>
              <TechBadge tech={tech} />
            </li>
          ))}
        </ul>

        {proyecto.comentario && (
          <blockquote className="mt-4 rounded-xl border-l-2 border-fwd-azul/40 bg-surface-2 px-3 py-2 text-xs italic text-text-muted">
            “{proyecto.comentario}”
          </blockquote>
        )}

        {(repoUrl || demoUrl) && (
          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-fwd-azul hover:text-fwd-azul"
              >
                <IconGithub width={15} height={15} />
                Ver Código
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-fwd-azul px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-fwd-azul/90"
              >
                <IconExternalLink width={15} height={15} />
                Ver Demo
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
