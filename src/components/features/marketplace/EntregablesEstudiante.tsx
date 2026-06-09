'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { Proyecto, Entregable, TipoEntregable } from '@/types';
import EstadoBadge from '@/components/ui/EstadoBadge';
import { validarArchivo, FORMATOS_PERMITIDOS, TAMANO_MAX_MB } from '@/lib/validacion';

export default function EntregablesEstudiante({
  proyecto,
  entregablesIniciales,
  estudianteId,
}: {
  proyecto: Proyecto;
  entregablesIniciales: Entregable[];
  estudianteId: string;
}) {
  const [entregables, setEntregables] = useState<Entregable[]>(entregablesIniciales);
  const [tipo, setTipo] = useState<TipoEntregable>('hito');
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const idRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);

    if (!titulo.trim()) {
      setError('Poné un título al entregable.');
      return;
    }
    if (!archivo) {
      setError('Adjuntá el archivo del entregable.');
      return;
    }
    const errArch = validarArchivo(archivo);
    if (errArch) {
      setError(errArch);
      return;
    }

    // Versión incremental: historial del mismo título.
    const versiones = entregables
      .filter((x) => x.titulo === titulo.trim())
      .map((x) => x.version);
    const version = versiones.length ? Math.max(...versiones) + 1 : 1;

    idRef.current += 1;
    const nuevo: Entregable = {
      id: `local-${idRef.current}`,
      proyectoId: proyecto.id,
      estudianteId,
      tipo,
      titulo: titulo.trim(),
      version,
      archivoNombre: archivo.name,
      estado: 'enviado',
      fecha: new Date().toISOString(),
    };

    // TODO Fase 5: subir el archivo y crear el entregable en Supabase.
    setEntregables((prev) => [...prev, nuevo]);
    setError(null);
    setOk(`Entregable «${nuevo.titulo}» enviado (versión ${version}).`);
    setTitulo('');
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  // Agrupar por título; cada grupo es el historial de versiones de ese entregable.
  const grupos = entregables.reduce<Record<string, Entregable[]>>((acc, e) => {
    (acc[e.titulo] ??= []).push(e);
    return acc;
  }, {});

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Proyecto activo</h1>
      <p className="text-slate-500 mb-6">{proyecto.titulo}</p>

      {/* Subir hito / entregable final */}
      <section className="rounded-xl border border-slate-300 bg-white p-6 mb-8">
        <h2 className="font-bold mb-4">Subir entregable</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label htmlFor="tipo" className="block text-sm font-semibold mb-1">
                Tipo
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoEntregable)}
                className="rounded-lg border border-slate-300 p-2.5"
              >
                <option value="hito">Hito</option>
                <option value="final">Entregable final</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="titulo" className="block text-sm font-semibold mb-1">
                Título
              </label>
              <input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Hito 1 — Estructura de datos"
                className="w-full rounded-lg border border-slate-300 p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Archivo</label>
            <input
              ref={fileRef}
              type="file"
              accept={FORMATOS_PERMITIDOS.join(',')}
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              {FORMATOS_PERMITIDOS.join(', ')} · máx. {TAMANO_MAX_MB} MB
            </p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {ok && <p className="text-green-700 text-sm">{ok}</p>}

          <button
            type="submit"
            className="bg-[#008FD4] text-white font-bold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all"
          >
            Enviar entregable
          </button>
        </form>
      </section>

      {/* Lista de entregables con historial de versiones */}
      <section className="space-y-6">
        <h2 className="font-bold">Entregables</h2>
        {Object.keys(grupos).length === 0 && (
          <p className="text-slate-500 text-sm">Todavía no subiste ningún entregable.</p>
        )}

        {Object.entries(grupos).map(([tituloGrupo, versiones]) => {
          const ordenadas = [...versiones].sort((a, b) => a.version - b.version);
          const ultima = ordenadas[ordenadas.length - 1]!;
          return (
            <div key={tituloGrupo} className="rounded-xl border border-slate-300 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">
                  {tituloGrupo}{' '}
                  <span className="text-xs text-slate-400 uppercase">({ultima.tipo})</span>
                </p>
                <EstadoBadge estado={ultima.estado} tipo="entregable" />
              </div>

              <ul className="space-y-2">
                {ordenadas.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between text-sm border-t border-slate-100 pt-2 first:border-0 first:pt-0"
                  >
                    <span className="text-slate-600">
                      Versión {e.version}
                      {e.archivoNombre ? ` · ${e.archivoNombre}` : ''}
                    </span>
                    <EstadoBadge estado={e.estado} tipo="entregable" />
                  </li>
                ))}
              </ul>

              {/* Si la última versión pidió cambios, mostrar el comentario del empresario */}
              {ultima.estado === 'cambios_solicitados' && ultima.comentarioEmpresario && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <span className="font-semibold">Cambios solicitados:</span>{' '}
                  {ultima.comentarioEmpresario}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* TODO Fase 6: Chat compartido con Persona 4 */}
      <section className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-400">
        Chat con el empresario (próximamente)
      </section>
    </main>
  );
}
