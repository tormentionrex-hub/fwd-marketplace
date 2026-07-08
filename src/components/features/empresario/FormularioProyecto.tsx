'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus, IconX } from '@/components/ui/fwd-icons';
import { MODALIDADES_PROYECTO, MODALIDAD_LABEL } from '@/lib/empleabilidad';
import { simboloMoneda } from '@/lib/presupuesto';

interface Tecnologia {
  id: string;
  nombre: string;
}

interface ProyectoInicial {
  id: string;
  titulo: string;
  descripcion: string;
  areaNegocio: string | null;
  plazoDias: number | null;
  modalidad: string | null;
  usaIA: boolean;
  presupuestoMin: number | null;
  presupuestoMax: number | null;
  moneda: string;
  negociable: boolean;
  tecnologias: string[];
  imagenes: string[];
}

interface Props {
  tecnologiasDisponibles: Tecnologia[];
  modo: 'crear' | 'editar';
  proyecto?: ProyectoInicial;
}

export default function FormularioProyecto({ tecnologiasDisponibles, modo, proyecto }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(proyecto?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(proyecto?.descripcion ?? '');
  const [areaNegocio, setAreaNegocio] = useState(proyecto?.areaNegocio ?? '');
  const [plazoDias, setPlazoDias] = useState(proyecto?.plazoDias?.toString() ?? '');
  const [modalidad, setModalidad] = useState(proyecto?.modalidad ?? '');
  const [usaIA, setUsaIA] = useState(proyecto?.usaIA ?? false);
  const [moneda, setMoneda] = useState<'CRC' | 'USD'>(
    proyecto?.moneda === 'USD' ? 'USD' : 'CRC',
  );
  const [presupuestoMin, setPresupuestoMin] = useState(proyecto?.presupuestoMin?.toString() ?? '');
  const [presupuestoMax, setPresupuestoMax] = useState(proyecto?.presupuestoMax?.toString() ?? '');
  const [negociable, setNegociable] = useState(proyecto?.negociable ?? true);
  const [tecnosSeleccionadas, setTecnosSeleccionadas] = useState<string[]>(
    proyecto?.tecnologias ?? [],
  );
  const [tecnoCustom, setTecnoCustom] = useState('');
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [publicando, setPublicando] = useState(false);

  // Imagenes del proyecto
  const [imagenes, setImagenes] = useState<string[]>(proyecto?.imagenes ?? []);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const MAX_IMAGENES = 5;

  const toggleTecno = (nombre: string) => {
    setTecnosSeleccionadas((prev) =>
      prev.includes(nombre) ? prev.filter((t) => t !== nombre) : [...prev, nombre],
    );
  };

  const agregarCustom = () => {
    const v = tecnoCustom.trim();
    if (!v || tecnosSeleccionadas.includes(v)) return;
    setTecnosSeleccionadas((prev) => [...prev, v]);
    setTecnoCustom('');
  };

  const subirImagen = async (file: File) => {
    if (imagenes.length >= MAX_IMAGENES) {
      setErrorImagen(`Máximo ${MAX_IMAGENES} imágenes por proyecto`);
      return;
    }
    setErrorImagen(null);
    setSubiendoImagen(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const res = await fetch('/api/proyectos/imagenes', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorImagen(data.error ?? 'Error al subir la imagen');
      } else {
        setImagenes((prev) => [...prev, data.url!]);
      }
    } catch {
      setErrorImagen('Error de red al subir la imagen');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const onSeleccionArchivos = async (files: FileList | null) => {
    if (!files) return;
    const disponibles = MAX_IMAGENES - imagenes.length;
    const toUpload = Array.from(files).slice(0, disponibles);
    for (const file of toUpload) {
      await subirImagen(file);
    }
  };

  const eliminarImagen = (idx: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== idx));
  };

  const guardar = async (publicar: boolean) => {
    setMensajeError(null);

    const min = presupuestoMin ? Number(presupuestoMin) : null;
    const max = presupuestoMax ? Number(presupuestoMax) : null;

    // El presupuesto es OBLIGATORIO para publicar (se muestra en el marketplace).
    if (publicar) {
      if (min == null || max == null || min <= 0 || max <= 0) {
        setMensajeError('Para publicar debés indicar el presupuesto: mínimo y máximo.');
        return;
      }
    }
    if (min != null && max != null && min > max) {
      setMensajeError('El presupuesto mínimo no puede ser mayor al máximo.');
      return;
    }

    setPublicando(publicar);

    const body = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      areaNegocio: areaNegocio.trim() || null,
      plazoDias: plazoDias ? parseInt(plazoDias, 10) : null,
      modalidad: modalidad || null,
      usaIA,
      presupuestoMin: min,
      presupuestoMax: max,
      moneda,
      negociable,
      tecnologias: tecnosSeleccionadas,
      imagenes,
    };

    let res: Response;
    if (modo === 'crear') {
      res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`/api/proyectos/${proyecto!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };

    if (!res.ok) {
      setMensajeError(data.error ?? 'Error al guardar el proyecto');
      setPublicando(false);
      return;
    }

    if (publicar) {
      const idProyecto = modo === 'crear' ? (data.id ?? '') : proyecto!.id;
      const pubRes = await fetch(`/api/proyectos/${idProyecto}/publicar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!pubRes.ok) {
        const pubData = (await pubRes.json()) as { error?: string };
        setMensajeError(pubData.error ?? 'El proyecto se guardó pero no se pudo publicar');
        setPublicando(false);
        return;
      }
    }

    startTransition(() => {
      router.push('/empresario/proyectos');
      router.refresh();
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid var(--line)',
    background: 'var(--bg)',
    color: 'var(--ink-900)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.18s',
  } as React.CSSProperties;

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--ink-600)',
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {mensajeError && (
        <div
          style={{
            background: 'rgba(220,38,38,0.07)',
            border: '1.5px solid rgba(220,38,38,0.3)',
            borderRadius: 10,
            padding: '14px 18px',
            fontSize: 13.5,
            color: '#dc2626',
            fontWeight: 600,
          }}
        >
          {mensajeError}
        </div>
      )}

      {/* Titulo */}
      <div>
        <label style={labelStyle}>Titulo del proyecto *</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Desarrollo de app de logistica interna"
          maxLength={200}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
        />
        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4, textAlign: 'right' }}>
          {titulo.length}/200
        </div>
      </div>

      {/* Descripcion */}
      <div>
        <label style={labelStyle}>Descripcion *</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe el proyecto, los objetivos y el resultado esperado..."
          maxLength={5000}
          rows={6}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
        />
        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4, textAlign: 'right' }}>
          {descripcion.length}/5000
        </div>
      </div>

      {/* Fila: area + plazo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Area de negocio</label>
          <input
            type="text"
            value={areaNegocio}
            onChange={(e) => setAreaNegocio(e.target.value)}
            placeholder="Ej: Tecnologia, Marketing, Logistica..."
            maxLength={100}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Plazo (dias)</label>
          <input
            type="number"
            value={plazoDias}
            onChange={(e) => setPlazoDias(e.target.value)}
            placeholder="Ej: 30"
            min={1}
            max={365}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
          />
        </div>
      </div>

      {/* Modalidad del proyecto */}
      <div>
        <label style={labelStyle}>Modalidad</label>
        <select
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
        >
          <option value="">Sin especificar</option>
          {MODALIDADES_PROYECTO.map((m) => (
            <option key={m} value={m}>{MODALIDAD_LABEL[m]}</option>
          ))}
        </select>
      </div>

      {/* Presupuesto */}
      <div>
        <label style={labelStyle}>
          Presupuesto
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 8, color: 'var(--azul)' }}>
            (obligatorio para publicar)
          </span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 12 }}>
          <select
            value={moneda}
            onChange={(e) => setMoneda(e.target.value as 'CRC' | 'USD')}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
          >
            <option value="CRC">Colones (CRC)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
          <input
            type="number"
            value={presupuestoMin}
            onChange={(e) => setPresupuestoMin(e.target.value)}
            placeholder="Mínimo"
            min={0}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
          />
          <input
            type="number"
            value={presupuestoMax}
            onChange={(e) => setPresupuestoMax(e.target.value)}
            placeholder="Máximo"
            min={0}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 6 }}>
          Se mostrará en el marketplace como {simboloMoneda(moneda)}mínimo – {simboloMoneda(moneda)}máximo.
        </div>
      </div>

      {/* Negociable */}
      <div>
        <label style={labelStyle}>¿El presupuesto es negociable?</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setNegociable(true)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: `1.5px solid ${negociable ? '#16a34a' : 'var(--line)'}`,
              background: negociable ? 'rgba(22,163,74,0.1)' : 'var(--bg)',
              color: negociable ? '#16a34a' : 'var(--ink-600)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Negociable
          </button>
          <button
            type="button"
            onClick={() => setNegociable(false)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: `1.5px solid ${!negociable ? '#dc2626' : 'var(--line)'}`,
              background: !negociable ? 'rgba(220,38,38,0.1)' : 'var(--bg)',
              color: !negociable ? '#dc2626' : 'var(--ink-600)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            No negociable
          </button>
        </div>
      </div>

      {/* Toggle: Usa IA */}
      <div>
        <label style={labelStyle}>Uso de inteligencia artificial</label>
        <button
          type="button"
          onClick={() => setUsaIA((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            borderRadius: 10,
            border: `1px solid ${usaIA ? 'var(--azul)' : 'var(--line)'}`,
            background: usaIA ? 'rgba(0,143,212,0.08)' : 'var(--surface)',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          {/* Track del toggle */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            width: 40,
            height: 22,
            borderRadius: 11,
            background: usaIA ? 'var(--azul)' : 'var(--line)',
            transition: 'background 0.2s',
            flexShrink: 0,
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute',
              left: usaIA ? 20 : 2,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </span>
          <span>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)', display: 'block' }}>
              {usaIA ? 'El proyecto utiliza inteligencia artificial' : 'Desarrollo clasico (sin IA)'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>
              {usaIA
                ? 'Se mostrara la etiqueta "Incluye IA" en el marketplace'
                : 'Activa esta opcion si el proyecto involucra IA, LLMs o automatizacion inteligente'}
            </span>
          </span>
        </button>
      </div>

      {/* Imagenes del proyecto */}
      <div>
        <label style={labelStyle}>
          Imagenes del proyecto
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 8, color: 'var(--ink-400)' }}>
            (hasta {MAX_IMAGENES} — JPEG, PNG, WEBP, GIF · max 5 MB c/u)
          </span>
        </label>

        {/* Zona de drop */}
        {imagenes.length < MAX_IMAGENES && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void onSeleccionArchivos(e.dataTransfer.files);
            }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--azul)' : 'var(--line)'}`,
              borderRadius: 12,
              padding: '28px 20px',
              textAlign: 'center',
              cursor: subiendoImagen ? 'wait' : 'pointer',
              background: dragOver ? 'rgba(0,143,212,0.06)' : 'var(--bg)',
              transition: 'all 0.18s',
              opacity: subiendoImagen ? 0.7 : 1,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => void onSeleccionArchivos(e.target.files)}
            />
            {subiendoImagen ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--azul)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Subiendo imagen...</span>
              </div>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-400)" strokeWidth="1.5" style={{ margin: '0 auto 10px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 600, margin: 0 }}>
                  Haz clic o arrastra imagenes aquí
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-400)', margin: '4px 0 0' }}>
                  {imagenes.length}/{MAX_IMAGENES} subidas — La primera imagen sera la portada del proyecto
                </p>
              </>
            )}
          </div>
        )}

        {errorImagen && (
          <p style={{ fontSize: 12.5, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>
            {errorImagen}
          </p>
        )}

        {/* Previews */}
        {imagenes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 14 }}>
            {imagenes.map((url, idx) => (
              <div
                key={url}
                style={{
                  position: 'relative',
                  borderRadius: 10,
                  overflow: 'hidden',
                  aspectRatio: '16/9',
                  border: idx === 0 ? '2px solid var(--azul)' : '1.5px solid var(--line)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Imagen ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {idx === 0 && (
                  <span style={{
                    position: 'absolute', top: 4, left: 4,
                    background: 'var(--azul)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                    letterSpacing: '0.3px',
                  }}>
                    Portada
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => eliminarImagen(idx)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.65)', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <IconX size={11} />
                </button>
              </div>
            ))}
            {imagenes.length < MAX_IMAGENES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  borderRadius: 10, aspectRatio: '16/9',
                  border: '1.5px dashed var(--line)',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, color: 'var(--ink-400)',
                }}
              >
                <IconPlus size={18} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>Agregar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tecnologias */}
      <div>
        <label style={labelStyle}>Tecnologias requeridas</label>

        {tecnologiasDisponibles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {tecnologiasDisponibles.map((t) => {
              const seleccionada = tecnosSeleccionadas.includes(t.nombre);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTecno(t.nombre)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: seleccionada ? '1.5px solid var(--azul)' : '1.5px solid var(--line)',
                    background: seleccionada ? 'rgba(0,143,212,0.12)' : 'transparent',
                    color: seleccionada ? 'var(--azul)' : 'var(--ink-600)',
                    fontSize: 12.5,
                    fontWeight: seleccionada ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.nombre}
                </button>
              );
            })}
          </div>
        )}

        {/* Tecnologia personalizada */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={tecnoCustom}
            onChange={(e) => setTecnoCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarCustom(); } }}
            placeholder="Agregar otra tecnologia..."
            maxLength={80}
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--azul)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
          />
          <button
            type="button"
            onClick={agregarCustom}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: '1.5px solid var(--azul)',
              background: 'rgba(0,143,212,0.1)',
              color: 'var(--azul)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <IconPlus size={15} />
            Agregar
          </button>
        </div>

        {/* Chips de tecnologias seleccionadas no listadas */}
        {tecnosSeleccionadas.filter((t) => !tecnologiasDisponibles.find((d) => d.nombre === t)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {tecnosSeleccionadas
              .filter((t) => !tecnologiasDisponibles.find((d) => d.nombre === t))
              .map((nombre) => (
                <span
                  key={nombre}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    border: '1.5px solid var(--turquesa)',
                    background: 'rgba(32,190,198,0.1)',
                    color: 'var(--turquesa)',
                    fontSize: 12.5,
                    fontWeight: 600,
                  }}
                >
                  {nombre}
                  <button
                    type="button"
                    onClick={() => toggleTecno(nombre)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                  >
                    <IconX size={12} />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          paddingTop: 12,
          borderTop: '1px solid var(--line)',
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          disabled={pending}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: '1.5px solid var(--line)',
            background: 'transparent',
            color: 'var(--ink-600)',
            fontSize: 14,
            fontWeight: 600,
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.5 : 1,
          }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={() => guardar(false)}
          disabled={pending || !titulo.trim() || !descripcion.trim()}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: '1.5px solid var(--azul)',
            background: 'rgba(0,143,212,0.1)',
            color: 'var(--azul)',
            fontSize: 14,
            fontWeight: 700,
            cursor: (pending || !titulo.trim() || !descripcion.trim()) ? 'not-allowed' : 'pointer',
            opacity: (pending || !titulo.trim() || !descripcion.trim()) ? 0.5 : 1,
          }}
        >
          {pending && !publicando ? 'Guardando...' : 'Guardar borrador'}
        </button>

        <button
          type="button"
          onClick={() => guardar(true)}
          disabled={pending || !titulo.trim() || !descripcion.trim()}
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--azul)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: (pending || !titulo.trim() || !descripcion.trim()) ? 'not-allowed' : 'pointer',
            opacity: (pending || !titulo.trim() || !descripcion.trim()) ? 0.5 : 1,
          }}
        >
          {pending && publicando ? 'Publicando...' : 'Publicar ahora'}
        </button>
      </div>
    </div>
  );
}
