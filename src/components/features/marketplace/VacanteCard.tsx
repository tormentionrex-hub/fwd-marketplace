"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconArrowRight,
  IconBriefcase,
  IconMapPin,
  IconCpu,
  IconBolt,
} from "@/components/ui/icons";
import type { VacanteMarketplace } from "@/types/vacante";
import { formatearSalario, labelModalidad, labelTipoEmpleo } from "@/lib/vacante-format";

const COLOR_POR_AREA: Record<string, string> = {
  "Tecnología": "#008FD4",
  "Educación": "#662D91",
  "Servicios": "#20BEC6",
  "Marketing": "#008FD4",
  "Emprendimiento": "#F7901E",
  "Innovación": "#EC008C",
  "Logística": "#20BEC6",
  "Comercio": "#F7901E",
  "Finanzas": "#008FD4",
  "Gastronomía": "#EC008C",
  "Recursos Humanos": "#662D91",
  "Salud": "#20BEC6",
  "Turismo": "#008FD4",
  "Operaciones": "#F7901E",
  "Mercadeo": "#EC008C",
};

const COLORES_FWD = ["#008FD4", "#662D91", "#EC008C", "#20BEC6", "#F7901E"];

function colorVacante(id: string, area: string | null): string {
  if (area && COLOR_POR_AREA[area]) return COLOR_POR_AREA[area]!;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % COLORES_FWD.length;
  return COLORES_FWD[h]!;
}

interface Props {
  vacante: VacanteMarketplace;
  locale: string;
}

export default function VacanteCard({ vacante, locale }: Props) {
  const color = colorVacante(vacante.id, vacante.area);
  const empresa = vacante.empresario.nombreEmpresa ?? vacante.empresario.nombre;
  const fotoEmpresa = vacante.empresario.fotoUrl;
  const salario = formatearSalario(vacante);
  const modalidad = labelModalidad(vacante.modalidad);
  const tipoEmpleo = labelTipoEmpleo(vacante.tipoEmpleo);

  // Portada: imágenes de la vacante en carrusel automático (cada 5s). Sin
  // imágenes, se muestra el fondo de marca con el ícono de maletín.
  const imagenes = vacante.imagenes ?? [];
  const tieneImagenes = imagenes.length > 0;
  const [idxImagen, setIdxImagen] = useState(0);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const t = setInterval(() => setIdxImagen((i) => (i + 1) % imagenes.length), 5000);
    return () => clearInterval(t);
  }, [imagenes.length]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.21, 0.5, 0.27, 1] }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface transition-all duration-300"
      style={{ border: "1px solid var(--border)", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${color}55`;
        e.currentTarget.style.boxShadow = `0 12px 40px ${color}30, 0 2px 8px rgba(0,0,0,0.08)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid var(--border)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
      }}
    >
      {/* Cover */}
      <div
        className="relative flex h-28 items-center justify-center overflow-hidden"
        style={
          tieneImagenes
            ? { background: "var(--surface-2)" }
            : { background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` }
        }
      >
        {tieneImagenes ? (
          <>
            {imagenes.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={vacante.titulo}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                style={{ opacity: i === idxImagen ? 1 : 0 }}
              />
            ))}
            {imagenes.length > 1 && (
              <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {imagenes.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === idxImagen ? 14 : 6,
                      background: i === idxImagen ? "#fff" : "rgba(255,255,255,0.6)",
                    }}
                  />
                ))}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/25 to-transparent" />
          </>
        ) : (
          <>
            <span className="pointer-events-none absolute inset-0 z-10 translate-x-[-100%] skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]" />
            <IconBriefcase width={40} height={40} className="text-white/25 transition-transform duration-500 group-hover:scale-110" />
          </>
        )}
        {vacante.area && (
          <span className="absolute left-4 top-4 rounded-full bg-surface/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-text shadow-sm">
            {vacante.area}
          </span>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          Abierta
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading font-black text-lg leading-snug text-text line-clamp-2">
          {vacante.titulo}
        </h3>

        {/* Empresa */}
        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
          {fotoEmpresa ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoEmpresa}
              alt={empresa}
              className="h-6 w-6 flex-shrink-0 rounded-full object-cover shadow-sm"
            />
          ) : (
            <span
              className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-[10px] font-black text-white shadow-sm"
              style={{ background: color }}
            >
              {empresa.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="font-semibold text-text truncate">{empresa}</span>
        </div>

        {/* Meta: modalidad, tipo empleo, ubicación */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {modalidad && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{ borderColor: `${color}30`, background: `${color}10`, color }}>
              {modalidad}
            </span>
          )}
          {tipoEmpleo && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted">
              {tipoEmpleo}
            </span>
          )}
          {vacante.ubicacion && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted">
              <IconMapPin width={11} height={11} />
              {vacante.ubicacion}
            </span>
          )}
        </div>

        {/* Salario */}
        {salario && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color }}>
            <IconBolt width={14} height={14} />
            {salario}
          </p>
        )}

        {/* Tecnologías */}
        {vacante.tecnologias.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vacante.tecnologias.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted"
              >
                <IconCpu width={11} height={11} className="opacity-70" />
                {tech}
              </span>
            ))}
            {vacante.tecnologias.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-text-muted">
                +{vacante.tecnologias.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end border-t border-border pt-4">
          <Link
            href={`/${locale}/marketplace/vacantes/${vacante.id}`}
            className="group/btn relative overflow-hidden inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 14px ${color}45` }}
          >
            <span className="relative z-10">Ver vacante</span>
            <IconArrowRight width={14} height={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            <span className="absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/25 transition-transform duration-500 group-hover/btn:translate-x-[100%]" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
