"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";

export type UsuarioFila = {
  id: string;
  nombre: string;
  segundo_nombre: string | null;
  segundo_apellido: string | null;
  correo: string;
  rol: string;
  estado: string;
  edad: number | null;
  fecha_nacimiento: string | null;
  creado: string; // ISO
  ultima_sesion: string | null;
  image_url: string | null;
  perfiles_estudiante: {
    titulo_profesional: string | null;
    estado_verificacion: string | null;
    reputacion: number;
    generacion_fwd: number | null;
    descripcion: string | null;
    curriculums: {
      file_name: string;
      file_type: string;
      actualizado: string;
    } | null;
  } | null;
  perfiles_empresario: {
    tipo: string | null;
    sector: string | null;
    nombre_empresa: string | null;
    numero_identificacion: string | null;
    descripcion: string | null;
  } | null;
};

const colorRol: Record<string, string> = {
  estudiante: "bg-fwd-blue/15 text-fwd-blue",
  empresario: "bg-fwd-purple/20 text-fwd-purple",
  admin: "bg-fwd-magenta/15 text-fwd-magenta",
};

const TABS = [
  { key: "todos", label: "Todos" },
  { key: "estudiante", label: "Estudiantes" },
  { key: "empresario", label: "Empresarios" },
  { key: "admin", label: "Admins" },
] as const;

type SortKey = "nombre" | "correo" | "rol" | "estado" | "creado";
const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "nombre", label: "Nombre" },
  { key: "correo", label: "Correo" },
  { key: "rol", label: "Rol" },
  { key: "estado", label: "Estado" },
  { key: "creado", label: "Registrado" },
];

