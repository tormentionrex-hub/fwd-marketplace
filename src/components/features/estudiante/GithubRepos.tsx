"use client";

import { useEffect, useState } from "react";
import { Star, ExternalLink } from "lucide-react";

// Ícono de GitHub (lucide deprecó los íconos de marca).
function Github({ width = 16, height = 16, className }: { width?: number; height?: number; className?: string }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.92 1.23 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

interface Repo {
  nombre: string;
  descripcion: string | null;
  url: string;
  estrellas: number;
  lenguaje: string | null;
}
interface Resp {
  ok: boolean;
  error?: string;
  usuario?: string;
  nombre?: string;
  avatar?: string | null;
  url?: string;
  reposPublicos?: number;
  repos?: Repo[];
}

// Muestra el perfil de GitHub de un usuario y sus repositorios PÚBLICOS.
// Reutilizable: se usa en Configuración (preview) y en el perfil público.
export default function GithubRepos({ usuario }: { usuario: string }) {
  const [data, setData] = useState<Resp | null>(null);
  const [estado, setEstado] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let vivo = true;
    if (!usuario.trim()) {
      setEstado("error");
      return;
    }
    setEstado("loading");
    (async () => {
      try {
        const res = await fetch(`/api/github/repos?u=${encodeURIComponent(usuario)}`, {
          cache: "no-store",
        });
        const json: Resp = await res.json();
        if (!vivo) return;
        if (!json.ok) {
          setEstado("error");
          return;
        }
        setData(json);
        setEstado("ready");
      } catch {
        if (vivo) setEstado("error");
      }
    })();
    return () => {
      vivo = false;
    };
  }, [usuario]);

  if (estado === "loading") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
    );
  }

  if (estado === "error" || !data) {
    return (
      <p className="text-sm text-text-muted">
        No pudimos cargar el perfil de GitHub. Verificá que el usuario sea correcto.
      </p>
    );
  }

  return (
    <div>
      {/* Encabezado del perfil de GitHub */}
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2.5 rounded-xl border border-black/5 bg-surface-2 px-3 py-2 transition-colors hover:bg-fwd-morado/10 dark:border-white/10"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1B1F24] text-white">
          <Github width={16} height={16} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-text">@{data.usuario}</span>
          <span className="block text-xs text-text-muted">
            {data.reposPublicos ?? 0} repositorio{(data.reposPublicos ?? 0) === 1 ? "" : "s"} público
            {(data.reposPublicos ?? 0) === 1 ? "" : "s"}
          </span>
        </span>
        <ExternalLink width={14} height={14} className="ml-1 text-text-muted transition-colors group-hover:text-fwd-morado" />
      </a>

      {/* Repositorios públicos */}
      {data.repos && data.repos.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.repos.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex flex-col rounded-xl p-3 transition-shadow hover:shadow-md"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-fwd-morado">
                <Github width={13} height={13} className="shrink-0 text-text-muted" />
                <span className="truncate">{r.nombre}</span>
              </span>
              {r.descripcion && (
                <span className="mt-1 line-clamp-2 text-xs text-text-muted">{r.descripcion}</span>
              )}
              <span className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
                {r.lenguaje && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-fwd-turquesa" />
                    {r.lenguaje}
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5">
                  <Star width={12} height={12} /> {r.estrellas}
                </span>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-muted">Este usuario no tiene repositorios públicos.</p>
      )}
    </div>
  );
}
