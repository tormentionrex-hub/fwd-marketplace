import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { SinPermiso } from '@/components/layout/sin-permiso';
import Sidebar from '@/components/layout/Sidebar';
import { estadoCompletitudEmpresario } from '@/server/services/perfil-empresario.service';
import CompletarPerfilModal from '@/components/features/empresario/completar-perfil-modal';
import NotificacionesCampana from '@/components/features/empresario/notificaciones-campana';

// Design system FWD (portado del prototipo), scoped a .fwd-app para no tocar
// globals.css ni el layout global del Carril B. Variables, sidebar, topbar,
// cards, botones y badges con la paleta oficial FWD.
const FWD_CSS = `
  body:has(.fwd-app) { margin: 0; }

  .fwd-app {
    --azul:#008FD4; --morado:#662D91; --turquesa:#20BEC6; --amarillo:#FFCB05; --naranja:#F7901E; --magenta:#EC008C;
    --azul-700:#0469A0; --azul-600:#0A7DBE; --azul-tint:#E5F3FB; --azul-tint2:#D2EAF8;
    --ink-900:#0C1B33; --ink-800:#1B2C49; --ink-700:#344563; --ink-600:#4C5E7C; --ink-500:#6B7B96; --ink-400:#94A2B8; --ink-300:#C2CCDB;
    --line:#E4E9F1; --line-2:#EEF2F8; --surface:#FFFFFF; --bg:#F4F6FB; --bg-2:#EAEEF6;
    --r-sm:10px; --r:14px; --r-lg:18px; --r-pill:999px;
    --sh-sm:0 1px 2px rgba(12,27,51,.05), 0 1px 3px rgba(12,27,51,.04);
    --sh:0 2px 6px rgba(12,27,51,.05), 0 8px 24px rgba(12,27,51,.06);
    --sh-azul:0 6px 18px rgba(0,143,212,.28);
    --sidebar-w:264px;
    --font-head:'Figtree',system-ui,sans-serif; --font-body:'Outfit',system-ui,sans-serif;
    position:relative; display:grid; grid-template-columns:var(--sidebar-w) 1fr;
    transition:grid-template-columns 0.3s ease;
    height:100vh; overflow:hidden; font-family:var(--font-body); background:var(--bg); color:var(--ink-800);
  }
  .fwd-app h1,.fwd-app h2,.fwd-app h3,.fwd-app h4,.fwd-app h5 { font-family:var(--font-head); color:var(--ink-900); margin:0; letter-spacing:-.015em; }
  .fwd-app .font-display { font-family:var(--font-head); }
  .fwd-app p { margin:0; }
  .fwd-app button { font-family:inherit; cursor:pointer; }
  .fwd-app a { color:inherit; text-decoration:none; }
  .fwd-app input { font-family:inherit; }

  .fwd-strip { position:absolute; top:0; left:0; right:0; height:4px; z-index:50; display:flex; }
  .fwd-strip i { flex:1; }

  /* Sidebar */
  .fwd-app .sidebar { background:var(--surface); border-right:1px solid var(--line); display:flex; flex-direction:column; padding:26px 0 16px; gap:6px; position:relative; z-index:5; overflow-y:auto; }
  .fwd-app .sb-brand { display:flex; align-items:center; gap:11px; padding:4px 8px 18px; }
  .fwd-app .sb-section { font-family:var(--font-head); font-size:10.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--ink-400); padding:14px 12px 7px; }
  .fwd-app .nav-item { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:var(--r-sm); color:var(--ink-600); font-weight:500; font-size:14px; position:relative; transition:background .15s, color .15s; width:100%; text-align:left; }
  .fwd-app .nav-item:hover { background:var(--bg); color:var(--ink-800); }
  .fwd-app .nav-item.on { background:var(--azul-tint); color:var(--azul-700); font-weight:600; }
  .fwd-app .nav-item.on::before { content:''; position:absolute; left:-16px; top:50%; transform:translateY(-50%); width:4px; height:22px; border-radius:0 4px 4px 0; background:var(--azul); }
  .fwd-app .nav-item svg { flex-shrink:0; }
  .fwd-app .sb-foot { margin-top:auto; }
  .fwd-app .sb-user { display:flex; align-items:center; gap:11px; padding:10px; border-radius:var(--r-sm); border:1px solid var(--line); width:100%; }
  .fwd-app .sb-user .nm { font-family:var(--font-head); font-weight:600; font-size:13px; color:var(--ink-900); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .fwd-app .sb-user .rl { font-size:11.5px; color:var(--ink-400); }

  /* Main + topbar */
  .fwd-app .main { overflow-y:auto; position:relative; }
  .fwd-app .main::-webkit-scrollbar { width:11px; }
  .fwd-app .main::-webkit-scrollbar-thumb { background:var(--ink-300); border-radius:9px; border:3px solid var(--bg); }
  /* padding-right reserva el espacio de la campana fija del layout (40px + gap) */
  .fwd-app .topbar { position:sticky; top:0; z-index:4; background:rgba(244,246,251,.82); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); padding:16px 90px 16px 38px; display:flex; align-items:center; gap:18px; }
  /* Campana de notificaciones: anclada al shell (persiste entre páginas) */
  .fwd-app .tb-bell { position:absolute; top:16px; right:38px; z-index:30; }
  .fwd-app .tb-title { font-size:21px; font-weight:800; }
  .fwd-app .tb-sub { color:var(--ink-500); font-size:13.5px; margin-top:2px; }
  .fwd-app .tb-spacer { flex:1; }
  .fwd-app .tb-search { display:flex; align-items:center; gap:9px; background:var(--surface); border:1px solid var(--line); border-radius:var(--r-pill); padding:9px 16px; width:280px; color:var(--ink-400); font-size:13.5px; }
  .fwd-app .tb-search input { border:none; outline:none; flex:1; background:none; color:var(--ink-800); font-size:13.5px; }
  .fwd-app .tb-icon { width:40px; height:40px; border-radius:var(--r-pill); background:var(--surface); border:1px solid var(--line); display:grid; place-items:center; color:var(--ink-600); position:relative; transition:all .15s; }
  .fwd-app .tb-icon:hover { border-color:var(--ink-300); color:var(--ink-900); }
  .fwd-app .tb-icon .dot { position:absolute; top:9px; right:10px; width:8px; height:8px; border-radius:50%; background:var(--magenta); border:2px solid var(--surface); }

  .fwd-app .page { padding:30px 38px 60px; max-width:1180px; }

  /* Cards */
  .fwd-app .card { background:var(--surface); border:1px solid var(--line); border-radius:var(--r); box-shadow:var(--sh-sm); }
  .fwd-app .card-pad { padding:22px; }

  /* Buttons */
  .fwd-app .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:var(--font-head); font-weight:600; font-size:14px; padding:11px 18px; border-radius:var(--r-sm); transition:all .16s ease; white-space:nowrap; border:none; }
  .fwd-app .btn-primary { background:var(--azul); color:#fff; box-shadow:var(--sh-azul); }
  .fwd-app .btn-primary:hover { background:var(--azul-600); transform:translateY(-1px); }
  .fwd-app .btn-ghost { background:var(--surface); color:var(--ink-700); border:1px solid var(--line); }
  .fwd-app .btn-ghost:hover { border-color:var(--ink-300); color:var(--ink-900); background:var(--bg); }
  .fwd-app .btn-sm { padding:8px 13px; font-size:13px; }
  .fwd-app .btn-block { width:100%; }

  /* Badges de estado de proyecto */
  .fwd-app .badge { display:inline-flex; align-items:center; gap:6px; font-family:var(--font-head); white-space:nowrap; font-weight:600; font-size:12px; padding:4px 11px 4px 9px; border-radius:var(--r-pill); line-height:1.4; }
  .fwd-app .badge .bdot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .fwd-app .badge.borrador { background:var(--bg-2); color:var(--ink-500); }
  .fwd-app .badge.borrador .bdot { background:var(--ink-400); }
  .fwd-app .badge.publicado { background:var(--azul-tint); color:var(--azul-700); }
  .fwd-app .badge.publicado .bdot { background:var(--azul); }
  .fwd-app .badge.en_desarrollo { background:#FDEFDD; color:#B96400; }
  .fwd-app .badge.en_desarrollo .bdot { background:var(--naranja); }
  .fwd-app .badge.cerrado { background:#DEF5F6; color:#0E7A80; }
  .fwd-app .badge.cerrado .bdot { background:var(--turquesa); }
  .fwd-app .badge.abierto { background:var(--azul-tint); color:var(--azul-700); }
  .fwd-app .badge.abierto .bdot { background:var(--azul); }
  .fwd-app .badge.recepcion { background:var(--azul-tint); color:var(--azul-700); }
  .fwd-app .badge.recepcion .bdot { background:var(--azul); animation:fwdpulse 1.6s ease-in-out infinite; }
  @keyframes fwdpulse { 0%,100% { box-shadow:0 0 0 0 rgba(0,143,212,.5); } 50% { box-shadow:0 0 0 4px rgba(0,143,212,0); } }
  .fwd-app .badge.adjudicado { background:#F0E7F7; color:var(--morado); }
  .fwd-app .badge.adjudicado .bdot { background:var(--morado); }
  .fwd-app .badge.cancelado { background:#FCE3F1; color:#B40A6B; }
  .fwd-app .badge.cancelado .bdot { background:var(--magenta); }

  /* Filas de proyecto */
  .fwd-app .fwd-row { display:grid; grid-template-columns:1fr auto; gap:16px; align-items:center; padding:16px 20px; width:100%; text-align:left; border-top:1px solid var(--line); transition:background .14s; }
  .fwd-app .fwd-row:hover { background:var(--bg); }

  /* Feed de actividad (dashboard): cada item enlaza a la gestión del proyecto */
  .fwd-app .fwd-act { transition:color .14s; }
  .fwd-app .fwd-act:hover .fwd-act-t { color:var(--azul-700); }

  /* Notificación dentro del dropdown de la campana */
  .fwd-app .fwd-noti { transition:background .14s; }
  .fwd-app .fwd-noti:hover { background:var(--bg) !important; }

  /* Stat cards clickeables del dashboard (llevan a su vista filtrada) */
  .fwd-app .fwd-stat { transition:transform .14s, box-shadow .14s, border-color .14s; }
  .fwd-app .fwd-stat:hover { transform:translateY(-2px); box-shadow:var(--sh); border-color:var(--ink-300); }

  /* Misc */
  .fwd-app .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
  .fwd-app .muted { color:var(--ink-500); }
  .fwd-app .avatar { border-radius:50%; display:grid; place-items:center; color:#fff; font-family:var(--font-head); font-weight:700; flex-shrink:0; }
  .fwd-app .fade-in { animation:fwdfade .4s ease; }
  @keyframes fwdfade { from { transform:translateY(9px); opacity:.6; } to { transform:none; opacity:1; } }

  @media (max-width:1100px) {
    .fwd-app .stat-grid { grid-template-columns:repeat(2,1fr); }
  }
`;

// Layout del grupo empresario: monta el Sidebar FWD una sola vez junto a {children},
// de modo que las páginas 12 y 14 (y futuras) lo comparten sin repetir markup.
// Guard: requiere sesión y rol 'empresario' (sin sesión -> /login).
export default async function EmpresarioLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (user.roles.nombre !== 'empresario') {
    return <SinPermiso locale={locale} />;
  }

  const completitud = await estadoCompletitudEmpresario(user.id);

  return (
    <div className="fwd-app">
      <link
        href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: FWD_CSS }} />

      {/* Franja multicolor de marca FWD */}
      <div className="fwd-strip">
        {['#008FD4', '#662D91', '#20BEC6', '#FFCB05', '#F7901E', '#EC008C'].map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
      </div>

      <Sidebar nombre={user?.nombre ?? 'Empresario'} fotoUrl={user?.image_url ?? null} />
      <main className="main">{children}</main>

      {/* Campana persistente: vive en el shell, misma posición en todas las
          páginas del empresario y no se re-monta al navegar. */}
      <div className="tb-bell">
        <NotificacionesCampana />
      </div>

      {completitud && !completitud.completo && (
        <CompletarPerfilModal datos={completitud} />
      )}
    </div>
  );
}
