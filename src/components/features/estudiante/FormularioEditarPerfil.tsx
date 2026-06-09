"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { IconCheck, IconPlus, IconUpload, IconX } from "@/components/ui/icons";
import type {
  Habilidad,
  NivelHabilidad,
  ProyectoPortafolio,
} from "@/types/sefora";

interface FormularioEditarPerfilProps {
  locale: string;
}

type Seccion = "datos" | "habilidades" | "portafolio";

interface BorradorProyecto {
  titulo: string;
  descripcion: string;
  tecnologias: string;
  fecha: string;
  repoUrl: string;
  demoUrl: string;
}

const CATALOGO_HABILIDADES: string[] = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "SQL",
  "Tailwind CSS",
  "Docker",
  "GraphQL",
];

const NIVELES: NivelHabilidad[] = ["básico", "intermedio", "avanzado"];

const MAX_FOTO_MB = 5;

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

const secciones: { id: Seccion; label: string }[] = [
  { id: "datos", label: "Datos personales" },
  { id: "habilidades", label: "Habilidades" },
  { id: "portafolio", label: "Portafolio" },
];

export default function FormularioEditarPerfil({
  locale,
}: FormularioEditarPerfilProps) {
  const [seccion, setSeccion] = useState<Seccion>("datos");

  const [fotoPreview, setFotoPreview] = useState("");
  const [errorFoto, setErrorFoto] = useState("");
  const [arrastrando, setArrastrando] = useState(false);

  const [nombre, setNombre] = useState("Juan Pérez");
  const [correo, setCorreo] = useState("juan.perez@ejemplo.com");
  const [resumen, setResumen] = useState(
    "Desarrollador web full-stack egresado de FWD Costa Rica.",
  );

  const [habilidades, setHabilidades] = useState<Habilidad[]>([
    { nombre: "React", nivel: "avanzado" },
    { nombre: "TypeScript", nivel: "intermedio" },
  ]);

  const [proyectos, setProyectos] = useState<ProyectoPortafolio[]>([]);
  const [borrador, setBorrador] = useState<BorradorProyecto>(borradorInicial);

  const [guardado, setGuardado] = useState(false);

  const proyectosAutomaticos: ProyectoPortafolio[] = [
    {
      id: "auto-1",
      titulo: "Tienda en línea para artesanos",
      tecnologias: ["Next.js", "Supabase"],
      calificacion: 5,
      automatico: true,
    },
  ];

  function procesarFoto(archivo: File | undefined) {
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
    setFotoPreview(URL.createObjectURL(archivo));
  }

  function toggleHabilidad(nombre: string) {
    setHabilidades((prev) =>
      prev.some((habilidad) => habilidad.nombre === nombre)
        ? prev.filter((habilidad) => habilidad.nombre !== nombre)
        : [...prev, { nombre, nivel: "básico" }],
    );
  }

  function cambiarNivel(nombre: string, nivel: NivelHabilidad) {
    setHabilidades((prev) =>
      prev.map((habilidad) =>
        habilidad.nombre === nombre ? { ...habilidad, nivel } : habilidad,
      ),
    );
  }

  const repoOk = urlValida(borrador.repoUrl);
  const demoOk = urlValida(borrador.demoUrl);
  const puedeAgregarProyecto =
    borrador.titulo.trim().length > 0 && repoOk && demoOk;

  function agregarProyecto() {
    if (!puedeAgregarProyecto) return;
    setProyectos((prev) => [
      ...prev,
      {
        id: `manual-${prev.length + 1}`,
        titulo: borrador.titulo,
        descripcion: borrador.descripcion,
        tecnologias: borrador.tecnologias
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
        fecha: borrador.fecha,
        repoUrl: borrador.repoUrl,
        demoUrl: borrador.demoUrl,
      },
    ]);
    setBorrador(borradorInicial);
  }

  function eliminarProyecto(id: string) {
    setProyectos((prev) => prev.filter((proyecto) => proyecto.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Editar perfil y portafolio
          </h1>
          <p className="text-sm text-text-muted">
            Los cambios se reflejan en tu perfil público.
          </p>
        </div>
        <Link
          href={`/${locale}/perfil/juan-perez`}
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
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(event) => {
              event.preventDefault();
              setArrastrando(false);
              procesarFoto(event.dataTransfer.files?.[0]);
            }}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              arrastrando
                ? "border-fwd-azul bg-fwd-azul/5"
                : "border-slate-300 hover:border-fwd-azul/50 dark:border-white/15"
            }`}
          >
            {fotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPreview}
                alt="Vista previa de la foto"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fwd-azul/10 text-fwd-azul">
                <IconUpload />
              </span>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-text">
                Arrastrá una imagen o hacé clic para subirla
              </span>
              <span className="text-xs text-text-muted">
                JPG o PNG · máx {MAX_FOTO_MB} MB
              </span>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => procesarFoto(event.target.files?.[0])}
              className="hidden"
            />
          </label>
          {errorFoto && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorFoto}</p>
          )}

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Nombre completo
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Correo electrónico
            <input
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
            Resumen profesional
            <textarea
              rows={4}
              value={resumen}
              onChange={(event) => setResumen(event.target.value)}
              className={textareaClass}
            />
          </label>
        </Card>
      )}

      {seccion === "habilidades" && (
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Catálogo
            </h2>
            <div className="flex flex-wrap gap-2">
              {CATALOGO_HABILIDADES.map((nombre) => {
                const seleccionada = habilidades.some(
                  (habilidad) => habilidad.nombre === nombre,
                );
                return (
                  <button
                    key={nombre}
                    type="button"
                    onClick={() => toggleHabilidad(nombre)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      seleccionada
                        ? "border-fwd-azul bg-fwd-azul/10 text-fwd-azul"
                        : "border-slate-200 text-slate-600 hover:border-fwd-azul/40 dark:border-white/15 dark:text-slate-300"
                    }`}
                  >
                    {seleccionada ? (
                      <IconCheck width={14} height={14} />
                    ) : (
                      <IconPlus width={14} height={14} />
                    )}
                    {nombre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Tus habilidades
            </h2>
            {habilidades.length === 0 ? (
              <p className="text-sm text-text-muted">
                Seleccioná habilidades del catálogo.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {habilidades.map((habilidad) => (
                  <li
                    key={habilidad.nombre}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-white/10"
                  >
                    <span className="text-sm font-medium text-text">
                      {habilidad.nombre}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={habilidad.nivel}
                        onChange={(event) =>
                          cambiarNivel(
                            habilidad.nombre,
                            event.target.value as NivelHabilidad,
                          )
                        }
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
                        onClick={() => toggleHabilidad(habilidad.nombre)}
                        aria-label={`Quitar ${habilidad.nombre}`}
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
          {proyectosAutomaticos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3"
            >
              <span className="text-sm font-medium text-text">
                {proyecto.titulo}
              </span>
              <Badge variant="success">Automático</Badge>
            </div>
          ))}

          {proyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-text">
                  {proyecto.titulo}
                </span>
                {proyecto.tecnologias.length > 0 && (
                  <span className="text-xs text-text-muted">
                    {proyecto.tecnologias.join(" · ")}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => eliminarProyecto(proyecto.id)}
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
              onChange={(event) =>
                setBorrador((prev) => ({ ...prev, titulo: event.target.value }))
              }
              className={inputClass}
            />
            <textarea
              rows={2}
              placeholder="Descripción"
              value={borrador.descripcion}
              onChange={(event) =>
                setBorrador((prev) => ({
                  ...prev,
                  descripcion: event.target.value,
                }))
              }
              className={textareaClass}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Tecnologías (separadas por coma)"
                value={borrador.tecnologias}
                onChange={(event) =>
                  setBorrador((prev) => ({
                    ...prev,
                    tecnologias: event.target.value,
                  }))
                }
                className={inputClass}
              />
              <input
                type="date"
                value={borrador.fecha}
                onChange={(event) =>
                  setBorrador((prev) => ({ ...prev, fecha: event.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="url"
                placeholder="Enlace al repositorio Git"
                value={borrador.repoUrl}
                onChange={(event) =>
                  setBorrador((prev) => ({
                    ...prev,
                    repoUrl: event.target.value,
                  }))
                }
                className={`${inputClass} ${
                  repoOk ? "" : "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                }`}
              />
              {!repoOk && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Ingresá una URL válida (http o https).
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="url"
                placeholder="Enlace a demo en vivo (opcional)"
                value={borrador.demoUrl}
                onChange={(event) =>
                  setBorrador((prev) => ({
                    ...prev,
                    demoUrl: event.target.value,
                  }))
                }
                className={`${inputClass} ${
                  demoOk ? "" : "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                }`}
              />
              {!demoOk && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Ingresá una URL válida (http o https).
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={agregarProyecto}
              disabled={!puedeAgregarProyecto}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-fwd-azul px-5 text-sm font-semibold text-fwd-azul transition-colors hover:bg-fwd-azul/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconPlus width={16} height={16} />
              Agregar proyecto
            </button>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setGuardado(true)}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-fwd-azul px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-fwd-azul/90"
        >
          Guardar cambios
        </button>
        {guardado && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <IconCheck width={16} height={16} />
            Cambios guardados
          </span>
        )}
      </div>
    </div>
  );
}
