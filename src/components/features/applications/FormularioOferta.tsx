'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // TODO: migrar a @/i18n/navigation cuando el Carril B esté mergeado
import type { Proyecto, Oferta } from '@/types';
import EstadoBadge from '@/components/ui/EstadoBadge';
import { validarArchivo, validarUrl, FORMATOS_PERMITIDOS, TAMANO_MAX_MB } from '@/lib/validacion';

export default function FormularioOferta({
  proyecto,
  ofertaExistente,
  locale,
}: {
  proyecto: Proyecto;
  ofertaExistente?: Oferta | undefined;
  locale: string;
}) {
  const router = useRouter();

  const [propuesta, setPropuesta] = useState('');
  const [url, setUrl] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errores, setErrores] = useState<{ propuesta?: string; prototipo?: string }>({});
  const [exito, setExito] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Estado local de la oferta existente (permite "retirar").
  const [estadoOferta, setEstadoOferta] = useState<Oferta['estado'] | undefined>(
    ofertaExistente?.estado,
  );

  const plazoVencido = new Date(proyecto.fechaLimite).getTime() < Date.now();
  const bloqueado = plazoVencido || proyecto.estado === 'cerrado';
  const tieneOfertaVigente = Boolean(ofertaExistente) && estadoOferta !== 'retirada';

  function handleRetirar() {
    // TODO Fase 5: reemplazar por update en Supabase
    setEstadoOferta('retirada');
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nuevos: { propuesta?: string; prototipo?: string } = {};

    if (!propuesta.trim()) {
      nuevos.propuesta = 'La propuesta no puede estar vacía.';
    }

    const tieneArchivo = archivo != null;
    const tieneUrl = url.trim().length > 0;
    if (!tieneArchivo && !tieneUrl) {
      nuevos.prototipo = 'Adjuntá un archivo o pegá la URL de tu prototipo.';
    } else if (tieneArchivo) {
      const err = validarArchivo(archivo);
      if (err) nuevos.prototipo = err;
    } else if (tieneUrl && !validarUrl(url.trim())) {
      nuevos.prototipo = 'La URL no es válida. Debe empezar con http:// o https://.';
    }

    if (Object.keys(nuevos).length > 0) {
      setErrores(nuevos);
      return;
    }

    setErrores({});
    // TODO Fase 5: enviar la oferta a Supabase (estado inicial "enviada")
    setExito(true);
    // Redirige al panel del estudiante.
    // TODO: confirmar ruta del dashboard estudiante (por ahora marketplace)
    router.push(`/${locale}/marketplace`);
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Enviar oferta</h1>
      <p className="text-slate-500 mb-6">{proyecto.titulo}</p>

      {exito ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-800">
          <p className="font-bold text-lg">¡Oferta enviada!</p>
          <p className="mt-1">Tu oferta quedó en estado «Enviada». Redirigiéndote a tu panel…</p>
        </div>
      ) : tieneOfertaVigente && ofertaExistente ? (
        // Regla 2: ya existe una oferta vigente -> no se permite una segunda.
        <div className="rounded-xl border border-slate-300 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold">Ya enviaste una oferta a este proyecto</p>
            <EstadoBadge estado={estadoOferta ?? ofertaExistente.estado} tipo="oferta" />
          </div>
          <p className="text-sm text-slate-600">{ofertaExistente.propuesta}</p>
          {ofertaExistente.prototipoUrl ? (
            <a
              href={ofertaExistente.prototipoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008FD4] font-semibold hover:underline text-sm"
            >
              Ver prototipo
            </a>
          ) : ofertaExistente.prototipoArchivoNombre ? (
            <p className="text-sm text-slate-500">Prototipo: {ofertaExistente.prototipoArchivoNombre}</p>
          ) : null}

          {/* Regla 7: retirar visible mientras la oferta NO esté adjudicada */}
          {estadoOferta !== 'adjudicada' && (
            <button
              onClick={handleRetirar}
              className="mt-2 px-4 py-2 rounded-lg border border-red-300 text-red-700 font-semibold hover:bg-red-50 transition-colors"
            >
              Retirar oferta
            </button>
          )}
        </div>
      ) : (
        <>
          {ofertaExistente && estadoOferta === 'retirada' && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 text-sm">
              Retiraste tu oferta anterior. Podés enviar una nueva.
            </div>
          )}

          {/* Regla 1: bloqueo por plazo vencido o proyecto cerrado */}
          {bloqueado && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              {plazoVencido
                ? 'El plazo para ofertar venció.'
                : 'Este proyecto está cerrado.'}{' '}
              No podés enviar una oferta.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset disabled={bloqueado} className="space-y-5 disabled:opacity-60">
              {/* Propuesta */}
              <div>
                <label htmlFor="propuesta" className="block font-semibold mb-1">
                  Tu propuesta
                </label>
                <textarea
                  id="propuesta"
                  value={propuesta}
                  onChange={(e) => setPropuesta(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#008FD4]/30"
                  placeholder="Contá cómo resolverías el proyecto…"
                />
                {errores.propuesta && (
                  <p className="text-red-600 text-sm mt-1">{errores.propuesta}</p>
                )}
              </div>

              {/* Prototipo: archivo O URL */}
              <div>
                <label className="block font-semibold mb-1">Prototipo</label>
                <p className="text-sm text-slate-500 mb-2">
                  Adjuntá un archivo ({FORMATOS_PERMITIDOS.join(', ')}, máx. {TAMANO_MAX_MB} MB) o pegá una URL.
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept={FORMATOS_PERMITIDOS.join(',')}
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm mb-3"
                />

                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://figma.com/tu-prototipo"
                  className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#008FD4]/30"
                />

                {errores.prototipo && (
                  <p className="text-red-600 text-sm mt-1">{errores.prototipo}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#008FD4] text-white font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all disabled:cursor-not-allowed"
              >
                Enviar oferta
              </button>
            </fieldset>
          </form>
        </>
      )}
    </main>
  );
}
