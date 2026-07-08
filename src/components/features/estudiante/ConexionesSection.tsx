"use client";

import { useState } from "react";
import { Link2, X, ExternalLink } from "lucide-react";
import GithubRepos from "./GithubRepos";

// Ícono de GitHub (lucide deprecó los íconos de marca).
function Github({ width = 16, height = 16 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}
import {
  CONEXIONES_ROWS,
  DEFAULT_CONEXIONES,
  urlConexion,
  normalizarUsuarioGithub,
  type Conexiones,
} from "@/lib/empleabilidad";

// Sección "Conexiones" de la Configuración del estudiante. Permite conectar
// GitHub (valida que exista y muestra sus repos públicos), Discord, LinkedIn y
// sitio web. Se guardan en preferencias.conexiones vía PATCH.
export default function ConexionesSection({
  conexionesIniciales,
}: {
  conexionesIniciales: Conexiones;
}) {
  const [con, setCon] = useState<Conexiones>(conexionesIniciales);
  const [borrador, setBorrador] = useState<Conexiones>({ ...DEFAULT_CONEXIONES });
  const [guardando, setGuardando] = useState<keyof Conexiones | null>(null);
  const [errores, setErrores] = useState<Partial<Record<keyof Conexiones, string>>>({});

  async function guardar(next: Conexiones, key: keyof Conexiones): Promise<boolean> {
    setGuardando(key);
    try {
      const res = await fetch("/api/estudiante/preferencias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conexiones: next }),
      });
      if (!res.ok) throw new Error("bad");
      const data = await res.json();
      setCon(data.conexiones ?? next);
      return true;
    } catch {
      setErrores((e) => ({ ...e, [key]: "No se pudo guardar. Intentá de nuevo." }));
      return false;
    } finally {
      setGuardando(null);
    }
  }

  async function conectar(key: keyof Conexiones) {
    let valor = (borrador[key] ?? "").trim();
    if (!valor) return;
    setErrores((e) => ({ ...e, [key]: undefined }));

    if (key === "github") {
      valor = normalizarUsuarioGithub(valor);
      setGuardando("github");
      try {
        const res = await fetch(`/api/github/repos?u=${encodeURIComponent(valor)}`);
        const j = await res.json();
        if (!j.ok) {
          setErrores((e) => ({
            ...e,
            github: j.error === "no_existe" ? "Ese usuario de GitHub no existe." : "No pudimos validar ese usuario.",
          }));
          setGuardando(null);
          return;
        }
      } catch {
        setErrores((e) => ({ ...e, github: "No pudimos validar GitHub. Intentá de nuevo." }));
        setGuardando(null);
        return;
      }
    }

    const ok = await guardar({ ...con, [key]: valor }, key);
    if (ok) setBorrador((b) => ({ ...b, [key]: "" }));
  }

  async function desconectar(key: keyof Conexiones) {
    await guardar({ ...con, [key]: "" }, key);
  }

  return (
    <div className="flex flex-col gap-4">
      {CONEXIONES_ROWS.map((row) => {
        const valor = con[row.key];
        const conectado = valor.trim().length > 0;
        const url = conectado ? urlConexion(row.key, valor) : null;
        const cargando = guardando === row.key;
        const err = errores[row.key];

        return (
          <div key={row.key} className="rounded-xl border border-black/5 bg-surface-2/50 p-4 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-fwd-morado/10 text-fwd-morado">
                  {row.key === "github" ? <Github width={16} height={16} /> : <Link2 width={16} height={16} />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{row.titulo}</p>
                  <p className="text-xs text-text-muted">{row.ayuda}</p>
                </div>
              </div>

              {conectado ? (
                <div className="flex items-center gap-2">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-[180px] items-center gap-1.5 rounded-lg bg-fwd-morado/10 px-3 py-1.5 text-sm font-semibold text-fwd-morado transition-colors hover:bg-fwd-morado/20"
                    >
                      <span className="truncate">{row.key === "github" ? `@${valor}` : valor}</span>
                      <ExternalLink width={13} height={13} className="shrink-0" />
                    </a>
                  ) : (
                    <span className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-medium text-text">{valor}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => desconectar(row.key)}
                    disabled={cargando}
                    title="Desconectar"
                    className="grid h-8 w-8 place-items-center rounded-lg text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                  >
                    <X width={16} height={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    value={borrador[row.key]}
                    onChange={(e) => setBorrador((b) => ({ ...b, [row.key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") conectar(row.key);
                    }}
                    placeholder={row.placeholder}
                    className="w-48 rounded-lg border border-black/10 bg-surface px-3 py-2 text-sm text-text outline-none focus:border-fwd-morado dark:border-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => conectar(row.key)}
                    disabled={cargando || !borrador[row.key].trim()}
                    className="rounded-lg bg-[#662D91] px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {cargando ? "..." : "Conectar"}
                  </button>
                </div>
              )}
            </div>

            {err && <p className="mt-2 text-xs font-medium text-red-500">{err}</p>}

            {/* Preview de repos públicos de GitHub */}
            {row.key === "github" && conectado && (
              <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/10">
                <GithubRepos usuario={valor} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
