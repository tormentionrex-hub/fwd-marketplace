"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";
import { confirmarAccion, toastExito, alertaError } from "@/lib/sweetalert-admin";
import { useRouter } from "@/i18n/navigation";

// Roles disponibles para mostrar en el selector según el rol del admin actual.
// El backend re-valida permisos, este array solo controla lo visible en UI.
const ETIQUETA_ROL: Record<string, string> = {
  admin: "Administrador",
  staff: "Staff",
  moderator: "Moderador",
  estudiante: "Estudiante",
  empresario: "Empresario",
};

const COLOR_ROL: Record<string, string> = {
  owner: "bg-fwd-magenta/15 text-fwd-magenta border-fwd-magenta/25",
  admin: "bg-fwd-purple/15 text-fwd-purple border-fwd-purple/25",
  staff: "bg-fwd-blue/15 text-fwd-blue border-fwd-blue/25",
  moderator: "bg-fwd-teal/15 text-fwd-teal border-fwd-teal/25",
  estudiante: "bg-green-500/15 text-green-400 border-green-500/25",
  empresario: "bg-orange-500/15 text-orange-400 border-orange-500/25",
};

type UsuarioBuscado = {
  id: string;
  nombre: string;
  correo: string;
  estado: string;
  rol: string;
  idRol: string;
};

type Props = {
  rolActual: string; // Rol del admin logueado
};

