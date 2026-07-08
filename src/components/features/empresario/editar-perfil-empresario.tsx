'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { IconEdit, IconX, IconUpload, IconCheckCircle } from '@/components/ui/fwd-icons';

// CRUD "Editar perfil" del empresario: botón en el topbar que abre un modal para
// cambiar el nombre del empresario, el nombre de la empresa y la foto de perfil.
// La foto se sube con el endpoint existente (/api/upload/archivo, bucket
// 'prototipos') y se persiste como usuarios.image_url; el guardado va por
// PUT /api/empresario/perfil. Al guardar, refresca el RSC.
//
// El modal se renderiza con un portal hacia el contenedor .fwd-app (no dentro
// del topbar): el topbar tiene backdrop-filter, que lo convierte en containing
// block de los position:fixed y descolocaba el modal hacia arriba. Portalear a
// .fwd-app lo posiciona respecto al viewport y conserva las variables de marca.

const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FOTO_MB = 5;

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-sm)',
  padding: '11px 13px',
  fontSize: 14,
  color: 'var(--ink-900)',
  background: 'var(--surface)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-head)',
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--ink-800)',
};

export default function EditarPerfilEmpresario({
  nombreInicial,
  nombreEmpresaInicial,
  fotoUrlInicial,
  inicialesFallback,
  descripcionInicial,
  sectorInicial,
}: {
  nombreInicial: string;
  nombreEmpresaInicial: string;
  fotoUrlInicial: string | null;
  inicialesFallback: string;
  descripcionInicial: string | null;
  sectorInicial: string | null;
}) {
  const router = useRouter();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState(nombreInicial);
  const [nombreEmpresa, setNombreEmpresa] = useState(nombreEmpresaInicial);
  const [fotoUrl, setFotoUrl] = useState<string | null>(fotoUrlInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial ?? '');
  const [sector, setSector] = useState(sectorInicial ?? '');
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // El modal se monta dentro de .fwd-app (ver nota arriba).
  useEffect(() => {
    setHost(document.querySelector<HTMLElement>('.fwd-app'));
  }, []);

  function abrir() {
    setNombre(nombreInicial);
    setNombreEmpresa(nombreEmpresaInicial);
    setFotoUrl(fotoUrlInicial);
    setDescripcion(descripcionInicial ?? '');
    setSector(sectorInicial ?? '');
    setError('');
    setAbierto(true);
  }

  function cerrar() {
    if (guardando || subiendo) return;
    setAbierto(false);
  }

  async function procesarFoto(archivo: File | undefined) {
    setError('');
    if (!archivo) return;
    if (!TIPOS_FOTO.includes(archivo.type)) {
      setError('La foto debe ser JPG, PNG o WEBP.');
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      setError(`La foto no puede superar ${MAX_FOTO_MB} MB.`);
      return;
    }
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('archivo', archivo);
      fd.append('tipo', 'prototipo');
      const res = await fetch('/api/upload/archivo', { method: 'POST', body: fd });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? 'No se pudo subir la foto.');
        return;
      }
      setFotoUrl(data.url);
    } catch {
      setError('No se pudo subir la foto. Intentá de nuevo.');
    } finally {
      setSubiendo(false);
    }
  }

  async function guardar() {
    if (!nombre.trim()) {
      setError('El nombre del empresario es obligatorio.');
      return;
    }
    setError('');
    setGuardando(true);
    try {
      const res = await fetch('/api/empresario/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          nombreEmpresa,
          fotoUrl,
          descripcion: descripcion.trim() || null,
          sector: sector.trim() || null,
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? 'No se pudieron guardar los cambios.');
        return;
      }
      setAbierto(false);
      // Actualizar el Navbar sin recargar la página
      try {
        const perfilNavbar = { nombre: nombre.trim(), image_url: fotoUrl };
        localStorage.setItem('fwd_perfil', JSON.stringify(perfilNavbar));
        window.dispatchEvent(new CustomEvent('fwd:perfil:update', { detail: perfilNavbar }));
      } catch { /* sin storage */ }
      router.refresh();
    } catch {
      setError('Error de red. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar perfil de la empresa"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(12,27,51,.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: 20,
      }}
      onClick={cerrar}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--sh-lg)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid var(--line)',
            flexShrink: 0,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Editar perfil</h3>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={cerrar}
            style={{ color: 'var(--ink-400)', display: 'inline-flex' }}
          >
            <IconX size={18} />
          </button>
        </div>

        <div
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Foto de perfil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoUrl}
                  alt="Foto de perfil"
                  style={{ width: 72, height: 72, borderRadius: 18, objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="avatar"
                  style={{ width: 72, height: 72, background: 'var(--azul)', fontSize: 26, borderRadius: 18 }}
                >
                  {inicialesFallback}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: subiendo ? 'default' : 'pointer',
                  fontFamily: 'var(--font-head)',
                  fontWeight: 600,
                  fontSize: 13.5,
                  color: 'var(--azul-700)',
                  background: 'var(--azul-tint)',
                  padding: '9px 14px',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                <IconUpload size={16} />
                {subiendo ? 'Subiendo…' : fotoUrl ? 'Cambiar foto' : 'Subir foto'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={subiendo}
                  onChange={(e) => procesarFoto(e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
              </label>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>
                JPG, PNG o WEBP · máx {MAX_FOTO_MB} MB
              </div>
              {fotoUrl && (
                <button
                  type="button"
                  onClick={() => setFotoUrl(null)}
                  style={{ fontSize: 12, color: 'var(--magenta)', marginTop: 6, fontWeight: 600 }}
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          {/* Nombre del empresario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label htmlFor="nombre-empresario" style={labelStyle}>
              Nombre del empresario
            </label>
            <input
              id="nombre-empresario"
              type="text"
              value={nombre}
              maxLength={150}
              placeholder="Ej. Mariana Solís"
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Nombre de la empresa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label htmlFor="nombre-empresa" style={labelStyle}>
              Nombre de la empresa
            </label>
            <input
              id="nombre-empresa"
              type="text"
              value={nombreEmpresa}
              maxLength={200}
              placeholder="Ej. Pura Vida Logistics"
              onChange={(e) => setNombreEmpresa(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Sector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label htmlFor="sector-empresa" style={labelStyle}>
              Sector
            </label>
            <input
              id="sector-empresa"
              type="text"
              value={sector}
              maxLength={150}
              placeholder="Ej. Logística, Tecnología, Finanzas…"
              onChange={(e) => setSector(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Descripción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label htmlFor="descripcion-empresa" style={labelStyle}>
              Descripción de la empresa
            </label>
            <textarea
              id="descripcion-empresa"
              value={descripcion}
              maxLength={1000}
              rows={4}
              placeholder="Contá brevemente a qué se dedica tu empresa y qué tipo de proyectos buscás…"
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
            />
            <div style={{ fontSize: 11.5, color: 'var(--ink-400)', textAlign: 'right' }}>
              {descripcion.length}/1000
            </div>
          </div>

          {error && <p style={{ color: 'var(--magenta)', fontSize: 12.5, fontWeight: 500 }}>{error}</p>}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '16px 20px',
            borderTop: '1px solid var(--line)',
            background: 'var(--bg)',
            flexShrink: 0,
          }}
        >
          <button type="button" className="btn btn-ghost" onClick={cerrar} disabled={guardando}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={guardar}
            disabled={guardando || subiendo}
          >
            <IconCheckCircle size={16} />
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={abrir}>
        <IconEdit size={15} />
        Editar perfil
      </button>
      {abierto && host ? createPortal(modal, host) : null}
    </>
  );
}
