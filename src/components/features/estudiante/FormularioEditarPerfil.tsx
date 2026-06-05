"use client";

import Link from "next/link";
import { useState } from "react";

// Formulario de edición de perfil y portafolio (Sefora · Página 09).
// Los cambios guardados se reflejan de inmediato en el Perfil público
// (Página 04). La persistencia real (Supabase + Cloudinary para la foto)
// se conectará en los puntos marcados con TODO.

type Nivel = "básico" | "intermedio" | "avanzado";

const CATALOGO_HABILIDADES = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "SQL",
  "Tailwind CSS",
];

const NIVELES: Nivel[] = ["básico", "intermedio", "avanzado"];

const MAX_FOTO_MB = 5;

// Valida el formato de una URL (no su accesibilidad).
function urlValida(valor: string) {
  if (!valor) return true; // Campo opcional
  try {
    new URL(valor);
    return true;
  } catch {
    return false;
  }
}

export default function FormularioEditarPerfil({ locale }: { locale: string }) {
  // --- DATOS PERSONALES ---
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [errorFoto, setErrorFoto] = useState<string>("");
  const [nombre, setNombre] = useState("Juan Pérez");
  const [correo, setCorreo] = useState("juan.perez@ejemplo.com");
  const [resumen, setResumen] = useState(
    "Desarrollador web full-stack egresado de FWD Costa Rica.",
  );

  // --- HABILIDADES ---
  const [habilidades, setHabilidades] = useState<
    { nombre: string; nivel: Nivel }[]
  >([
    { nombre: "React", nivel: "avanzado" },
    { nombre: "TypeScript", nivel: "intermedio" },
  ]);
  const [nuevaHabilidad, setNuevaHabilidad] = useState<string>("React");
  const [nuevoNivel, setNuevoNivel] = useState<Nivel>("básico");

  // --- PORTAFOLIO (proyectos agregados manualmente) ---
  const [proyectos, setProyectos] = useState<
    {
      titulo: string;
      descripcion: string;
      tecnologias: string;
      fecha: string;
      repoUrl: string;
      demoUrl: string;
    }[]
  >([]);
  const [borrador, setBorrador] = useState({
    titulo: "",
    descripcion: "",
    tecnologias: "",
    fecha: "",
    repoUrl: "",
    demoUrl: "",
  });

  const [guardado, setGuardado] = useState(false);

  // Proyectos completados dentro de la plataforma: se agregan automáticamente
  // con su calificación y no son editables aquí.
  const proyectosAutomaticos = [
    {
      titulo: "Tienda en línea para artesanos",
      calificacion: 5,
    },
  ];

  // --- Manejadores de foto ---
  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    setErrorFoto("");
    if (!archivo) return;

    if (!["image/jpeg", "image/png"].includes(archivo.type)) {
      setErrorFoto("La foto debe ser JPG o PNG.");
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      setErrorFoto(`La foto no puede superar ${MAX_FOTO_MB} MB.`);
      return;
    }
    // TODO: subir a Cloudinary y guardar la URL resultante.
    setFotoPreview(URL.createObjectURL(archivo));
  }

  // --- Manejadores de habilidades ---
  function agregarHabilidad() {
    if (habilidades.some((h) => h.nombre === nuevaHabilidad)) return;
    setHabilidades((prev) => [
      ...prev,
      { nombre: nuevaHabilidad, nivel: nuevoNivel },
    ]);
  }

  function eliminarHabilidad(nombre: string) {
    setHabilidades((prev) => prev.filter((h) => h.nombre !== nombre));
  }

  // --- Manejadores de portafolio ---
  const repoOk = urlValida(borrador.repoUrl);
  const demoOk = urlValida(borrador.demoUrl);
  const puedeAgregarProyecto =
    borrador.titulo.trim().length > 0 && repoOk && demoOk;

  function agregarProyecto() {
    if (!puedeAgregarProyecto) return;
    // TODO: validar que el repositorio Git sea accesible (chequeo en servidor).
    setProyectos((prev) => [...prev, borrador]);
    setBorrador({
      titulo: "",
      descripcion: "",
      tecnologias: "",
      fecha: "",
      repoUrl: "",
      demoUrl: "",
    });
  }

  function eliminarProyecto(indice: number) {
    setProyectos((prev) => prev.filter((_, i) => i !== indice));
  }

  // --- Guardar cambios ---
  function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    // TODO: persistir en Supabase. Al guardar, los cambios se reflejan
    // de inmediato en el perfil público.
    setGuardado(true);
  }

  const inputClass =
    "h-11 rounded-md border border-black/[.12] px-3 dark:border-white/[.18] dark:bg-transparent";

  return (
    <form onSubmit={handleGuardar} className="flex flex-col gap-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar perfil y portafolio
        </h1>
        <Link
          href={`/${locale}/perfil/juan-perez`}
          className="text-sm text-fwd-azul hover:underline"
        >
          Ver perfil público →
        </Link>
      </div>

      {/* ---------- DATOS PERSONALES ---------- */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">Datos personales</legend>

        {/* Foto de perfil */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-fwd-azul/10 text-sm text-fwd-azul">
            {fotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPreview}
                alt="Vista previa de la foto"
                className="h-full w-full object-cover"
              />
            ) : (
              "Sin foto"
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-fwd-azul px-4 py-2 text-sm font-medium text-fwd-azul transition-colors hover:bg-fwd-azul/5">
              Cambiar foto
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFoto}
                className="hidden"
              />
            </label>
            <span className="text-xs text-zinc-500">JPG o PNG · máx {MAX_FOTO_MB} MB</span>
            {errorFoto && (
              <span className="text-xs text-fwd-magenta">{errorFoto}</span>
            )}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Nombre completo
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Correo electrónico
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Resumen profesional
          <textarea
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            rows={4}
            className="rounded-md border border-black/[.12] px-3 py-2 dark:border-white/[.18] dark:bg-transparent"
          />
        </label>
      </fieldset>

      {/* ---------- HABILIDADES TÉCNICAS ---------- */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">
          Habilidades técnicas
        </legend>

        {/* Habilidades actuales */}
        <ul className="flex flex-wrap gap-2">
          {habilidades.map((hab) => (
            <li
              key={hab.nombre}
              className="inline-flex items-center gap-2 rounded-full border border-fwd-morado/40 bg-fwd-morado/5 px-3 py-1 text-sm text-fwd-morado"
            >
              {hab.nombre} · {hab.nivel}
              <button
                type="button"
                onClick={() => eliminarHabilidad(hab.nombre)}
                aria-label={`Eliminar ${hab.nombre}`}
                className="text-fwd-magenta hover:opacity-70"
              >
                ✕
              </button>
            </li>
          ))}
          {habilidades.length === 0 && (
            <li className="text-sm text-zinc-500">
              Aún no agregaste habilidades.
            </li>
          )}
        </ul>

        {/* Agregar habilidad desde el catálogo */}
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Habilidad
            <select
              value={nuevaHabilidad}
              onChange={(e) => setNuevaHabilidad(e.target.value)}
              className={inputClass}
            >
              {CATALOGO_HABILIDADES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Nivel
            <select
              value={nuevoNivel}
              onChange={(e) => setNuevoNivel(e.target.value as Nivel)}
              className={inputClass}
            >
              {NIVELES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={agregarHabilidad}
            className="h-11 rounded-full border border-fwd-azul px-5 text-sm font-medium text-fwd-azul transition-colors hover:bg-fwd-azul/5"
          >
            Agregar
          </button>
        </div>
      </fieldset>

      {/* ---------- PORTAFOLIO DE PROYECTOS ---------- */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-semibold">
          Portafolio de proyectos
        </legend>

        {/* Proyectos completados dentro de la plataforma (automáticos) */}
        {proyectosAutomaticos.map((p) => (
          <div
            key={p.titulo}
            className="flex items-center justify-between gap-3 rounded-lg border border-fwd-turquesa/30 bg-fwd-turquesa/5 px-4 py-3"
          >
            <span className="text-sm">
              {p.titulo}{" "}
              <span className="text-fwd-amarillo">
                {"★".repeat(p.calificacion)}
              </span>
            </span>
            <span className="text-xs text-zinc-500">
              Agregado automáticamente
            </span>
          </div>
        ))}

        {/* Proyectos agregados manualmente */}
        {proyectos.map((p, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 rounded-lg border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{p.titulo}</span>
              {p.tecnologias && (
                <span className="text-xs text-zinc-500">{p.tecnologias}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => eliminarProyecto(i)}
              className="text-sm text-fwd-magenta hover:opacity-70"
            >
              Eliminar
            </button>
          </div>
        ))}

        {/* Agregar proyecto manualmente */}
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-black/[.15] p-4 dark:border-white/[.18]">
          <input
            type="text"
            placeholder="Título del proyecto"
            value={borrador.titulo}
            onChange={(e) =>
              setBorrador((b) => ({ ...b, titulo: e.target.value }))
            }
            className={inputClass}
          />
          <textarea
            placeholder="Descripción"
            value={borrador.descripcion}
            onChange={(e) =>
              setBorrador((b) => ({ ...b, descripcion: e.target.value }))
            }
            rows={2}
            className="rounded-md border border-black/[.12] px-3 py-2 dark:border-white/[.18] dark:bg-transparent"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Tecnologías usadas (separadas por coma)"
              value={borrador.tecnologias}
              onChange={(e) =>
                setBorrador((b) => ({ ...b, tecnologias: e.target.value }))
              }
              className={inputClass}
            />
            <input
              type="date"
              value={borrador.fecha}
              onChange={(e) =>
                setBorrador((b) => ({ ...b, fecha: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          {/* Enlace a repositorio Git (se valida el formato; la accesibilidad
              se comprobará en el servidor) */}
          <input
            type="url"
            placeholder="Enlace al repositorio Git"
            value={borrador.repoUrl}
            onChange={(e) =>
              setBorrador((b) => ({ ...b, repoUrl: e.target.value }))
            }
            className={inputClass}
          />
          {!repoOk && (
            <span className="text-xs text-fwd-magenta">
              El enlace del repositorio no es una URL válida.
            </span>
          )}

          {/* Enlace a demo en vivo (se valida el formato de la URL) */}
          <input
            type="url"
            placeholder="Enlace a demo en vivo (opcional)"
            value={borrador.demoUrl}
            onChange={(e) =>
              setBorrador((b) => ({ ...b, demoUrl: e.target.value }))
            }
            className={inputClass}
          />
          {!demoOk && (
            <span className="text-xs text-fwd-magenta">
              El enlace de la demo no es una URL válida.
            </span>
          )}

          <button
            type="button"
            onClick={agregarProyecto}
            disabled={!puedeAgregarProyecto}
            className="h-11 rounded-full border border-fwd-azul px-5 text-sm font-medium text-fwd-azul transition-colors hover:bg-fwd-azul/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Agregar proyecto
          </button>
        </div>
      </fieldset>

      {/* ---------- GUARDAR ---------- */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="h-11 rounded-full bg-fwd-azul px-6 font-medium text-white transition-colors hover:opacity-90"
        >
          Guardar cambios
        </button>
        {guardado && (
          <span className="text-sm text-fwd-turquesa">
            ✓ Cambios guardados. Se reflejan en tu perfil público.
          </span>
        )}
      </div>
    </form>
  );
}
