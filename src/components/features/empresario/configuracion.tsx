'use client';

import { useState } from 'react';
import {
  IconUsers,
  IconBell,
  IconEye,
  IconSettings,
  IconCheck,
  IconCheckCircle,
  IconAlert,
  IconUpload,
  IconX,
} from '@/components/ui/fwd-icons';

// "Configuración" del empresario (pantalla portada del prototipo FWD).
// Pantalla de preferencias: las pestañas Cuenta/Notificaciones/Privacidad/
// Seguridad son UI de demostración (toggles locales). No persiste todavía: el
// botón "Guardar" muestra un aviso, igual que el resto del panel. Los datos de
// identidad (nombre, empresa, correo, verificación) sí son reales.

type Props = {
  nombre: string;
  empresa: string;
  correo: string;
  verificado: boolean;
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-head)',
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--ink-800)',
};
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

function inicialesDe(nombre: string): string {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'E'
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        flexShrink: 0,
        border: 'none',
        background: on ? 'var(--azul)' : 'var(--ink-300)',
        position: 'relative',
        transition: 'background .18s',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .18s',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }}
      />
    </button>
  );
}

function CfgRow({
  titulo,
  desc,
  first,
  children,
}: {
  titulo: string;
  desc?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '15px 0',
        borderTop: first ? 'none' : '1px solid var(--line-2)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>
          {titulo}
        </div>
        {desc && (
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.45 }}>
            {desc}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function CfgCard({
  Icon,
  titulo,
  desc,
  children,
}: {
  Icon: typeof IconUsers;
  titulo: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', gap: 13, alignItems: 'center', marginBottom: 6 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: 'var(--azul-tint)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: 'var(--azul)',
          }}
        >
          <Icon size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{titulo}</h3>
          {desc && (
            <div className="muted" style={{ fontSize: 12.5 }}>
              {desc}
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

const TABS = [
  { id: 'cuenta', label: 'Cuenta', Icon: IconUsers },
  { id: 'notif', label: 'Notificaciones', Icon: IconBell },
  { id: 'priv', label: 'Privacidad', Icon: IconEye },
  { id: 'seg', label: 'Seguridad', Icon: IconSettings },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ConfiguracionEmpresario({ nombre, empresa, correo, verificado }: Props) {
  const [tab, setTab] = useState<TabId>('cuenta');
  const [notif, setNotif] = useState({
    ofertas: true,
    mensajes: true,
    hitos: true,
    marketing: false,
    resumen: true,
  });
  const [priv, setPriv] = useState({
    perfilPublico: true,
    mostrarRating: true,
    contactoDirecto: false,
  });
  const [idioma, setIdioma] = useState('Español (Costa Rica)');
  const [aviso, setAviso] = useState<string | null>(null);

  const tn = (k: keyof typeof notif) => setNotif((s) => ({ ...s, [k]: !s[k] }));
  const tp = (k: keyof typeof priv) => setPriv((s) => ({ ...s, [k]: !s[k] }));
  const guardar = () => setAviso('Tu configuración se actualizó.');

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="tb-title">Configuración</div>
          <div className="tb-sub">Administra tu cuenta y preferencias</div>
        </div>
        <div className="tb-spacer" />
        <button className="btn btn-primary" onClick={guardar}>
          <IconCheck size={16} />
          Guardar cambios
        </button>
      </div>

      <div className="page fade-in" style={{ maxWidth: 960 }}>
        {aviso && (
          <div
            className="card card-pad"
            style={{
              background: '#DEF5F6',
              borderColor: '#A7E3C2',
              color: '#0E7A80',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <span>
              <strong style={{ fontFamily: 'var(--font-head)' }}>Cambios guardados.</strong> {aviso}
            </span>
            <button onClick={() => setAviso(null)} aria-label="Cerrar" style={{ color: '#0E7A80', display: 'inline-flex' }}>
              <IconX size={16} />
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Pestañas laterales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'sticky', top: 20 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`nav-item ${tab === t.id ? 'on' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <t.Icon size={18} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tab === 'cuenta' && (
              <>
                <CfgCard Icon={IconUsers} titulo="Información de la cuenta" desc="Datos de tu empresa o emprendimiento">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 0 18px',
                      borderBottom: '1px solid var(--line-2)',
                      marginBottom: 6,
                    }}
                  >
                    <div
                      className="avatar"
                      style={{ width: 60, height: 60, background: 'var(--azul)', fontSize: 22 }}
                    >
                      {inicialesDe(empresa)}
                    </div>
                    <div>
                      <button className="btn btn-ghost btn-sm" type="button">
                        <IconUpload size={14} />
                        Cambiar foto
                      </button>
                      <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>
                        JPG o PNG · máx. 2 MB
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Campo label="Nombre de contacto">
                      <input style={inputStyle} defaultValue={nombre} />
                    </Campo>
                    <Campo label="Nombre de la empresa">
                      <input style={inputStyle} defaultValue={empresa} />
                    </Campo>
                    <Campo label="Correo electrónico">
                      <input style={inputStyle} defaultValue={correo} />
                    </Campo>
                    <Campo label="Teléfono">
                      <input style={inputStyle} placeholder="+506 0000 0000" />
                    </Campo>
                    <Campo label="Cédula jurídica">
                      <input style={inputStyle} placeholder="3-101-000000" />
                    </Campo>
                    <Campo label="Idioma">
                      <select
                        style={inputStyle}
                        value={idioma}
                        onChange={(e) => setIdioma(e.target.value)}
                      >
                        <option>Español (Costa Rica)</option>
                        <option>Español (Latinoamérica)</option>
                        <option>English</option>
                      </select>
                    </Campo>
                  </div>
                </CfgCard>

                {verificado && (
                  <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: '#DEF5F6',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        color: 'var(--turquesa)',
                      }}
                    >
                      <IconCheckCircle size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>
                        Empresa verificada por FWD
                      </div>
                      <div className="muted" style={{ fontSize: 12.5 }}>
                        Tu cuenta cuenta con el sello de verificación de la plataforma.
                      </div>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontFamily: 'var(--font-head)',
                        fontWeight: 700,
                        fontSize: 11,
                        padding: '3px 9px 3px 7px',
                        borderRadius: 'var(--r-pill)',
                        background: 'linear-gradient(120deg, var(--azul-tint), #DEF5F6)',
                        color: 'var(--azul-700)',
                      }}
                    >
                      <IconCheck size={12} />
                      Verificado
                    </span>
                  </div>
                )}
              </>
            )}

            {tab === 'notif' && (
              <CfgCard Icon={IconBell} titulo="Notificaciones" desc="Elige sobre qué quieres recibir avisos">
                <CfgRow
                  first
                  titulo="Nuevas ofertas recibidas"
                  desc="Cuando un estudiante envía una oferta a tus proyectos."
                >
                  <Toggle on={notif.ofertas} onClick={() => tn('ofertas')} />
                </CfgRow>
                <CfgRow titulo="Mensajes del proyecto" desc="Cuando recibes un mensaje en el chat de un proyecto.">
                  <Toggle on={notif.mensajes} onClick={() => tn('mensajes')} />
                </CfgRow>
                <CfgRow titulo="Entregables e hitos" desc="Cuando el estudiante sube un nuevo entregable.">
                  <Toggle on={notif.hitos} onClick={() => tn('hitos')} />
                </CfgRow>
                <CfgRow titulo="Resumen semanal" desc="Un correo con la actividad de tu cuenta cada lunes.">
                  <Toggle on={notif.resumen} onClick={() => tn('resumen')} />
                </CfgRow>
                <CfgRow titulo="Novedades y consejos" desc="Noticias de FWD, recursos y oportunidades.">
                  <Toggle on={notif.marketing} onClick={() => tn('marketing')} />
                </CfgRow>
              </CfgCard>
            )}

            {tab === 'priv' && (
              <CfgCard Icon={IconEye} titulo="Privacidad" desc="Controla qué se muestra de tu perfil">
                <CfgRow
                  first
                  titulo="Perfil público"
                  desc="Tu perfil de empresa es visible para los estudiantes."
                >
                  <Toggle on={priv.perfilPublico} onClick={() => tp('perfilPublico')} />
                </CfgRow>
                <CfgRow titulo="Mostrar mi reputación" desc="Tu calificación promedio aparece en tu perfil.">
                  <Toggle on={priv.mostrarRating} onClick={() => tp('mostrarRating')} />
                </CfgRow>
                <CfgRow titulo="Permitir contacto directo" desc="Otros usuarios pueden escribirte fuera de un proyecto.">
                  <Toggle on={priv.contactoDirecto} onClick={() => tp('contactoDirecto')} />
                </CfgRow>
              </CfgCard>
            )}

            {tab === 'seg' && (
              <>
                <CfgCard Icon={IconSettings} titulo="Seguridad" desc="Protege el acceso a tu cuenta">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 6 }}>
                    <Campo label="Contraseña actual">
                      <input style={inputStyle} type="password" placeholder="Tu contraseña actual" />
                    </Campo>
                    <div />
                    <Campo label="Nueva contraseña">
                      <input style={inputStyle} type="password" placeholder="Mínimo 8 caracteres" />
                    </Campo>
                    <Campo label="Confirmar contraseña">
                      <input style={inputStyle} type="password" placeholder="Repite la contraseña" />
                    </Campo>
                  </div>
                  <button className="btn btn-ghost btn-sm" type="button" style={{ marginTop: 6 }}>
                    Actualizar contraseña
                  </button>
                </CfgCard>

                <CfgCard Icon={IconCheckCircle} titulo="Verificación en dos pasos" desc="Añade una capa extra de seguridad">
                  <CfgRow first titulo="Activar 2FA" desc="Recibe un código por correo al iniciar sesión.">
                    <Toggle
                      on={false}
                      onClick={() => setAviso('Te enviaremos un código para configurar la verificación en dos pasos.')}
                    />
                  </CfgRow>
                </CfgCard>

                <div className="card card-pad" style={{ borderColor: '#F8CCE3' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: '#FCE3F1',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        color: 'var(--magenta)',
                      }}
                    >
                      <IconAlert size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>
                        Eliminar cuenta
                      </div>
                      <div className="muted" style={{ fontSize: 12.5 }}>
                        Esta acción es permanente y no se puede deshacer.
                      </div>
                    </div>
                    <button
                      className="btn btn-sm"
                      type="button"
                      style={{ background: '#FCE3F1', color: 'var(--magenta)' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
