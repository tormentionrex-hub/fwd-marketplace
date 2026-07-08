'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconPlus, IconX, IconFile } from '@/components/ui/fwd-icons';
import type { DocumentoVacante } from '@/types/vacante';
import { MODALIDADES_PROYECTO, MODALIDAD_LABEL } from '@/lib/empleabilidad';
import {
  TIPOS_EMPLEO,
  TIPO_EMPLEO_LABEL,
  NIVELES_EXPERIENCIA,
  NIVEL_LABEL,
  PERIODOS_SALARIO,
  PERIODO_SALARIO_LABEL,
} from '@/types/vacante';

interface Tecnologia {
  id: string;
  nombre: string;
}

export interface VacanteInicial {
  id: string;
  titulo: string;
  descripcion: string;
  area: string | null;
  modalidad: string | null;
  tipoEmpleo: string | null;
  nivelExperiencia: string | null;
  ubicacion: string | null;
  salarioMin: number | null;
  salarioMax: number | null;
  salarioMoneda: string;
  salarioPeriodo: string | null;
  salarioVisible: boolean;
  responsabilidades: string | null;
  requisitos: string | null;
  beneficios: string | null;
  plazas: number;
  fechaCierre: string | null;
  tecnologias: string[];
  imagenes: string[];
  documentos: DocumentoVacante[];
}

interface Props {
  tecnologiasDisponibles: Tecnologia[];
  modo: 'crear' | 'editar';
  vacante?: VacanteInicial;
}

const MONEDAS = ['CRC', 'USD'];
const MAX_IMAGENES = 3;
const MAX_DOCUMENTOS = 5;

