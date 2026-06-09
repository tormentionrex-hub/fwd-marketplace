"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import EstadoOfertaCard from "./EstadoOfertaCard";
import { IconLock } from "@/components/ui/icons";
import type { EstadoOfertaDetalle } from "@/lib/oferta-estado";
import type { EstadoProyecto } from "@/types/sefora";

type Fase =
  | { tipo: "loading" }
  | { tipo: "sin_sesion" }
  | { tipo: "con_oferta"; estado: EstadoOfertaDetalle; fecha?: string | undefined }
  | { tipo: "sin_oferta" }
  | { tipo: "error"; mensaje: string };

interface OfertaPanelProps {
  locale: string;
  proyectoId: string;
  estadoProyecto: EstadoProyecto;
  /** El plazo de aplicación ya venció. */
  vencido: boolean;
}

/**
 * Panel de acción de la ficha de proyecto. Consume el endpoint real
 * `GET /api/ofertas/proyecto/:id/estado` para saber si el estudiante ya ofertó,
 * con estados de carga y manejo de errores. Si el proyecto está cerrado,
 * cancelado o vencido, bloquea la acción sin importar la sesión.
 */
export default function OfertaPanel({
  locale,
  proyectoId,
  estadoProyecto,
  vencido,
}: OfertaPanelProps) {
  const [fase, setFase] = useState<Fase>({ tipo: "loading" });
  const [intento, setIntento] = useState(0);

  const inactivo = estadoProyecto === "cerrado" || estadoProyecto === "cancelado";
  const bloqueado = inactivo || vencido;

  useEffect(() => {
    // Si el proyecto está bloqueado no consultamos el estado de la oferta.
    if (bloqueado) return;

    let cancelado = false;
    setFase({ tipo: "loading" });

    (async () => {
      try {
        const res = await fetch(`/api/ofertas/proyecto/${proyectoId}/estado`, {
          cache: "no-store",
        });
        if (cancelado) return;

        if (res.status === 401) {
          setFase({ tipo: "sin_sesion" });
          return;
        }
        if (!res.ok) {
          setFase({ tipo: "error", mensaje: "No pudimos cargar el estado de tu oferta." });
          return;
        }

        const data: { existe: boolean; estado: EstadoOfertaDetalle | null; enviado: string | null } =
          await res.json();
        if (cancelado) return;

        if (data.existe && data.estado) {
          const fecha = data.enviado
            ? new Date(data.enviado).toLocaleDateString("es-CR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : undefined;
          setFase({ tipo: "con_oferta", estado: data.estado, fecha });
        } else {
          setFase({ tipo: "sin_oferta" });
        }
      } catch {
        if (!cancelado) {
          setFase({ tipo: "error", mensaje: "Ocurrió un error de red. Intentá de nuevo." });
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [proyectoId, bloqueado, intento]);

  // --- Proyecto bloqueado (cerrado / cancelado / vencido) ---
  if (inactivo) {
    return (
      <Bloqueado
        titulo="No disponible"
        mensaje="Este proyecto ya no admite nuevas ofertas."
      />
    );
  }
  if (vencido) {
    return (
      <Bloqueado
        mensaje="El período para enviar ofertas ha finalizado."
        mensajeTone="danger"
      />
    );
  }

  // --- Estados dinámicos ---
  if (fase.tipo === "loading") {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
        <div className="h-11 w-full animate-pulse rounded-full bg-surface-2" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
      </div>
    );
  }

  if (fase.tipo === "error") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{fase.mensaje}</p>
        <Button variant="outline" fullWidth onClick={() => setIntento((n) => n + 1)}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (fase.tipo === "con_oferta") {
    return <EstadoOfertaCard estado={fase.estado} fecha={fase.fecha} />;
  }

  if (fase.tipo === "sin_sesion") {
    return (
      <div className="flex flex-col gap-3">
        <Button href={`/${locale}/login?redirect=/${locale}/proyectos/${proyectoId}`} fullWidth>
          Enviar oferta
        </Button>
        <p className="text-sm text-text-muted">
          Debes iniciar sesión para enviar una oferta a este proyecto.
        </p>
      </div>
    );
  }

  // fase.tipo === "sin_oferta"
  return (
    <Button href={`/${locale}/proyectos/${proyectoId}/ofertar`} fullWidth>
      Enviar oferta
    </Button>
  );
}

function Bloqueado({
  titulo,
  mensaje,
  mensajeTone = "muted",
}: {
  titulo?: string;
  mensaje: string;
  mensajeTone?: "muted" | "danger";
}) {
  return (
    <div className="flex flex-col gap-3">
      {titulo && <span className="text-sm font-semibold text-text">{titulo}</span>}
      <Button disabled fullWidth>
        <IconLock width={16} height={16} />
        Enviar oferta
      </Button>
      <p
        className={
          mensajeTone === "danger"
            ? "text-sm font-medium text-red-600 dark:text-red-400"
            : "text-sm text-text-muted"
        }
      >
        {mensaje}
      </p>
    </div>
  );
}
