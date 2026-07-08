'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import Swal from 'sweetalert2';
import type { DatosCompletitudDTO } from '@/server/services/perfil-empresario.service';

// Modal bloqueante "Completá tu perfil": sin cierre por backdrop, sin Escape, sin X.
// Se monta con portal dentro de .fwd-app para evitar que el backdrop-filter del
// topbar lo descoloque (mismo patrón que editar-perfil-empresario.tsx).

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-sm)',
  padding: '10px 13px',
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

const fieldWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 14,
};

export default function CompletarPerfilModal({ datos }: { datos: DatosCompletitudDTO }) {
  const router = useRouter();
  const [host, setHost] = useState<HTMLElement | null>(null);

  const [firstName,            setFirstName]            = useState(datos.firstName);
  const [lastName,             setLastName]             = useState(datos.lastName);
  const [segundoNombre,        setSegundoNombre]        = useState(datos.segundoNombre);
  const [segundoApellido,      setSegundoApellido]      = useState(datos.segundoApellido);
  const [edad,                 setEdad]                 = useState(datos.edad !== null ? String(datos.edad) : '');
  const [nombreEmpresa,        setNombreEmpresa]        = useState(datos.nombreEmpresa);
  const [cedulaJuridica,       setCedulaJuridica]       = useState(datos.cedulaJuridica);

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setHost(document.querySelector<HTMLElement>('.fwd-app'));
  }, []);

  async function mostrarError(texto: string) {
    await Swal.fire({
      imageUrl: '/imagenes/SweetalertsImagenes/FordyWarningRojo.jpeg',
      imageWidth: 200,
      imageHeight: 160,
      imageAlt: 'Error',
      title: 'Campos obligatorios incompletos',
      text: texto,
      showCloseButton: true,
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#dc2626',
      closeButtonAriaLabel: 'Cerrar',
      showClass: { popup: '', backdrop: 'swal2-backdrop-show' },
      hideClass: { popup: '', backdrop: 'swal2-backdrop-hide' },
      didOpen: (popup) => {
        const img = popup.querySelector<HTMLElement>('.swal2-image');
        if (img) {
          img.style.mixBlendMode = 'multiply';
          img.style.width = '200px';
          img.style.height = 'auto';
          img.style.marginTop = '24px';
          img.style.marginBottom = '0';
        }
        gsap.fromTo(
          popup,
          { opacity: 0, scale: 0.82, y: -18 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.7)' },
        );
      },
    });
  }

  async function guardar() {
    if (!firstName.trim() || !lastName.trim()) {
      await mostrarError('El nombre y el apellido son obligatorios para continuar.');
      return;
    }
    if (!edad || !nombreEmpresa.trim() || !cedulaJuridica.trim()) {
      await mostrarError(
        'Por favor completá todos los campos obligatorios: Edad, Nombre de empresa y Cédula jurídica.',
      );
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch('/api/empresario/completar-perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:            firstName.trim(),
          lastName:             lastName.trim(),
          segundoNombre:        segundoNombre.trim() || undefined,
          segundoApellido:      segundoApellido.trim() || undefined,
          edad:                 Number(edad),
          nombreEmpresa:        nombreEmpresa.trim(),
          cedulaJuridica:       cedulaJuridica.trim(),
        }),
      });

      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        await mostrarError(data.error ?? 'No se pudieron guardar los datos. Intentá de nuevo.');
        return;
      }

      router.refresh();
    } catch {
      await mostrarError('Error de red. Verificá tu conexión e intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Completá tu perfil"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(12,27,51,.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            padding: '20px 22px 16px',
            borderBottom: '1px solid var(--line)',
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Completá tu perfil</h2>
          <p style={{ marginTop: 5, fontSize: 13.5, color: 'var(--ink-500)' }}>
            Para publicar proyectos necesitamos algunos datos más. Los campos marcados con
            <span style={{ color: 'var(--magenta)', fontWeight: 700 }}> *</span> son obligatorios.
          </p>
        </div>

        {/* Cuerpo */}
        <div
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* Nombre / Apellido */}
          <div style={grid2}>
            <div style={fieldWrap}>
              <label style={labelStyle}>
                Nombre<span style={{ color: 'var(--magenta)' }}> *</span>
              </label>
              <input
                type="text"
                value={firstName}
                maxLength={50}
                placeholder="Ana"
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>
                Apellido<span style={{ color: 'var(--magenta)' }}> *</span>
              </label>
              <input
                type="text"
                value={lastName}
                maxLength={50}
                placeholder="Mora"
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Segundo nombre / Segundo apellido (opcionales) */}
          <div style={grid2}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Segundo nombre</label>
              <input
                type="text"
                value={segundoNombre}
                maxLength={50}
                placeholder="María (opcional)"
                onChange={(e) => setSegundoNombre(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Segundo apellido</label>
              <input
                type="text"
                value={segundoApellido}
                maxLength={50}
                placeholder="Quirós (opcional)"
                onChange={(e) => setSegundoApellido(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Correo (solo lectura) */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              value={datos.correo}
              readOnly
              style={{ ...inputStyle, background: 'var(--bg)', color: 'var(--ink-500)', cursor: 'default' }}
            />
          </div>

          {/* Edad (obligatorio) */}
          <div style={{ ...fieldWrap, maxWidth: 160 }}>
            <label style={labelStyle}>
              Edad<span style={{ color: 'var(--magenta)' }}> *</span>
            </label>
            <input
              type="number"
              value={edad}
              min={18}
              max={99}
              step={1}
              placeholder="Ej. 28"
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= 2) setEdad(v);
              }}
              style={inputStyle}
            />
          </div>

          {/* Nombre de empresa */}
          <div style={fieldWrap}>
            <label style={labelStyle}>
              Nombre de empresa<span style={{ color: 'var(--magenta)' }}> *</span>
            </label>
            <input
              type="text"
              value={nombreEmpresa}
              maxLength={200}
              placeholder="Ej. Pura Vida Logistics S.A."
              onChange={(e) => setNombreEmpresa(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Cédula jurídica */}
          <div style={fieldWrap}>
            <label style={labelStyle}>
              Cédula jurídica<span style={{ color: 'var(--magenta)' }}> *</span>
            </label>
            <input
              type="text"
              value={cedulaJuridica}
              maxLength={100}
              placeholder="Ej. 3-101-123456"
              onChange={(e) => setCedulaJuridica(e.target.value)}
              style={inputStyle}
            />
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '14px 22px',
            borderTop: '1px solid var(--line)',
            background: 'var(--bg)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={guardar}
            disabled={guardando}
            style={{ minWidth: 150 }}
          >
            {guardando ? 'Guardando…' : 'Guardar y continuar'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!host) return null;
  return createPortal(modal, host);
}
