"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";

export type UsuarioFila = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
  creado: string; // ISO
};

const colorRol: Record<string, string> = {
  estudiante: "bg-fwd-blue/10 text-fwd-blue",
  empresario: "bg-fwd-purple/10 text-fwd-purple",
  admin: "bg-fwd-magenta/10 text-fwd-magenta",
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
                  ? "bg-fwd-blue text-white shadow-sm"
                  : "bg-fwd-mist/60 text-fwd-ink/70 hover:text-fwd-ink"
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
          className="w-full rounded-full border border-fwd-ink/12 bg-fwd-mist/40 px-4 py-2.5 text-sm text-fwd-ink outline-none transition placeholder:text-fwd-ink/35 focus:border-fwd-blue focus:bg-white focus:ring-4 focus:ring-fwd-blue/15 sm:max-w-xs"
        />
        <p className="text-sm text-fwd-ink/50">
          {visibles.length} de {usuarios.length} usuario
          {usuarios.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-fwd-ink/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-fwd-mist/70 text-fwd-ink/60">
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => ordenarPor(c.key)}
                    className="inline-flex items-center gap-1 transition hover:text-fwd-ink"
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
          <tbody className="divide-y divide-fwd-ink/8">
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-fwd-ink/40">
                  {usuarios.length === 0
                    ? "Aún no hay usuarios registrados."
                    : "Ningún usuario coincide con el filtro."}
                </td>
              </tr>
            ) : (
              visibles.map((u) => {
                const esYo = u.id === currentUserId;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-fwd-mist/40">
                    <td className="px-4 py-3 font-medium text-fwd-ink">
                      {u.nombre}
                    </td>
                    <td className="px-4 py-3 text-fwd-ink/60">{u.correo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          colorRol[u.rol] ?? "bg-fwd-ink/10 text-fwd-ink/70"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-fwd-ink/70">
                      {u.estado}
                    </td>
                    <td className="px-4 py-3 text-fwd-ink/50">
                      {new Date(u.creado).toLocaleDateString("es-CR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => eliminar(u)}
                        disabled={esYo || deletingId === u.id}
                        title={esYo ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-fwd-magenta transition hover:bg-fwd-magenta/10 disabled:cursor-not-allowed disabled:text-fwd-ink/25 disabled:hover:bg-transparent"
                      >
                        {deletingId === u.id ? "Eliminando…" : "Eliminar"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
