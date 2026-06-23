'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface ItemBase {
  id: number;
  nombre: string;
  activa: boolean;
}

interface HabilidadItem extends ItemBase {
  categoria: string | null;
}

interface CatalogosPanelProps {
  initialTecnologias: ItemBase[];
  initialHabilidades: HabilidadItem[];
  initialCategoriasNegocio: ItemBase[];
  staffSubRole: string;
}

type TabType = 'tecnologia' | 'categoria_negocio' | 'habilidad';

export function CatalogosPanel({
  initialTecnologias,
  initialHabilidades,
  initialCategoriasNegocio,
  staffSubRole,
}: CatalogosPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tecnologia');
  const [tecnologias, setTecnologias] = useState<ItemBase[]>(initialTecnologias);
  const [categoriasNegocio, setCategoriasNegocio] = useState<ItemBase[]>(initialCategoriasNegocio);
  const [habilidades, setHabilidades] = useState<HabilidadItem[]>(initialHabilidades);

  const [searchQuery, setSearchQuery] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [loadingAgregar, setLoadingAgregar] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingCategoria, setEditingCategoria] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  const esModerador = staffSubRole === 'moderador';

  // Filters items by tab and query
  const getFilteredItems = () => {
    const query = searchQuery.trim().toLowerCase();
    if (activeTab === 'tecnologia') {
      return query
        ? tecnologias.filter((t) => t.nombre.toLowerCase().includes(query))
        : tecnologias;
    } else if (activeTab === 'categoria_negocio') {
      return query
        ? categoriasNegocio.filter((c) => c.nombre.toLowerCase().includes(query))
        : categoriasNegocio;
    } else {
      return query
        ? habilidades.filter(
            (h) =>
              h.nombre.toLowerCase().includes(query) ||
              (h.categoria?.toLowerCase() || '').includes(query)
          )
        : habilidades;
    }
  };

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esModerador) return;

    const nombreTrim = nuevoNombre.trim();
    if (!nombreTrim) return;

    setLoadingAgregar(true);

    try {
      const res = await fetch('/api/admin/catalogos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: activeTab,
          nombre: nombreTrim,
          categoria: activeTab === 'habilidad' ? nuevaCategoria.trim() || null : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al agregar elemento');
      }

      const nuevoItem = {
        id: data.id,
        nombre: nombreTrim,
        activa: true,
        ...(activeTab === 'habilidad' && { categoria: nuevaCategoria.trim() || null }),
      };

      if (activeTab === 'tecnologia') {
        setTecnologias((prev) => [...prev, nuevoItem as ItemBase].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      } else if (activeTab === 'categoria_negocio') {
        setCategoriasNegocio((prev) => [...prev, nuevoItem as ItemBase].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      } else {
        setHabilidades((prev) => [...prev, nuevoItem as HabilidadItem].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      }

      setNuevoNombre('');
      setNuevaCategoria('');

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Elemento agregado correctamente',
        showConfirmButton: false,
        timer: 3000,
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un problema al guardar el elemento.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#008fd4',
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } finally {
      setLoadingAgregar(false);
    }
  };

  const handleToggleActiva = async (item: ItemBase | HabilidadItem) => {
    if (esModerador) return;

    const nuevaActiva = !item.activa;

    try {
      const res = await fetch('/api/admin/catalogos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: activeTab,
          id: item.id,
          nombre: item.nombre,
          activa: nuevaActiva,
          categoria: activeTab === 'habilidad' ? (item as HabilidadItem).categoria : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al cambiar estado');
      }

      const updateList = <T extends ItemBase>(list: T[]): T[] =>
        list.map((i) => (i.id === item.id ? { ...i, activa: nuevaActiva } : i));

      if (activeTab === 'tecnologia') {
        setTecnologias((prev) => updateList(prev));
      } else if (activeTab === 'categoria_negocio') {
        setCategoriasNegocio((prev) => updateList(prev));
      } else {
        setHabilidades((prev) => updateList(prev));
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: nuevaActiva ? 'Elemento activado' : 'Elemento desactivado',
        showConfirmButton: false,
        timer: 2000,
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cambiar el estado.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#008fd4',
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    }
  };

  const startEditing = (item: ItemBase | HabilidadItem) => {
    if (esModerador) return;
    setEditingId(item.id);
    setEditingNombre(item.nombre);
    if (activeTab === 'habilidad') {
      setEditingCategoria((item as HabilidadItem).categoria || '');
    }
  };

  const handleSaveEdit = async (item: ItemBase | HabilidadItem) => {
    if (esModerador) return;

    const nombreTrim = editingNombre.trim();
    if (!nombreTrim) return;

    setLoadingEdit(true);

    try {
      const res = await fetch('/api/admin/catalogos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: activeTab,
          id: item.id,
          nombre: nombreTrim,
          activa: item.activa,
          categoria: activeTab === 'habilidad' ? editingCategoria.trim() || null : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar elemento');
      }

      const updateList = <T extends ItemBase>(list: T[]): T[] =>
        list
          .map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  nombre: nombreTrim,
                  ...(activeTab === 'habilidad' && { categoria: editingCategoria.trim() || null }),
                }
              : i
          )
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

      if (activeTab === 'tecnologia') {
        setTecnologias((prev) => updateList(prev));
      } else if (activeTab === 'categoria_negocio') {
        setCategoriasNegocio((prev) => updateList(prev));
      } else {
        setHabilidades((prev) => updateList(prev));
      }

      setEditingId(null);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Elemento actualizado',
        showConfirmButton: false,
        timer: 2000,
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un problema al actualizar el elemento.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#008fd4',
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  const tabs = [
    { id: 'tecnologia', label: 'Tecnologías' },
    { id: 'categoria_negocio', label: 'Categorías de Negocio' },
    { id: 'habilidad', label: 'Habilidades' },
  ] as const;

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      {esModerador && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Acceso de Lectura:</span> Como moderador, podés ver los catálogos del sistema pero no tenés permisos para realizar modificaciones ni añadir nuevos elementos.
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-white/10 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
              setEditingId(null);
            }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-fwd-turquoise text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Formulario de Inserción (solo General Staff / Admin) */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              Añadir a {tabs.find((t) => t.id === activeTab)?.label}
            </h3>

            <form onSubmit={handleAgregar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  disabled={esModerador || loadingAgregar}
                  placeholder={`Ej. ${
                    activeTab === 'tecnologia'
                      ? 'React, PostgreSQL'
                      : activeTab === 'categoria_negocio'
                      ? 'Tecnologia, Educacion'
                      : 'Trabajo en equipo'
                  }`}
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white placeholder-white/30 focus:border-fwd-turquoise focus:outline-none disabled:opacity-50"
                  required
                />
              </div>

              {activeTab === 'habilidad' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                    Categoría (Opcional)
                  </label>
                  <input
                    type="text"
                    disabled={esModerador || loadingAgregar}
                    placeholder="Ej. Blandas, Tecnicas, Idiomas"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white placeholder-white/30 focus:border-fwd-turquoise focus:outline-none disabled:opacity-50"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={esModerador || !nuevoNombre.trim() || loadingAgregar}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-fwd px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-fwd-purple/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loadingAgregar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Añadir elemento
              </button>
            </form>
          </div>
        </div>

        {/* Tabla / Listado */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder={`Buscar en ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-fwd-turquoise focus:outline-none"
            />
          </div>

          {/* List Card */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Nombre</th>
                  {activeTab === 'habilidad' && <th className="px-5 py-3">Categoría</th>}
                  <th className="px-5 py-3 text-center">Estado</th>
                  {!esModerador && <th className="px-5 py-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white/80">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === 'habilidad' ? 5 : 4}
                      className="px-5 py-8 text-center text-white/40"
                    >
                      No se encontraron elementos registrados.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isEditing = editingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-white/[0.01] ${
                          !item.activa ? 'opacity-60 bg-white/[0.01]' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-white/40 tabular-nums">
                          {item.id}
                        </td>
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingNombre}
                              onChange={(e) => setEditingNombre(e.target.value)}
                              className="rounded border border-white/20 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
                              required
                            />
                          ) : (
                            <span className="font-medium text-white">{item.nombre}</span>
                          )}
                        </td>
                        {activeTab === 'habilidad' && (
                          <td className="px-5 py-3.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingCategoria}
                                onChange={(e) => setEditingCategoria(e.target.value)}
                                className="rounded border border-white/20 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
                              />
                            ) : (
                              <span className="text-xs text-white/50">
                                {(item as HabilidadItem).categoria || 'Sin categoria'}
                              </span>
                            )}
                          </td>
                        )}
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              item.activa
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {item.activa ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        {!esModerador && (
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(item)}
                                    disabled={loadingEdit || !editingNombre.trim()}
                                    className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="rounded p-1 text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditing(item)}
                                    className="rounded p-1 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleActiva(item)}
                                    className={`rounded p-1 transition-colors ${
                                      item.activa
                                        ? 'text-rose-400 hover:bg-rose-500/10'
                                        : 'text-emerald-400 hover:bg-emerald-500/10'
                                    }`}
                                    title={item.activa ? 'Desactivar elemento' : 'Activar elemento'}
                                  >
                                    {item.activa ? (
                                      <ToggleRight className="h-5 w-5" />
                                    ) : (
                                      <ToggleLeft className="h-5 w-5" />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
