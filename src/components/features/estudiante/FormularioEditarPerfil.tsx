"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import CvManager from "./CvManager";
import { IconCheck, IconPlus, IconUpload, IconX } from "@/components/ui/icons";
import type { NivelHabilidad } from "@/types/sefora";
import type {
  HabilidadCatalogo,
  HabilidadSeleccionada,
  PerfilEditable,
  ProyectoCompletado,
} from "@/server/services/perfil-estudiante.service";

interface FormularioEditarPerfilProps {
  locale: string;
}

type Seccion = "datos" | "habilidades" | "portafolio" | "curriculum";

interface BorradorProyecto {
  titulo: string;
  descripcion: string;
  tecnologias: string;
  fecha: string;
  repoUrl: string;
  demoUrl: string;
}

const NIVELES: NivelHabilidad[] = ["básico", "intermedio", "avanzado"];
const MAX_FOTO_MB = 5;
const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10";
const textareaClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10";

const borradorInicial: BorradorProyecto = {
  titulo: "",
  descripcion: "",
  tecnologias: "",
  fecha: "",
  repoUrl: "",
  demoUrl: "",
};

function urlValida(valor: string): boolean {
  if (!valor) return true;
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function slug(nombre: string): string {
  return nombre.trim().toLowerCase().replace(/\s+/g, "-") || "perfil";
}

const secciones: { id: Seccion; label: string }[] = [
  { id: "datos", label: "Datos personales" },
  { id: "habilidades", label: "Habilidades" },
  { id: "portafolio", label: "Portafolio" },
  { id: "curriculum", label: "Currículum" },
];

type GitEstado = "idle" | "checking" | "ok" | "fail";
type Guardado = "idle" | "saving" | "saved" | "error";

export default function FormularioEditarPerfil({ locale }: FormularioEditarPerfilProps) {
  const router = useRouter();
  const [seccion, setSeccion] = useState<Seccion>("datos");
  const [carga, setCarga] = useState<"loading" | "ready" | "error">("loading");

  // Datos personales
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [resumen, setResumen] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");

  // Habilidades
  const [catalogo, setCatalogo] = useState<HabilidadCatalogo[]>([]);
  const [habilidades, setHabilidades] = useState<HabilidadSeleccionada[]>([]);

  // Portafolio
  const [completados, setCompletados] = useState<ProyectoCompletado[]>([]);
  const [proyectos, setProyectos] = useState<(BorradorProyecto & { id: string })[]>([]);
  const [borrador, setBorrador] = useState<BorradorProyecto>(borradorInicial);

  // Guardar / validación Git
  const [guardado, setGuardado] = useState<Guardado>("idle");
  const [errorGuardar, setErrorGuardar] = useState("");
  const [gitEstado, setGitEstado] = useState<GitEstado>("idle");

  // ── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch("/api/estudiante/perfil", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data: PerfilEditable = await res.json();
        if (cancelado) return;
        setNombre(data.nombre);
        setCorreo(data.correo);
        setResumen(data.resumen);
        setFotoUrl(data.fotoUrl);
        setCatalogo(data.catalogo);
        setHabilidades(data.habilidades);
        setCompletados(data.completados);
        setProyectos(data.portafolio);
        setCarga("ready");
      } catch {
        if (!cancelado) setCarga("error");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  // ── Foto ───────────────────────────────────────────────────────
  async function procesarFoto(archivo: File | undefined) {
    setErrorFoto("");
    if (!archivo) return;
    if (!TIPOS_FOTO.includes(archivo.type)) {
      setErrorFoto("La foto debe ser JPG, PNG o WEBP.");
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      setErrorFoto(`La foto no puede superar ${MAX_FOTO_MB} MB.`);
      return;
    }
    setSubiendoFoto(true);
    try {
      const fd = new FormData();
      fd.append("archivo", archivo);
      fd.append("tipo", "prototipo");
      const res = await fetch("/api/upload/archivo", { method: "POST", body: fd });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        setErrorFoto(data.error ?? "No se pudo subir la foto.");
        return;
      }
      setFotoUrl(data.url);
    } catch {
      setErrorFoto("No se pudo subir la foto. Intentá de nuevo.");
    } finally {
      setSubiendoFoto(false);
    }
  }

  // ── Habilidades ────────────────────────────────────────────────
  const nombreHabilidad = useCallback(
    (id: string) => catalogo.find((c) => c.id === id)?.nombre ?? id,
    [catalogo],
  );

  function toggleHabilidad(id: string) {
    setHabilidades((prev) =>
      prev.some((h) => h.id === id)
        ? prev.filter((h) => h.id !== id)
        : [...prev, { id, nivel: "básico" }],
    );
  }

  function cambiarNivel(id: string, nivel: NivelHabilidad) {
    setHabilidades((prev) => prev.map((h) => (h.id === id ? { ...h, nivel } : h)));
  }

  // ── Portafolio (local; persistencia pendiente de tabla en BD) ──
  const repoOk = urlValida(borrador.repoUrl);
  const demoOk = urlValida(borrador.demoUrl);
  const puedeAgregar = borrador.titulo.trim().length > 0 && repoOk && demoOk;

  async function verificarGit() {
    if (!borrador.repoUrl || !repoOk) {
      setGitEstado("idle");
      return;
    }
    setGitEstado("checking");
    try {
      const res = await fetch(`/api/utils/url-accesible?url=${encodeURIComponent(borrador.repoUrl)}`);
      const data: { valida: boolean; accesible: boolean } = await res.json();
      setGitEstado(data.accesible ? "ok" : "fail");
    } catch {
      setGitEstado("fail");
    }
  }

  function agregarProyecto() {
    if (!puedeAgregar) return;
    setProyectos((prev) => [...prev, { ...borrador, id: `manual-${Date.now()}` }]);
    setBorrador(borradorInicial);
    setGitEstado("idle");
  }

  function eliminarProyecto(id: string) {
    setProyectos((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Guardar ────────────────────────────────────────────────────
  async function guardar() {
    setErrorGuardar("");
    setGuardado("saving");
    try {
      const res = await fetch("/api/estudiante/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          fotoUrl,
          resumen,
          habilidades,
          portafolio: proyectos.map((p) => ({
            titulo: p.titulo,
            descripcion: p.descripcion,
            tecnologias: p.tecnologias,
            fecha: p.fecha,
            repoUrl: p.repoUrl,
            demoUrl: p.demoUrl,
          })),
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setErrorGuardar(data.error ?? "No se pudieron guardar los cambios.");
        setGuardado("error");
        return;
      }
      setGuardado("saved");
      router.refresh();
    } catch {
      setErrorGuardar("Error de red. Intentá de nuevo.");
      setGuardado("error");
    }
  }

  if (carga === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-64 animate-pulse rounded bg-surface-2" />
        <Card className="flex flex-col gap-4 p-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </Card>
      </div>
    );
  }

  if (carga === "error") {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <h1 className="font-display text-lg font-bold text-text">No pudimos cargar tu perfil</h1>
        <p className="text-sm text-text-muted">Recargá la página o intentá más tarde.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-text">Editar perfil y portafolio</h1>
          <p className="text-sm text-text-muted">Los cambios se reflejan en tu perfil público.</p>
        </div>
        <Link
          href={`/${locale}/perfil/${slug(nombre)}`}
          className="text-sm font-medium text-fwd-azul transition-colors hover:text-fwd-azul/80"
        >
          Ver perfil público →
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        {secciones.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSeccion(item.id)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              seccion === item.id
                ? "bg-fwd-azul text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {seccion === "datos" && (
        <Card className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 rounded-xl border border-slate-200 p-5 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-surface">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-fwd-azul/10 text-xl font-bold text-fwd-azul">
                  {nombre ? nombre.slice(0, 2).toUpperCase() : "?"}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-text">Foto de perfil</span>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-fwd-azul/10 px-4 py-2.5 text-sm font-semibold text-fwd-azul transition-colors hover:bg-fwd-azul/20">
                  <IconUpload width={16} height={16} />
                  {subiendoFoto ? "Subiendo…" : fotoUrl ? "Cambiar foto" : "Subir foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={subiendoFoto}
                    onChange={(e) => procesarFoto(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
                {fotoUrl && (
                  <button
                    type="button"
                    onClick={() => setFotoUrl("")}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
              <span className="text-xs text-text-muted">
                JPG, PNG o WEBP · máx {MAX_FOTO_MB} MB
              </span>
            </div>
          </div>
          {errorFoto && <p className="text-sm text-red-600 dark:text-red-400">{errorFoto}</p>}

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Nombre completo
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Correo electrónico
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className={inputClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Resumen profesional
            <textarea rows={4} value={resumen} onChange={(e) => setResumen(e.target.value)} className={textareaClass} />
          </label>
        </Card>
      )}

      {seccion === "habilidades" && (
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Catálogo</h2>
            {catalogo.length === 0 ? (
              <p className="text-sm text-text-muted">
                El catálogo de habilidades está vacío. Pedile al administrador que lo cargue.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {catalogo.map((h) => {
                  const seleccionada = habilidades.some((s) => s.id === h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => toggleHabilidad(h.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        seleccionada
                          ? "border-fwd-azul bg-fwd-azul/10 text-fwd-azul"
                          : "border-slate-200 text-slate-600 hover:border-fwd-azul/40 dark:border-white/15 dark:text-slate-300"
                      }`}
                    >
                      {seleccionada ? <IconCheck width={14} height={14} /> : <IconPlus width={14} height={14} />}
                      {h.nombre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Tus habilidades</h2>
            {habilidades.length === 0 ? (
              <p className="text-sm text-text-muted">Seleccioná habilidades del catálogo.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {habilidades.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-white/10"
                  >
                    <span className="text-sm font-medium text-text">{nombreHabilidad(h.id)}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={h.nivel}
                        onChange={(e) => cambiarNivel(h.id, e.target.value as NivelHabilidad)}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm capitalize text-slate-700 outline-none focus:border-fwd-azul dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-200"
                      >
                        {NIVELES.map((nivel) => (
                          <option key={nivel} value={nivel}>
                            {nivel}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => toggleHabilidad(h.id)}
                        aria-label={`Quitar ${nombreHabilidad(h.id)}`}
                        className="text-text-muted transition-colors hover:text-red-600"
                      >
                        <IconX width={18} height={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      )}

      {seccion === "portafolio" && (
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Proyectos completados (automáticos)
            </h2>
            {completados.length === 0 ? (
              <p className="text-sm text-text-muted">
                Tus proyectos completados aparecerán aquí con su calificación cuando un empresario te evalúe.
              </p>
            ) : (
              completados.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3"
                >
                  <span className="text-sm font-medium text-text">{p.titulo}</span>
                  <Badge variant="success">★ {p.calificacion}</Badge>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Proyectos manuales</h2>
            {proyectos.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-text">{p.titulo}</span>
                  {p.tecnologias && <span className="text-xs text-text-muted">{p.tecnologias}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => eliminarProyecto(p.id)}
                  className="text-sm font-medium text-red-600 transition-colors hover:text-red-500"
                >
                  Eliminar
                </button>
              </div>
            ))}

            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-white/15">
              <input
                type="text"
                placeholder="Título del proyecto"
                value={borrador.titulo}
                onChange={(e) => setBorrador((p) => ({ ...p, titulo: e.target.value }))}
                className={inputClass}
              />
              <textarea
                rows={2}
                placeholder="Descripción"
                value={borrador.descripcion}
                onChange={(e) => setBorrador((p) => ({ ...p, descripcion: e.target.value }))}
                className={textareaClass}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Tecnologías (separadas por coma)"
                  value={borrador.tecnologias}
                  onChange={(e) => setBorrador((p) => ({ ...p, tecnologias: e.target.value }))}
                  className={inputClass}
                />
                <input
                  type="date"
                  value={borrador.fecha}
                  onChange={(e) => setBorrador((p) => ({ ...p, fecha: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <input
                  type="url"
                  placeholder="Enlace al repositorio Git"
                  value={borrador.repoUrl}
                  onChange={(e) => {
                    setBorrador((p) => ({ ...p, repoUrl: e.target.value }));
                    setGitEstado("idle");
                  }}
                  onBlur={verificarGit}
                  className={`${inputClass} ${repoOk ? "" : "border-red-400 focus:border-red-400 focus:ring-red-400/20"}`}
                />
                {!repoOk ? (
                  <span className="text-xs text-red-600 dark:text-red-400">Ingresá una URL válida (http o https).</span>
                ) : gitEstado === "checking" ? (
                  <span className="text-xs text-text-muted">Verificando que el repo sea accesible…</span>
                ) : gitEstado === "ok" ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ El repositorio responde.</span>
                ) : gitEstado === "fail" ? (
                  <span className="text-xs text-red-600 dark:text-red-400">✗ El repositorio no responde o no existe.</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <input
                  type="url"
                  placeholder="Enlace a demo en vivo (opcional)"
                  value={borrador.demoUrl}
                  onChange={(e) => setBorrador((p) => ({ ...p, demoUrl: e.target.value }))}
                  className={`${inputClass} ${demoOk ? "" : "border-red-400 focus:border-red-400 focus:ring-red-400/20"}`}
                />
                {!demoOk && (
                  <span className="text-xs text-red-600 dark:text-red-400">Ingresá una URL válida (http o https).</span>
                )}
              </div>

              <button
                type="button"
                onClick={agregarProyecto}
                disabled={!puedeAgregar}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-fwd-azul px-5 text-sm font-semibold text-fwd-azul transition-colors hover:bg-fwd-azul/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconPlus width={16} height={16} />
                Agregar proyecto
              </button>
              <p className="text-xs text-text-muted">
                Los proyectos se guardan al presionar &ldquo;Guardar cambios&rdquo;.
              </p>
            </div>
          </div>
        </Card>
      )}

      {seccion === "curriculum" && <CvManager />}

      {seccion !== "curriculum" && (
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={guardar}
          disabled={guardado === "saving" || subiendoFoto}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-fwd-azul px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fwd-azul/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardado === "saving" ? "Guardando…" : "Guardar cambios"}
        </button>
        {guardado === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <IconCheck width={16} height={16} />
            Cambios guardados
          </span>
        )}
        {guardado === "error" && (
          <span className="text-sm font-medium text-red-600 dark:text-red-400">{errorGuardar}</span>
        )}
      </div>
      )}
    </div>
  );
}