function BadgeRol({ rol }: { rol: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        COLOR_ROL[rol] ?? "bg-white/10 text-white/60 border-white/10"
      }`}
    >
      {ETIQUETA_ROL[rol] ?? rol}
    </span>
  );
}

export function GestionRolesPanel({ rolActual }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [usuarios, setUsuarios] = useState<UsuarioBuscado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  // rol seleccionado por fila: { [id]: nuevoRol }
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  // estado de guardado por fila: { [id]: 'guardando' | 'ok' | 'error' }
  const [guardando, setGuardando] = useState<Record<string, "guardando" | "ok" | "error">>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Roles que este admin puede asignar
  const rolesAsignables =
    rolActual === "owner"
      ? ["admin", "staff", "moderator", "estudiante", "empresario"]
      : ["staff", "moderator", "estudiante", "empresario"];

  // Búsqueda con debounce de 400ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setUsuarios([]);
      setErrorBusqueda(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      setErrorBusqueda(null);
      try {
        const res = await fetch(
          `/api/admin/usuarios/buscar?q=${encodeURIComponent(q.trim())}`
        );
        const data = await res.json();
        if (!res.ok) {
          setErrorBusqueda(data.error ?? "Error al buscar.");
          setUsuarios([]);
        } else {
          setUsuarios(data.usuarios ?? []);
          // Inicializar selección con el rol actual de cada usuario
          setSeleccion((prev) => {
            const next = { ...prev };
            for (const u of data.usuarios ?? []) {
              if (!next[u.id]) next[u.id] = u.rol;
            }
            return next;
          });
        }
      } catch {
        setErrorBusqueda("No se pudo conectar al servidor.");
        setUsuarios([]);
      } finally {
        setBuscando(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  async function aplicarCambio(u: UsuarioBuscado) {
    const nuevoRol = seleccion[u.id];
    if (!nuevoRol || nuevoRol === u.rol) return;

    const ok = await confirmarAccion({
      titulo: `Cambiar rol de ${u.nombre}`,
      texto: `El rol actual es "${ETIQUETA_ROL[u.rol] ?? u.rol}". Se cambiará a "${ETIQUETA_ROL[nuevoRol] ?? nuevoRol}". ¿Confirmar?`,
      confirmText: "Cambiar rol",
      icon: "question",
    });
    if (!ok) return;

    setGuardando((prev) => ({ ...prev, [u.id]: "guardando" }));
    try {
      const res = await fetch(`/api/admin/usuarios/${u.id}/rol`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoRol }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alertaError(data?.error ?? "No se pudo cambiar el rol.");
        setGuardando((prev) => ({ ...prev, [u.id]: "error" }));
        return;
      }
      // Actualizar el rol en la lista local
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, rol: nuevoRol } : x))
      );
      setGuardando((prev) => ({ ...prev, [u.id]: "ok" }));
      toastExito(`Rol de ${u.nombre} actualizado a ${ETIQUETA_ROL[nuevoRol] ?? nuevoRol}.`);
      router.refresh();
      // Limpiar el check después de 2 s
      setTimeout(() => {
        setGuardando((prev) => {
          const next = { ...prev };
          delete next[u.id];
          return next;
        });
      }, 2000);
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
      setGuardando((prev) => ({ ...prev, [u.id]: "error" }));
    }
  }

  const sinCambios = (u: UsuarioBuscado) =>
    !seleccion[u.id] || seleccion[u.id] === u.rol;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      {/* Título */}
      <div className="mb-5 flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-fwd-blue" />
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Gestión de roles
          </h2>
          <p className="mt-0.5 text-sm text-white/50">
            Busca un usuario y cambia su rol.
            {rolActual !== "owner" && (
              <span className="ml-1 text-white/35">
                Solo el owner puede asignar el rol de administrador.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o correo (mín. 2 caracteres)…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-fwd-blue focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/20"
        />
        {buscando && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/40">
            Buscando…
          </span>
        )}
      </div>

      {/* Error de búsqueda */}
      {errorBusqueda && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorBusqueda}
        </div>
      )}

      {/* Estado vacío antes de buscar */}
      {!buscando && q.trim().length < 2 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <User className="h-8 w-8 text-white/15" />
          <p className="text-sm text-white/30">
            Escribe al menos 2 caracteres para buscar un usuario.
          </p>
        </div>
      )}

      {/* Sin resultados */}
      {!buscando && q.trim().length >= 2 && usuarios.length === 0 && !errorBusqueda && (
        <p className="py-8 text-center text-sm text-white/40">
          No se encontraron usuarios para &quot;{q}&quot;.
        </p>
      )}

      {/* Tabla de resultados */}
      {usuarios.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/45">
              <tr>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Rol actual</th>
                <th className="px-4 py-3 font-semibold">Nuevo rol</th>
                <th className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {usuarios.map((u) => {
                const estado = guardando[u.id];
                const esOwner = u.rol === "owner";
                const esAdminYNoSoyOwner =
                  u.rol === "admin" && rolActual !== "owner";
                const bloqueado = esOwner || esAdminYNoSoyOwner;

                return (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.03]">
                    {/* Usuario */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{u.nombre}</p>
                      <p className="text-xs text-white/40">{u.correo}</p>
                      {u.estado !== "activo" && (
                        <span className="mt-0.5 inline-block rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400">
                          {u.estado}
                        </span>
                      )}
                    </td>

                    {/* Rol actual */}
                    <td className="px-4 py-3">
                      <BadgeRol rol={u.rol} />
                    </td>

                    {/* Selector de nuevo rol */}
                    <td className="px-4 py-3">
                      {bloqueado ? (
                        <span className="text-xs text-white/30 italic">
                          {esOwner
                            ? "Rol protegido"
                            : "Requiere permiso de owner"}
                        </span>
                      ) : (
                        <select
                          value={seleccion[u.id] ?? u.rol}
                          onChange={(e) =>
                            setSeleccion((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                          disabled={estado === "guardando"}
                          style={{ colorScheme: "dark" }}
                          className="rounded-lg border border-white/10 bg-[#0f1c2e] px-3 py-1.5 text-sm text-white outline-none transition focus:border-fwd-blue focus:ring-2 focus:ring-fwd-blue/20 disabled:opacity-50"
                        >
                          {rolesAsignables.map((r) => (
                            <option
                              key={r}
                              value={r}
                              style={{ backgroundColor: "#0f1c2e", color: "#ffffff" }}
                            >
                              {ETIQUETA_ROL[r] ?? r}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Botón aplicar */}
                    <td className="px-4 py-3 text-right">
                      {estado === "ok" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          Guardado
                        </span>
                      ) : bloqueado ? null : (
                        <button
                          type="button"
                          onClick={() => aplicarCambio(u)}
                          disabled={
                            sinCambios(u) || estado === "guardando"
                          }
                          className="rounded-lg bg-fwd-blue px-3 py-1.5 text-xs font-bold text-white transition hover:bg-fwd-blue/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {estado === "guardando" ? "Guardando…" : "Aplicar"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
