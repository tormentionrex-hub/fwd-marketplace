"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { IconCheck } from "@/components/ui/icons";
import { isValidHttpUrl } from "@/lib/utils/url";

const MIN_PROPUESTA = 20;
const MAX_PROPUESTA = 1500;

interface FormularioOfertaProps {
  proyectoId: string;
}

/**
 * Formulario de envío de oferta. Hace POST a /api/ofertas con validación en
 * cliente, estado de carga, manejo de los errores que devuelve la API
 * (sesión, proyecto cerrado/vencido, oferta duplicada) y feedback de éxito.
 */
export default function FormularioOferta({ proyectoId }: FormularioOfertaProps) {
  const router = useRouter();
  const [propuesta, setPropuesta] = useState("");
  const [prototipoUrl, setPrototipoUrl] = useState("");
  const [errores, setErrores] = useState<{ propuesta?: string; prototipoUrl?: string }>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  function validar(): boolean {
    const e: { propuesta?: string; prototipoUrl?: string } = {};
    const p = propuesta.trim();
    if (!p) {
      e.propuesta = "La propuesta es obligatoria.";
    } else if (p.length < MIN_PROPUESTA) {
      e.propuesta = `Describe tu propuesta con al menos ${MIN_PROPUESTA} caracteres.`;
    }
    if (prototipoUrl.trim() && !isValidHttpUrl(prototipoUrl.trim())) {
      e.prototipoUrl = "Ingresa una URL válida (http o https).";
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ofertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoId,
          propuesta: propuesta.trim(),
          prototipoUrl: prototipoUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);

      // Sin sesión: mandar al login y volver al proyecto después de entrar.
      if (res.status === 401) {
        router.push(`/login?redirect=/proyectos/${proyectoId}`);
        return;
      }
      if (!res.ok) {
        setErrorGeneral(data?.error ?? "No se pudo enviar la oferta.");
        return;
      }

      setExito(true);
      setTimeout(() => {
        router.push(`/proyectos/${proyectoId}`);
        router.refresh();
      }, 1300);
    } catch {
      setErrorGeneral("Error de red. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white">
          <IconCheck width={24} height={24} />
        </span>
        <h2 className="font-display text-xl font-bold text-text">¡Oferta enviada!</h2>
        <p className="text-sm text-text-muted">
          Tu propuesta fue registrada correctamente. Te llevamos de vuelta al proyecto…
        </p>
      </div>
    );
  }

  const restante = propuesta.trim().length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {errorGeneral && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {errorGeneral}
        </p>
      )}

      <Textarea
        label="Tu propuesta"
        name="propuesta"
        required
        value={propuesta}
        onChange={(e) => setPropuesta(e.target.value)}
        maxLength={MAX_PROPUESTA}
        error={errores.propuesta}
        hint={`Explica cómo abordarías el proyecto, tu experiencia y tiempos estimados. ${restante}/${MAX_PROPUESTA}`}
        placeholder="Hola, me interesa tu proyecto. Propongo construir…"
        className="min-h-[180px]"
      />

      <Input
        label="Enlace a prototipo o portafolio (opcional)"
        name="prototipoUrl"
        type="url"
        inputMode="url"
        value={prototipoUrl}
        onChange={(e) => setPrototipoUrl(e.target.value)}
        error={errores.prototipoUrl}
        placeholder="https://…"
        hint="Demo, repositorio o documento que respalde tu propuesta."
      />

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" loading={loading}>
          Enviar oferta
        </Button>
      </div>

      <p className="text-xs text-text-muted">
        Solo puedes enviar una oferta por proyecto. Revisá bien tu propuesta antes de enviarla.
      </p>
    </form>
  );
}
