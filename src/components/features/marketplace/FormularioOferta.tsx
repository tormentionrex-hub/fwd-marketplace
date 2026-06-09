"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ModoPrototipo = "archivo" | "url";

type Props = {
  proyecto: {
    id: string;
    titulo: string;
    diasRestantes: number | null; // null = sin fecha de cierre
    cerrado: boolean;
  };
  ofertaExistente?: {
    id: string;
    propuesta: string;
    estado: string;
  } | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function BadgeDias({ dias }: { dias: number | null }) {
  if (dias === null) {
    return (
      <span className="rounded-full bg-fwd-blue/10 px-3 py-1 text-xs font-semibold text-fwd-blue">
        Abierto
      </span>
    );
  }
  if (dias <= 0) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
        Vencido
      </span>
    );
  }
  if (dias <= 3) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
        {dias} día{dias !== 1 ? "s" : ""} restante{dias !== 1 ? "s" : ""}
      </span>
    );
  }
  if (dias <= 7) {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
        {dias} días restantes
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      {dias} días restantes
    </span>
  );
}

function validarUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FormularioOferta({ proyecto, ofertaExistente }: Props) {
  const router = useRouter();

  // Estado del formulario
  const [propuesta, setPropuesta] = useState("");
  const [modoPrototipo, setModoPrototipo] = useState<ModoPrototipo>("archivo");
  const [archivoPrototipo, setArchivoPrototipo] = useState<File | null>(null);
  const [urlPrototipo, setUrlPrototipo] = useState("");
  const [archivoDoc, setArchivoDoc] = useState<File | null>(null);

  // Estado de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retirando, setRetirando] = useState(false);
  const [errorRetirar, setErrorRetirar] = useState<string | null>(null);

  // ── Subir archivo a Supabase Storage ───────────────────────────────────────
  async function subirArchivo(
    archivo: File,
    tipo: "prototipo" | "documentacion"
  ): Promise<string> {
    const fd = new FormData();
    fd.append("archivo", archivo);
    fd.append("tipo", tipo);

    const res = await fetch("/api/upload/archivo", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);

    if (!res.ok) throw new Error(data?.error ?? "No se pudo subir el archivo");
    return data.url as string;
  }

  // ── Submit de la oferta ─────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Validaciones client-side
    if (!propuesta.trim()) {
      setError("La propuesta de solución es obligatoria.");
      return;
    }
    if (modoPrototipo === "url" && !urlPrototipo.trim()) {
      setError("Ingresá la URL del prototipo.");
      return;
    }
    if (modoPrototipo === "url" && !validarUrl(urlPrototipo.trim())) {
      setError("La URL del prototipo no tiene un formato válido (debe incluir https://).");
      return;
    }
    if (modoPrototipo === "archivo" && !archivoPrototipo) {
      setError("Seleccioná un archivo de prototipo.");
      return;
    }

    setLoading(true);
    try {
      // 1. Subir prototipo si es archivo
      let prototipoUrl: string | null = null;
      if (modoPrototipo === "archivo" && archivoPrototipo) {
        prototipoUrl = await subirArchivo(archivoPrototipo, "prototipo");
      } else if (modoPrototipo === "url") {
        prototipoUrl = urlPrototipo.trim();
      }

      // 2. Subir documentación si se adjuntó
      let documentacionUrl: string | null = null;
      if (archivoDoc) {
        documentacionUrl = await subirArchivo(archivoDoc, "documentacion");
      }

      // 3. Crear la oferta
      const res = await fetch("/api/ofertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idProyecto: proyecto.id,
          propuesta: propuesta.trim(),
          prototipoUrl,
          documentacionUrl,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "No se pudo enviar la oferta.");
        return;
      }

      // Éxito → redirigir al dashboard con mensaje implícito
      router.push("/dashboard/estudiante");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Retirar oferta ──────────────────────────────────────────────────────────
  async function handleRetirar() {
    if (!ofertaExistente) return;
    setErrorRetirar(null);
    setRetirando(true);

    try {
      const res = await fetch(`/api/ofertas/${ofertaExistente.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorRetirar(data?.error ?? "No se pudo retirar la oferta.");
        return;
      }

      router.push("/dashboard/estudiante");
      router.refresh();
    } catch {
      setErrorRetirar("Error de red. Intentá de nuevo.");
    } finally {
      setRetirando(false);
    }
  }

  // ── Proyecto cerrado ────────────────────────────────────────────────────────
  if (proyecto.cerrado) {
    return (
      <div className="flex flex-col gap-4">
        <Encabezado titulo={proyecto.titulo} diasRestantes={proyecto.diasRestantes} />
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-red-700">Proyecto cerrado</p>
          <p className="mt-1 text-sm text-red-600/80">
            Este proyecto ya no acepta nuevas ofertas.
          </p>
        </div>
      </div>
    );
  }

  // ── Oferta ya enviada ───────────────────────────────────────────────────────
  if (ofertaExistente) {
    const puedeRetirar = ofertaExistente.estado !== "adjudicada";
    return (
      <div className="flex flex-col gap-6">
        <Encabezado titulo={proyecto.titulo} diasRestantes={proyecto.diasRestantes} />

        <div className="rounded-xl border border-fwd-blue/30 bg-fwd-blue/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-fwd-blue text-lg">✓</span>
            <h2 className="font-semibold text-fwd-blue">Ya enviaste una oferta</h2>
            <EstadoBadge estado={ofertaExistente.estado} />
          </div>
          <p className="text-sm text-fwd-ink/70 whitespace-pre-wrap">
            {ofertaExistente.propuesta}
          </p>
        </div>

        {errorRetirar && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorRetirar}
          </p>
        )}

        {puedeRetirar && (
          <button
            onClick={handleRetirar}
            disabled={retirando}
            className="self-start rounded-full border border-red-300 bg-white px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {retirando ? "Retirando…" : "Retirar oferta"}
          </button>
        )}
      </div>
    );
  }

  // ── Formulario principal ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <Encabezado titulo={proyecto.titulo} diasRestantes={proyecto.diasRestantes} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Propuesta de solución */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fwd-ink/80">
            Propuesta de solución <span className="text-red-500">*</span>
          </label>
          <textarea
            value={propuesta}
            onChange={(e) => setPropuesta(e.target.value)}
            rows={6}
            placeholder="Describí tu enfoque, tecnologías que usarías, experiencia relevante..."
            required
            className="w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 px-4 py-3 text-[0.95rem] text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 focus:border-fwd-blue focus:bg-white focus:ring-4 focus:ring-fwd-blue/15 resize-none"
          />
          <span className="text-right text-xs text-fwd-ink/40">
            {propuesta.length} caracteres
          </span>
        </div>

        {/* Prototipo */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-fwd-ink/80">
              Prototipo <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-fwd-ink/50">
                (al menos uno es obligatorio)
              </span>
            </label>
            {/* Toggle archivo / URL */}
            <div className="flex rounded-lg border border-fwd-ink/12 overflow-hidden text-xs font-medium">
              {(["archivo", "url"] as ModoPrototipo[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModoPrototipo(m)}
                  className={`px-3 py-1.5 transition ${
                    modoPrototipo === m
                      ? "bg-fwd-blue text-white"
                      : "bg-white text-fwd-ink/60 hover:bg-fwd-mist/60"
                  }`}
                >
                  {m === "archivo" ? "Subir archivo" : "Ingresar URL"}
                </button>
              ))}
            </div>
          </div>

          {modoPrototipo === "archivo" ? (
            <div className="flex flex-col gap-1">
              <input
                type="file"
                accept=".zip,.pdf,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => setArchivoPrototipo(e.target.files?.[0] ?? null)}
                className="block w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 px-4 py-2.5 text-sm text-fwd-ink file:mr-4 file:rounded-full file:border-0 file:bg-fwd-blue/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-fwd-blue"
              />
              <p className="text-xs text-fwd-ink/40">
                Formatos: ZIP, PDF, JPG, PNG, GIF, WEBP — máx. 10 MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <input
                type="url"
                value={urlPrototipo}
                onChange={(e) => setUrlPrototipo(e.target.value)}
                placeholder="https://github.com/usuario/repo"
                className="w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 px-4 py-3 text-[0.95rem] text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 focus:border-fwd-blue focus:bg-white focus:ring-4 focus:ring-fwd-blue/15"
              />
              <p className="text-xs text-fwd-ink/40">
                GitHub, Figma, Drive, Vercel — cualquier URL válida
              </p>
            </div>
          )}
        </div>

        {/* Documentación técnica (opcional) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fwd-ink/80">
            Documentación técnica{" "}
            <span className="text-xs font-normal text-fwd-ink/50">(opcional)</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setArchivoDoc(e.target.files?.[0] ?? null)}
            className="block w-full rounded-xl border border-fwd-ink/12 bg-fwd-mist/40 px-4 py-2.5 text-sm text-fwd-ink file:mr-4 file:rounded-full file:border-0 file:bg-fwd-blue/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-fwd-blue"
          />
          <p className="text-xs text-fwd-ink/40">
            Solo PDF — máx. 5 MB
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-8 font-semibold text-white shadow-sm transition hover:bg-fwd-purple disabled:opacity-60 self-start"
        >
          {loading ? "Enviando…" : "Enviar oferta"}
          {!loading && (
            <span className="transition-transform group-hover:translate-x-1">▶</span>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Encabezado({
  titulo,
  diasRestantes,
}: {
  titulo: string;
  diasRestantes: number | null;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-fwd-ink/8 pb-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-fwd-ink">{titulo}</h1>
        <BadgeDias dias={diasRestantes} />
      </div>
      <p className="text-sm text-fwd-ink/60">
        Completá el formulario para enviar tu oferta a este proyecto.
      </p>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const mapa: Record<string, string> = {
    pendiente: "bg-fwd-blue/10 text-fwd-blue",
    en_revision: "bg-orange-100 text-orange-600",
    adjudicada: "bg-green-100 text-green-700",
    no_seleccionada: "bg-zinc-100 text-zinc-500",
  };
  const etiqueta: Record<string, string> = {
    pendiente: "Enviada",
    en_revision: "En revisión",
    adjudicada: "Adjudicada",
    no_seleccionada: "No seleccionada",
  };
  return (
    <span
      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${mapa[estado] ?? "bg-zinc-100 text-zinc-500"}`}
    >
      {etiqueta[estado] ?? estado}
    </span>
  );
}