export function UsuariosTabla({
  usuarios,
  currentUserId,
}: {
  usuarios: UsuarioFila[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [rolFiltro, setRolFiltro] = useState<(typeof TABS)[number]["key"]>("todos");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "creado",
    dir: "desc",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal de detalle
  const [detalleModal, setDetalleModal] = useState<UsuarioFila | null>(null);
  const [cargandoCv, setCargandoCv] = useState<"ver" | "descargar" | null>(null);
  const [cvError, setCvError] = useState("");

  async function abrirCv(idUsuario: string, accion: "ver" | "descargar") {
    setCvError("");
    setCargandoCv(accion);
    try {
      const res = await fetch(`/api/admin/usuarios/${idUsuario}/cv?accion=${accion}`, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setCvError(data?.error ?? "No se pudo acceder al currículum.");
        return;
      }
      const { cv } = await res.json();
      const url = accion === "descargar" ? cv.downloadUrl : cv.viewUrl;
      if (url) {
        window.open(url, "_blank", "noopener");
      }
    } catch {
      setCvError("Error de red. Intentá de nuevo.");
    } finally {
      setCargandoCv(null);
    }
  }

  const visibles = useMemo(() => {
    const f = q.trim().toLowerCase();
    let lista = usuarios;
    if (rolFiltro !== "todos") lista = lista.filter((u) => u.rol === rolFiltro);
    if (f) {
      lista = lista.filter(
        (u) =>
          u.nombre.toLowerCase().includes(f) ||
          u.correo.toLowerCase().includes(f) ||
          u.rol.toLowerCase().includes(f)
      );
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...lista].sort((a, b) => {
      let cmp: number;
      if (sort.key === "creado") {
        cmp = new Date(a.creado).getTime() - new Date(b.creado).getTime();
      } else {
        cmp = a[sort.key].localeCompare(b[sort.key], "es");
      }
      return cmp * dir;
    });
  }, [usuarios, q, rolFiltro, sort]);

  function ordenarPor(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  async function eliminar(u: UsuarioFila) {
    if (!confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeletingId(u.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo eliminar el usuario.");
        return;
      }
      router.refresh(); // recarga la lista desde el servidor
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pestañas por rol */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const activo = rolFiltro === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setRolFiltro(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activo
                  ? "bg-fwd-magenta text-white shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Buscador + contador */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, correo o rol…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-fwd-blue focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/20 sm:max-w-xs"
        />
        <p className="text-sm text-white/50">
          {visibles.length} de {usuarios.length} usuario
          {usuarios.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-white/50">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => ordenarPor(c.key)}
                    className="inline-flex items-center gap-1 transition hover:text-white"
                  >
                    {c.label}
                    <span className="text-xs">
                      {sort.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                  {usuarios.length === 0
                    ? "Aún no hay usuarios registrados."
                    : "Ningún usuario coincide con el filtro."}
                </td>
              </tr>
            ) : (
              visibles.map((u) => {
                const esYo = u.id === currentUserId;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">
                      <button
                        type="button"
                        onClick={() => setDetalleModal(u)}
                        className="text-left font-semibold text-white hover:text-fwd-blue hover:underline transition-colors focus:outline-none"
                      >
                        {u.nombre}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-white/55">{u.correo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          colorRol[u.rol] ?? "bg-white/10 text-white/70"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-white/65">
                      {u.estado}
                    </td>
                    <td className="px-4 py-3 text-white/45">
                      {new Date(u.creado).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetalleModal(u)}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-fwd-blue transition hover:bg-fwd-blue/15"
                        >
                          Ver Detalle
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminar(u)}
                          disabled={esYo || deletingId === u.id}
                          title={esYo ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-fwd-magenta transition hover:bg-fwd-magenta/15 disabled:cursor-not-allowed disabled:text-white/25 disabled:hover:bg-transparent"
                        >
                          {deletingId === u.id ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Detalle de Usuario */}
      {detalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                {detalleModal.image_url ? (
                  <img
                    src={detalleModal.image_url}
                    alt={detalleModal.nombre}
                    className="h-14 w-14 rounded-full object-cover border-2 border-white/10"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fwd-blue/20 text-xl font-bold text-fwd-blue">
                    {detalleModal.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize mb-1 ${
                      colorRol[detalleModal.rol] ?? "bg-white/10 text-white/70"
                    }`}
                  >
                    {detalleModal.rol}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {[detalleModal.nombre, detalleModal.segundo_nombre, detalleModal.segundo_apellido]
                      .filter(Boolean)
                      .join(" ")}
                  </h3>
                  <p className="text-sm text-white/50">{detalleModal.correo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetalleModal(null)}
                className="text-white/40 hover:text-white transition-colors text-2xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Info personal */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Estado</h4>
                  <p className="mt-1 text-sm text-white font-medium capitalize">{detalleModal.estado}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Edad</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.edad ? `${detalleModal.edad} años` : "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Fecha de Nacimiento</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.fecha_nacimiento
                      ? new Date(detalleModal.fecha_nacimiento).toLocaleDateString("es-CR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Fecha de Registro</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {new Date(detalleModal.creado).toLocaleDateString("es-CR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Última Sesión</h4>
                  <p className="mt-1 text-sm text-white font-medium">
                    {detalleModal.ultima_sesion
                      ? new Date(detalleModal.ultima_sesion).toLocaleDateString("es-CR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Nunca"}
                  </p>
                </div>
              </div>

              {/* Perfil Estudiante */}
              {detalleModal.perfiles_estudiante && (
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-fwd-blue mb-3">Perfil Estudiante</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Título Profesional</h4>
                      <p className="mt-1 text-sm text-white font-medium">
                        {detalleModal.perfiles_estudiante.titulo_profesional || "—"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Generación FWD</h4>
                      <p className="mt-1 text-sm text-white font-medium">
                        {detalleModal.perfiles_estudiante.generacion_fwd ?? "—"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Reputación</h4>
                      <p className="mt-1 text-sm text-white font-medium">
                        {detalleModal.perfiles_estudiante.reputacion} pts
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Verificación</h4>
                      <p className="mt-1 text-sm text-white font-medium capitalize">
                        {detalleModal.perfiles_estudiante.estado_verificacion || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-white/5 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Currículum Profesional</h4>
                    {detalleModal.perfiles_estudiante.curriculums ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white truncate max-w-sm">
                            {detalleModal.perfiles_estudiante.curriculums.file_name}
                          </span>
                          <button
                            type="button"
                            onClick={() => abrirCv(detalleModal.id, "ver")}
                            disabled={cargandoCv !== null}
                            className="rounded-lg bg-fwd-blue/20 px-3 py-1.5 text-xs font-semibold text-fwd-blue hover:bg-fwd-blue/30 transition disabled:opacity-50"
                          >
                            {cargandoCv === "ver" ? "Abriendo…" : "Ver"}
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirCv(detalleModal.id, "descargar")}
                            disabled={cargandoCv !== null}
                            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition disabled:opacity-50"
                          >
                            {cargandoCv === "descargar" ? "Abriendo…" : "Descargar"}
                          </button>
                        </div>
                        {cvError && (
                          <p className="text-xs text-red-400 font-medium">{cvError}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-white/40 italic">No ha subido currículum</p>
                    )}
                  </div>
                  {detalleModal.perfiles_estudiante.descripcion && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Descripción</h4>
                      <p className="mt-1 text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        {detalleModal.perfiles_estudiante.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Perfil Empresario */}
              {detalleModal.perfiles_empresario && (
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-fwd-purple mb-3">Perfil Empresario</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Empresa</h4>
                      <p className="mt-1 text-sm text-white font-medium">
                        {detalleModal.perfiles_empresario.nombre_empresa || "—"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Tipo</h4>
                      <p className="mt-1 text-sm text-white font-medium capitalize">
                        {detalleModal.perfiles_empresario.tipo || "—"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Sector</h4>
                      <p className="mt-1 text-sm text-white font-medium">
                        {detalleModal.perfiles_empresario.sector || "—"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Identificación</h4>
                      <p className="mt-1 text-sm text-white font-medium">
                        {detalleModal.perfiles_empresario.numero_identificacion || "—"}
                      </p>
                    </div>
                  </div>
                  {detalleModal.perfiles_empresario.descripcion && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Descripción</h4>
                      <p className="mt-1 text-sm text-white/80 whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        {detalleModal.perfiles_empresario.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setDetalleModal(null)}
                className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
