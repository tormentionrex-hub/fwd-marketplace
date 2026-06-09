'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from '@/i18n/navigation';
import EstadoBadge from '@/components/ui/EstadoBadge';
import { validarArchivo, FORMATOS_PERMITIDOS, TAMANO_MAX_MB } from '@/lib/validacion';

// Tipos locales: el server pasa props planos (no @/types).
type EntregableVista = {
  id: string;
  tipo: string;
  version: number;
  archivoUrl: string;
  estado: string;
  comentarioEmpresario: string | null;
  creado: string;
};

type Props = {
  proyecto: { id: string; titulo: string };
  entregablesIniciales: EntregableVista[];
};

export default function EntregablesEstudiante({ proyecto, entregablesIniciales }: Props) {
  const router = useRouter();

  const [tipo, setTipo] = useState<'hito' | 'final'>('hito');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sube el archivo a Storage (mismo patrón que FormularioOferta).
  async function subirArchivo(file: File, tipoUpload: 'prototipo'): Promise<string> {
    const fd = new FormData();
    fd.append('archivo', file);
    fd.append('tipo', tipoUpload);
    const res = await fetch('/api/upload/archivo', { method: 'POST', body: fd });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? 'No se pudo subir el archivo');
    return data.url as string;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setError(null);

    if (!archivo) {
      setError('Adjuntá el archivo del entregable.');
      return;
    }
    const errArch = validarArchivo(archivo);
    if (errArch) {
      setError(errArch);
      return;
    }

    setLoading(true);
    try {
      const archivoUrl = await subirArchivo(archivo, 'prototipo');

      const res = await fetch('/api/entregables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idProyecto: proyecto.id, tipo, archivoUrl }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo enviar el entregable.');
        return;
      }

      setOk('Entregable enviado.');
      setArchivo(null);
      if (fileRef.current) fileRef.current.value = '';
      router.refresh(); // la lista la re-renderiza el server
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Agrupar por tipo (hito/final); cada grupo es el historial de versiones.
  const grupos = entregablesIniciales.reduce<Record<string, EntregableVista[]>>((acc, e) => {
    (acc[e.tipo] ??= []).push(e);
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
          <div>
            <label htmlFor="tipo" className="block text-sm font-semibold mb-1">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'hito' | 'final')}
              className="rounded-lg border border-slate-300 p-2.5"
            >
              <option value="hito">Hito</option>
              <option value="final">Entregable final</option>
            </select>
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
            disabled={loading}
            className="bg-[#008FD4] text-white font-bold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? 'Enviando…' : 'Enviar entregable'}
          </button>
        </form>
      </section>

      {/* Lista de entregables con historial de versiones */}
      <section className="space-y-6">
        <h2 className="font-bold">Entregables</h2>
        {Object.keys(grupos).length === 0 && (
          <p className="text-slate-500 text-sm">Todavía no subiste ningún entregable.</p>
        )}

        {Object.entries(grupos).map(([tipoGrupo, versiones]) => {
          const ordenadas = [...versiones].sort((a, b) => a.version - b.version);
          const ultima = ordenadas[ordenadas.length - 1]!;
          return (
            <div key={tipoGrupo} className="rounded-xl border border-slate-300 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">
                  {tipoGrupo === 'final' ? 'Entregable final' : 'Hito'}
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
                      {e.archivoUrl ? (
                        <>
                          {' · '}
                          <a
                            href={e.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#008FD4] font-semibold hover:underline"
                          >
                            Descargar
                          </a>
                        </>
                      ) : null}
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

      {/* TODO: Chat — Persona 4 */}
      <section className="mt-8 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-400">
        Chat con el empresario (próximamente)
      </section>
    </main>
  );
}