export default function FormularioVacante({ tecnologiasDisponibles, modo, vacante }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(vacante?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(vacante?.descripcion ?? '');
  const [area, setArea] = useState(vacante?.area ?? '');
  const [modalidad, setModalidad] = useState(vacante?.modalidad ?? '');
  const [tipoEmpleo, setTipoEmpleo] = useState(vacante?.tipoEmpleo ?? '');
  const [nivel, setNivel] = useState(vacante?.nivelExperiencia ?? '');
  const [ubicacion, setUbicacion] = useState(vacante?.ubicacion ?? '');
  const [salarioMin, setSalarioMin] = useState(vacante?.salarioMin?.toString() ?? '');
  const [salarioMax, setSalarioMax] = useState(vacante?.salarioMax?.toString() ?? '');
  const [moneda, setMoneda] = useState(vacante?.salarioMoneda ?? 'CRC');
  const [periodo, setPeriodo] = useState(vacante?.salarioPeriodo ?? 'mensual');
  const [salarioVisible, setSalarioVisible] = useState(vacante?.salarioVisible ?? true);
  const [responsabilidades, setResponsabilidades] = useState(vacante?.responsabilidades ?? '');
  const [requisitos, setRequisitos] = useState(vacante?.requisitos ?? '');
  const [beneficios, setBeneficios] = useState(vacante?.beneficios ?? '');
  const [plazas, setPlazas] = useState(vacante?.plazas?.toString() ?? '1');
  const [fechaCierre, setFechaCierre] = useState(
    vacante?.fechaCierre ? vacante.fechaCierre.slice(0, 10) : '',
  );
  const [tecnosSeleccionadas, setTecnosSeleccionadas] = useState<string[]>(vacante?.tecnologias ?? []);
  const [tecnoCustom, setTecnoCustom] = useState('');

  const [imagenes, setImagenes] = useState<string[]>(vacante?.imagenes ?? []);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const docInputRef = useRef<HTMLInputElement>(null);
  const [documentos, setDocumentos] = useState<DocumentoVacante[]>(vacante?.documentos ?? []);
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [errorDoc, setErrorDoc] = useState<string | null>(null);

  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [publicando, setPublicando] = useState(false);

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
      setErrorImagen(`Máximo ${MAX_IMAGENES} imágenes por vacante`);
      return;
    }
    setErrorImagen(null);
    setSubiendoImagen(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const res = await fetch('/api/vacantes/imagenes', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) setErrorImagen(data.error ?? 'Error al subir la imagen');
      else setImagenes((prev) => [...prev, data.url!]);
    } catch {
      setErrorImagen('Error de red al subir la imagen');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const onSeleccionArchivos = async (files: FileList | null) => {
    if (!files) return;
    const disponibles = MAX_IMAGENES - imagenes.length;
    for (const file of Array.from(files).slice(0, disponibles)) await subirImagen(file);
  };

  const eliminarImagen = (idx: number) => setImagenes((prev) => prev.filter((_, i) => i !== idx));

  const subirDocumento = async (file: File) => {
    if (documentos.length >= MAX_DOCUMENTOS) {
      setErrorDoc(`Máximo ${MAX_DOCUMENTOS} documentos por vacante`);
      return;
    }
    setErrorDoc(null);
    setSubiendoDoc(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const res = await fetch('/api/vacantes/documentos', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; nombre?: string; error?: string };
      if (!res.ok || !data.url) setErrorDoc(data.error ?? 'Error al subir el documento');
      else setDocumentos((prev) => [...prev, { nombre: data.nombre ?? file.name, url: data.url! }]);
    } catch {
      setErrorDoc('Error de red al subir el documento');
    } finally {
      setSubiendoDoc(false);
    }
  };

  const onSeleccionDocs = async (files: FileList | null) => {
    if (!files) return;
    const disponibles = MAX_DOCUMENTOS - documentos.length;
    for (const file of Array.from(files).slice(0, disponibles)) await subirDocumento(file);
  };

  const eliminarDocumento = (idx: number) => setDocumentos((prev) => prev.filter((_, i) => i !== idx));

  const guardar = async (publicar: boolean) => {
    setMensajeError(null);
    setPublicando(publicar);

    const body = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      area: area.trim() || null,
      modalidad: modalidad || null,
      tipoEmpleo: tipoEmpleo || null,
      nivelExperiencia: nivel || null,
      ubicacion: ubicacion.trim() || null,
      salarioMin: salarioMin ? Number(salarioMin) : null,
      salarioMax: salarioMax ? Number(salarioMax) : null,
      salarioMoneda: moneda,
      salarioPeriodo: periodo || null,
      salarioVisible,
      responsabilidades: responsabilidades.trim() || null,
      requisitos: requisitos.trim() || null,
      beneficios: beneficios.trim() || null,
      plazas: plazas ? parseInt(plazas, 10) : 1,
      fechaCierre: fechaCierre ? new Date(fechaCierre).toISOString() : null,
      tecnologias: tecnosSeleccionadas,
      imagenes,
      documentos,
    };

    let res: Response;
    if (modo === 'crear') {
      res = await fetch('/api/vacantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`/api/vacantes/${vacante!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
    if (!res.ok) {
      setMensajeError(data.error ?? 'Error al guardar la vacante');
      setPublicando(false);
      return;
    }

    if (publicar) {
      const idVacante = modo === 'crear' ? (data.id ?? '') : vacante!.id;
      const pubRes = await fetch(`/api/vacantes/${idVacante}/publicar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!pubRes.ok) {
        const pubData = (await pubRes.json()) as { error?: string };
        setMensajeError(pubData.error ?? 'La vacante se guardó pero no se pudo publicar');
        setPublicando(false);
        return;
      }
    }

    startTransition(() => {
      router.push('/empresario/vacantes');
      router.refresh();
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid var(--line)', background: 'var(--bg)',
    color: 'var(--ink-900)', fontSize: 14, outline: 'none', transition: 'border-color 0.18s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--ink-600)',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px',
  };
  const focusOn = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--azul)'; };
  const focusOff = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.borderColor = 'var(--line)'; };

  const invalido = pending || !titulo.trim() || !descripcion.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {mensajeError && (
        <div style={{ background: 'rgba(220,38,38,0.07)', border: '1.5px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '14px 18px', fontSize: 13.5, color: '#dc2626', fontWeight: 600 }}>
          {mensajeError}
        </div>
      )}

      {/* Puesto */}
      <div>
        <label style={labelStyle}>Puesto / título de la vacante *</label>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Desarrollador Frontend React" maxLength={200}
          style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4, textAlign: 'right' }}>{titulo.length}/200</div>
      </div>

      {/* Descripción */}
      <div>
        <label style={labelStyle}>Descripción del puesto *</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe el rol, el equipo y el día a día del puesto..." maxLength={5000} rows={6}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={focusOn} onBlur={focusOff} />
        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4, textAlign: 'right' }}>{descripcion.length}/5000</div>
      </div>

      {/* Área + Ubicación */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Área / departamento</label>
          <input type="text" value={area} onChange={(e) => setArea(e.target.value)}
            placeholder="Ej: Tecnología, Marketing..." maxLength={150} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
        </div>
        <div>
          <label style={labelStyle}>Ubicación</label>
          <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: San José, Costa Rica" maxLength={200} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
        </div>
      </div>

      {/* Modalidad + Tipo + Nivel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Modalidad</label>
          <select value={modalidad} onChange={(e) => setModalidad(e.target.value)} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
            <option value="">Sin especificar</option>
            {MODALIDADES_PROYECTO.map((m) => <option key={m} value={m}>{MODALIDAD_LABEL[m]}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tipo de empleo</label>
          <select value={tipoEmpleo} onChange={(e) => setTipoEmpleo(e.target.value)} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
            <option value="">Sin especificar</option>
            {TIPOS_EMPLEO.map((t) => <option key={t} value={t}>{TIPO_EMPLEO_LABEL[t]}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Experiencia</label>
          <select value={nivel} onChange={(e) => setNivel(e.target.value)} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
            <option value="">Sin especificar</option>
            {NIVELES_EXPERIENCIA.map((n) => <option key={n} value={n}>{NIVEL_LABEL[n]}</option>)}
          </select>
        </div>
      </div>

      {/* Salario */}
      <div>
        <label style={labelStyle}>Salario</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr', gap: 12 }}>
          <input type="number" value={salarioMin} onChange={(e) => setSalarioMin(e.target.value)}
            placeholder="Mínimo" min={0} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
          <input type="number" value={salarioMax} onChange={(e) => setSalarioMax(e.target.value)}
            placeholder="Máximo" min={0} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
          <select value={moneda} onChange={(e) => setMoneda(e.target.value)} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
            {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
            {PERIODOS_SALARIO.map((p) => <option key={p} value={p}>{PERIODO_SALARIO_LABEL[p]}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => setSalarioVisible((v) => !v)}
          style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 10, border: `1px solid ${salarioVisible ? 'var(--azul)' : 'var(--line)'}`, background: salarioVisible ? 'rgba(0,143,212,0.08)' : 'var(--surface)', cursor: 'pointer', fontSize: 13, color: 'var(--ink-700)' }}>
          <span style={{ display: 'inline-flex', width: 36, height: 20, borderRadius: 10, background: salarioVisible ? 'var(--azul)' : 'var(--line)', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', left: salarioVisible ? 18 : 2, top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </span>
          {salarioVisible ? 'Mostrar el salario en el marketplace' : 'Salario oculto (a convenir)'}
        </button>
      </div>

      {/* Responsabilidades */}
      <div>
        <label style={labelStyle}>Responsabilidades</label>
        <textarea value={responsabilidades} onChange={(e) => setResponsabilidades(e.target.value)}
          placeholder="Enumerá las principales funciones del puesto..." maxLength={5000} rows={4}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={focusOn} onBlur={focusOff} />
      </div>

      {/* Requisitos */}
      <div>
        <label style={labelStyle}>Requisitos</label>
        <textarea value={requisitos} onChange={(e) => setRequisitos(e.target.value)}
          placeholder="Estudios, experiencia, habilidades requeridas..." maxLength={5000} rows={4}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={focusOn} onBlur={focusOff} />
      </div>

      {/* Beneficios */}
      <div>
        <label style={labelStyle}>Beneficios</label>
        <textarea value={beneficios} onChange={(e) => setBeneficios(e.target.value)}
          placeholder="Seguro, horario flexible, capacitaciones..." maxLength={5000} rows={4}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={focusOn} onBlur={focusOff} />
      </div>

      {/* Plazas + Fecha de cierre */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Cantidad de plazas</label>
          <input type="number" value={plazas} onChange={(e) => setPlazas(e.target.value)}
            min={1} max={1000} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
        </div>
        <div>
          <label style={labelStyle}>Fecha de cierre (opcional)</label>
          <input type="date" value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)}
            style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
        </div>
      </div>

      {/* Imágenes */}
      <div>
        <label style={labelStyle}>
          Imágenes (logo / portada)
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 8, color: 'var(--ink-400)' }}>
            (hasta {MAX_IMAGENES} — JPEG, PNG, WEBP, GIF · máx 5 MB c/u)
          </span>
        </label>
        {imagenes.length < MAX_IMAGENES && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); void onSeleccionArchivos(e.dataTransfer.files); }}
            style={{ border: `2px dashed ${dragOver ? 'var(--azul)' : 'var(--line)'}`, borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: subiendoImagen ? 'wait' : 'pointer', background: dragOver ? 'rgba(0,143,212,0.06)' : 'var(--bg)', transition: 'all 0.18s', opacity: subiendoImagen ? 0.7 : 1 }}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple style={{ display: 'none' }} onChange={(e) => void onSeleccionArchivos(e.target.files)} />
            {subiendoImagen ? (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--azul)' }}>Subiendo imagen...</span>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 600, margin: 0 }}>Haz clic o arrastra imágenes aquí</p>
            )}
          </div>
        )}
        {errorImagen && <p style={{ fontSize: 12.5, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>{errorImagen}</p>}
        {imagenes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 14 }}>
            {imagenes.map((url, idx) => (
              <div key={url} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', border: idx === 0 ? '2px solid var(--azul)' : '1.5px solid var(--line)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Imagen ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={() => eliminarImagen(idx)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <IconX size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentos adjuntos (PDF / Word / Excel) */}
      <div>
        <label style={labelStyle}>
          Documentos adjuntos
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 8, color: 'var(--ink-400)' }}>
            (hasta {MAX_DOCUMENTOS} — PDF, Word o Excel · máx 10 MB c/u. Ej: descripción ampliada, folleto de beneficios)
          </span>
        </label>
        {documentos.length < MAX_DOCUMENTOS && (
          <div
            onClick={() => docInputRef.current?.click()}
            style={{ border: '2px dashed var(--line)', borderRadius: 12, padding: '20px', textAlign: 'center', cursor: subiendoDoc ? 'wait' : 'pointer', background: 'var(--bg)', opacity: subiendoDoc ? 0.7 : 1 }}
          >
            <input
              ref={docInputRef}
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => void onSeleccionDocs(e.target.files)}
            />
            {subiendoDoc ? (
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--azul)' }}>Subiendo documento...</span>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 600, margin: 0 }}>Haz clic para adjuntar documentos</p>
            )}
          </div>
        )}
        {errorDoc && <p style={{ fontSize: 12.5, color: '#dc2626', marginTop: 6, fontWeight: 600 }}>{errorDoc}</p>}
        {documentos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            {documentos.map((doc, idx) => (
              <div key={doc.url} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--line)', background: 'var(--surface)' }}>
                <span style={{ color: 'var(--azul)', flexShrink: 0 }}><IconFile size={18} /></span>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.nombre}
                </a>
                <button type="button" onClick={() => eliminarDocumento(idx)} title="Quitar" style={{ width: 26, height: 26, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-500)', flexShrink: 0 }}>
                  <IconX size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tecnologías */}
      <div>
        <label style={labelStyle}>Tecnologías / habilidades requeridas</label>
        {tecnologiasDisponibles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {tecnologiasDisponibles.map((t) => {
              const sel = tecnosSeleccionadas.includes(t.nombre);
              return (
                <button key={t.id} type="button" onClick={() => toggleTecno(t.nombre)}
                  style={{ padding: '6px 14px', borderRadius: 20, border: sel ? '1.5px solid var(--azul)' : '1.5px solid var(--line)', background: sel ? 'rgba(0,143,212,0.12)' : 'transparent', color: sel ? 'var(--azul)' : 'var(--ink-600)', fontSize: 12.5, fontWeight: sel ? 700 : 500, cursor: 'pointer' }}>
                  {t.nombre}
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="text" value={tecnoCustom} onChange={(e) => setTecnoCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarCustom(); } }}
            placeholder="Agregar otra tecnología..." maxLength={80} style={{ ...inputStyle, flex: 1 }} onFocus={focusOn} onBlur={focusOff} />
          <button type="button" onClick={agregarCustom} style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid var(--azul)', background: 'rgba(0,143,212,0.1)', color: 'var(--azul)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <IconPlus size={15} /> Agregar
          </button>
        </div>
        {tecnosSeleccionadas.filter((t) => !tecnologiasDisponibles.find((d) => d.nombre === t)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {tecnosSeleccionadas.filter((t) => !tecnologiasDisponibles.find((d) => d.nombre === t)).map((nombre) => (
              <span key={nombre} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, border: '1.5px solid var(--turquesa)', background: 'rgba(32,190,198,0.1)', color: 'var(--turquesa)', fontSize: 12.5, fontWeight: 600 }}>
                {nombre}
                <button type="button" onClick={() => toggleTecno(nombre)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}>
                  <IconX size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
        <button type="button" onClick={() => router.back()} disabled={pending}
          style={{ padding: '12px 24px', borderRadius: 10, border: '1.5px solid var(--line)', background: 'transparent', color: 'var(--ink-600)', fontSize: 14, fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.5 : 1 }}>
          Cancelar
        </button>
        <button type="button" onClick={() => guardar(false)} disabled={invalido}
          style={{ padding: '12px 24px', borderRadius: 10, border: '1.5px solid var(--azul)', background: 'rgba(0,143,212,0.1)', color: 'var(--azul)', fontSize: 14, fontWeight: 700, cursor: invalido ? 'not-allowed' : 'pointer', opacity: invalido ? 0.5 : 1 }}>
          {pending && !publicando ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button type="button" onClick={() => guardar(true)} disabled={invalido}
          style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: 'var(--azul)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: invalido ? 'not-allowed' : 'pointer', opacity: invalido ? 0.5 : 1 }}>
          {pending && publicando ? 'Publicando...' : 'Publicar ahora'}
        </button>
      </div>
    </div>
  );
}
