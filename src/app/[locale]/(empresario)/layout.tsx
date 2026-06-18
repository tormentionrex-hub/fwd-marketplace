import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { SinPermiso } from '@/components/layout/sin-permiso';
import Sidebar from '@/components/layout/Sidebar';
import { estadoCompletitudEmpresario } from '@/server/services/perfil-empresario.service';
import CompletarPerfilModal from '@/components/features/empresario/completar-perfil-modal';
import NotificacionesCampana from '@/components/features/empresario/notificaciones-campana';
import ThemeToggle from '@/components/layout/ThemeToggle';

// Design system FWD (portado del prototipo), scoped a .fwd-app para no tocar
// globals.css ni el layout global del Carril B. Variables, sidebar, topbar,
// cards, botones y badges con la paleta oficial FWD.
const FWD_CSS = `
  body:has(.fwd-app) { margin: 0; }

  /* Variables base (Light Mode Premium) */
  .fwd-app {
    --azul:#008FD4; --morado:#662D91; --turquesa:#20BEC6; --amarillo:#FFCB05; --naranja:#F7901E; --magenta:#EC008C;
    --azul-700:#0469A0; --azul-600:#0A7DBE; --azul-tint:#E5F3FB; --azul-tint2:#D2EAF8;
    --ink-900:#0C1B33; --ink-800:#1B2C49; --ink-700:#344563; --ink-600:#4C5E7C; --ink-500:#6B7B96; --ink-400:#94A2B8; --ink-300:#C2CCDB;
    --line:#E4E9F1; --line-2:#EEF2F8; --surface:#FFFFFF; --bg:#F4F6FB; --bg-2:#EAEEF6;
    --r-sm:10px; --r:14px; --r-lg:18px; --r-pill:999px;
    --sh-sm:0 2px 4px rgba(12,27,51,.04), 0 4px 12px rgba(12,27,51,.03);
    --sh:0 4px 12px rgba(12,27,51,.06), 0 12px 32px rgba(12,27,51,.05);
    --sh-azul:0 6px 18px rgba(0,143,212,.28);
    --sidebar-w:264px;
    --font-head:'Figtree',system-ui,sans-serif; --font-body:'Outfit',system-ui,sans-serif;
    position:relative; display:grid; grid-template-columns:var(--sidebar-w) 1fr;
    transition:grid-template-columns 0.3s ease;
    height:100vh; overflow:hidden; font-family:var(--font-body); background:var(--bg); color:var(--ink-800);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Variables Modo Oscuro Premium (Neon Glow & Glassmorphism con colores FWD) */
  html.dark .fwd-app {
    --azul:#008FD4; --morado:#662D91; --turquesa:#20BEC6; --amarillo:#FFCB05; --naranja:#F7901E; --magenta:#EC008C;
    --azul-700:#38BDF8; --azul-600:#0EA5E9; --azul-tint:rgba(0,143,212,0.15); --azul-tint2:rgba(0,143,212,0.25);
    --ink-900:#FFFFFF; --ink-800:#F4F6FB; --ink-700:#C2CCDB; --ink-600:#94A3B8; --ink-500:#64748B; --ink-400:#475569; --ink-300:#334155;
    --line:rgba(255,255,255,0.08); --line-2:rgba(255,255,255,0.04); 
    --surface:rgba(16, 23, 42, 0.55); --bg:#060913; --bg-2:#1E293B;
    --sh-sm: 0 4px 24px rgba(0,0,0,0.5);
    --sh: 0 8px 32px rgba(0,0,0,0.7);
    --sh-azul:0 0 20px rgba(0,143,212,0.5);
    --sh-magenta:0 0 24px rgba(236,0,140,0.5);
    --sh-turquesa:0 0 20px rgba(32,190,198,0.5);
    --sh-amarillo:0 0 20px rgba(255,203,5,0.4);
    --sh-naranja:0 0 20px rgba(247,144,30,0.5);
    --sh-morado:0 0 20px rgba(102,45,145,0.5);
  }

  .fwd-app h1,.fwd-app h2,.fwd-app h3,.fwd-app h4,.fwd-app h5 { font-family:var(--font-head); color:var(--ink-900); margin:0; letter-spacing:-.015em; transition: color 0.3s ease; }
  .fwd-app .font-display { font-family:var(--font-head); }
  .fwd-app p { margin:0; }
  .fwd-app button { font-family:inherit; cursor:pointer; }
  .fwd-app a { color:inherit; text-decoration:none; }
  .fwd-app input { font-family:inherit; }

  .fwd-strip { position:absolute; top:0; left:0; right:0; height:4px; z-index:50; display:flex; }
  .fwd-strip i { flex:1; }

  /* Sidebar */
  .fwd-app .sidebar { background:var(--surface); border-right:1px solid var(--line); display:flex; flex-direction:column; padding:26px 16px 16px; gap:6px; position:relative; z-index:5; overflow-y:auto; transition: background-color 0.3s ease, border-color 0.3s ease; }
  .fwd-app .sb-brand { display:flex; align-items:center; gap:11px; padding:4px 8px 18px; }
  .fwd-app .sb-section { font-family:var(--font-head); font-size:10.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--ink-400); padding:14px 12px 7px; }
  .fwd-app .nav-item { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:var(--r-sm); color:var(--ink-600); font-weight:500; font-size:14px; position:relative; transition:background .15s, color .15s, box-shadow .15s; width:100%; text-align:left; }
  .fwd-app .nav-item:hover { background:var(--bg); color:var(--ink-800); }
  .fwd-app .nav-item.on { 
    background: linear-gradient(100deg, rgba(0,143,212,0.12), rgba(102,45,145,0.08) 50%, rgba(236,0,140,0.05));
    color: var(--ink-900); 
    font-weight: 600; 
  }
  .fwd-app .nav-item.on::before { 
    content:''; 
    position:absolute; 
    left:-16px; 
    top:50%; 
    transform:translateY(-50%); 
    width:4px; 
    height:22px; 
    border-radius:0 4px 4px 0; 
    background: linear-gradient(to bottom, #008FD4, #662D91, #EC008C);
  }
  .fwd-app .nav-item.on svg { color: var(--azul); }
  
  html.dark .fwd-app .nav-item.on { 
    background: linear-gradient(100deg, rgba(0,143,212,0.2), rgba(102,45,145,0.15) 50%, rgba(236,0,140,0.1));
    color: #fff;
    box-shadow: inset 0 0 15px rgba(0,143,212,0.1); 
  }
  html.dark .fwd-app .nav-item.on::before { 
    box-shadow: 0 0 10px rgba(0,143,212,0.6); 
  }
  .fwd-app .nav-item svg { flex-shrink:0; }
  .fwd-app .sb-foot { margin-top:auto; }
  .fwd-app .sb-user { display:flex; align-items:center; gap:11px; padding:10px; border-radius:var(--r-sm); border:1px solid var(--line); width:100%; transition: border-color 0.3s ease; }
  .fwd-app .sb-user .nm { font-family:var(--font-head); font-weight:600; font-size:13px; color:var(--ink-900); line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition: color 0.3s ease; }
  .fwd-app .sb-user .rl { font-size:11.5px; color:var(--ink-400); transition: color 0.3s ease; }

  /* Main + topbar */
  .fwd-app .main { overflow-y:auto; position:relative; }
  .fwd-app .main::-webkit-scrollbar { width:11px; }
  .fwd-app .main::-webkit-scrollbar-thumb { background:var(--ink-300); border-radius:9px; border:3px solid var(--bg); }
  /* padding-right reserva el espacio de la campana y botones fijos del layout (aprox 150px) */
  .fwd-app .topbar { position:sticky; top:0; z-index:4; background:rgba(244,246,251,.82); backdrop-filter:blur(12px); border-bottom:1px solid var(--line); padding:16px 150px 16px 38px; display:flex; align-items:center; gap:18px; transition: background-color 0.3s ease, border-color 0.3s ease; }
  html.dark .fwd-app .topbar { background:rgba(10,15,28,.7); }
  
  /* Botones fijos: anclados al shell (persisten entre páginas) */
  .fwd-app .tb-actions { position:absolute; top:16px; right:38px; z-index:30; display: flex; gap: 10px; }
  .fwd-app .tb-title { font-size:21px; font-weight:800; }
  .fwd-app .tb-sub { color:var(--ink-500); font-size:13.5px; margin-top:2px; }
  .fwd-app .tb-spacer { flex:1; }
  .fwd-app .tb-search { display:flex; align-items:center; gap:9px; background:var(--surface); border:1px solid var(--line); border-radius:var(--r-pill); padding:9px 16px; width:280px; color:var(--ink-400); font-size:13.5px; transition: background-color 0.3s ease, border-color 0.3s ease; }
  .fwd-app .tb-search input { border:none; outline:none; flex:1; background:none; color:var(--ink-800); font-size:13.5px; }
  .fwd-app .tb-icon { width:40px; height:40px; border-radius:var(--r-pill); background:var(--surface); border:1px solid var(--line); display:grid; place-items:center; color:var(--ink-600); position:relative; transition:all .15s; }
  .fwd-app .tb-icon:hover { border-color:var(--ink-300); color:var(--ink-900); }
  html.dark .fwd-app .tb-icon:hover { box-shadow: 0 0 15px rgba(255,255,255,0.1); }
  .fwd-app .tb-icon .dot { position:absolute; top:9px; right:10px; width:8px; height:8px; border-radius:50%; background:var(--magenta); border:2px solid var(--surface); }
  html.dark .fwd-app .tb-icon .dot { box-shadow: 0 0 10px var(--magenta); }

  .fwd-app .page { padding:30px 38px 60px; max-width:1180px; margin:0 auto; }
  
  /* Scrollbar personalizado para el panel lateral */
  .fwd-app .panel-scroll::-webkit-scrollbar { width: 14px; }
  .fwd-app .panel-scroll::-webkit-scrollbar-thumb { background: var(--ink-300); border: 4px solid transparent; background-clip: padding-box; border-radius: 9999px; }
  .fwd-app .panel-scroll::-webkit-scrollbar-track { background: transparent; }

  /* Cards */
  .fwd-app .card { background:var(--surface); border:1px solid var(--line); border-radius:var(--r); box-shadow:var(--sh-sm); transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; position:relative; overflow:hidden; }
  html.dark .fwd-app .card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(255,255,255,0.12); border-left: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03); }
  .fwd-app .card-pad { padding:22px; }

  /* Buttons */
  .fwd-app .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:var(--font-head); font-weight:600; font-size:14px; padding:11px 18px; border-radius:var(--r-sm); transition:all .16s ease; white-space:nowrap; border:none; }
  .fwd-app .btn-primary { background:var(--azul); color:#fff; box-shadow:var(--sh-azul); }
  .fwd-app .btn-primary:hover { background:var(--azul-600); transform:translateY(-1px); }
  .fwd-app .btn-ghost { background:var(--surface); color:var(--ink-700); border:1px solid var(--line); }
  .fwd-app .btn-ghost:hover { border-color:var(--ink-300); color:var(--ink-900); background:var(--bg); }
  html.dark .fwd-app .btn-ghost:hover { background: rgba(255,255,255,0.05); }
  .fwd-app .btn-sm { padding:8px 13px; font-size:13px; }
  .fwd-app .btn-block { width:100%; }

  /* Badges de estado de proyecto */
  .fwd-app .badge { display:inline-flex; align-items:center; gap:6px; font-family:var(--font-head); white-space:nowrap; font-weight:600; font-size:12px; padding:4px 11px 4px 9px; border-radius:var(--r-pill); line-height:1.4; transition: background-color 0.3s ease, color 0.3s ease; }
  .fwd-app .badge .bdot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .fwd-app .badge.borrador { background:var(--bg-2); color:var(--ink-500); }
  .fwd-app .badge.borrador .bdot { background:var(--ink-400); }
  .fwd-app .badge.publicado { background:var(--azul-tint); color:var(--azul-700); }
  .fwd-app .badge.publicado .bdot { background:var(--azul); }
  .fwd-app .badge.en_desarrollo { background:#FDEFDD; color:#B96400; }
  html.dark .fwd-app .badge.en_desarrollo { background:rgba(247, 144, 30, 0.15); color:var(--naranja); }
  .fwd-app .badge.en_desarrollo .bdot { background:var(--naranja); }
  html.dark .fwd-app .badge.en_desarrollo .bdot { box-shadow: 0 0 8px var(--naranja); }
  .fwd-app .badge.cerrado { background:#DEF5F6; color:#0E7A80; }
  html.dark .fwd-app .badge.cerrado { background:rgba(32, 190, 198, 0.15); color:var(--turquesa); }
  .fwd-app .badge.cerrado .bdot { background:var(--turquesa); }
  html.dark .fwd-app .badge.cerrado .bdot { box-shadow: 0 0 8px var(--turquesa); }
  .fwd-app .badge.abierto { background:var(--azul-tint); color:var(--azul-700); }
  .fwd-app .badge.abierto .bdot { background:var(--azul); }
  html.dark .fwd-app .badge.abierto .bdot { box-shadow: 0 0 8px var(--azul); }
  .fwd-app .badge.recepcion { background:var(--azul-tint); color:var(--azul-700); }
  .fwd-app .badge.recepcion .bdot { background:var(--azul); animation:fwdpulse 1.6s ease-in-out infinite; }
  @keyframes fwdpulse { 0%,100% { box-shadow:0 0 0 0 rgba(0,143,212,.5); } 50% { box-shadow:0 0 0 4px rgba(0,143,212,0); } }
  .fwd-app .badge.adjudicado { background:#F0E7F7; color:var(--morado); }
  html.dark .fwd-app .badge.adjudicado { background:rgba(147, 51, 234, 0.15); color:var(--morado); }
  .fwd-app .badge.adjudicado .bdot { background:var(--morado); }
  html.dark .fwd-app .badge.adjudicado .bdot { box-shadow: 0 0 8px var(--morado); }
  .fwd-app .badge.cancelado { background:#FCE3F1; color:#B40A6B; }
  html.dark .fwd-app .badge.cancelado { background:rgba(236, 0, 140, 0.15); color:var(--magenta); }
  .fwd-app .badge.cancelado .bdot { background:var(--magenta); }
  html.dark .fwd-app .badge.cancelado .bdot { box-shadow: 0 0 8px var(--magenta); }

  /* Filas de proyecto */
  .fwd-app .fwd-row { display:grid; grid-template-columns:1fr auto; gap:16px; align-items:center; padding:16px 20px; width:100%; text-align:left; border-top:1px solid var(--line); transition:background .14s, border-color .3s; }
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

  /* Glow utils for specific visual components */
  .glow-cyan { text-shadow: 0 0 10px var(--turquesa); color: var(--turquesa); }
  .glow-magenta { text-shadow: 0 0 10px var(--magenta); color: var(--magenta); }
  .glow-amarillo { text-shadow: 0 0 10px var(--amarillo); color: var(--amarillo); }
  .glow-naranja { text-shadow: 0 0 10px var(--naranja); color: var(--naranja); }
  
  /* Animated Neon Backgrounds (used in stat cards & AI card) */
  .fwd-app .bg-glow { position:absolute; border-radius:50%; filter:blur(40px); z-index:0; opacity:0; transition:opacity 0.3s ease; pointer-events:none; }
  html.dark .fwd-app .bg-glow { opacity:0.15; }
  html.dark .fwd-app .card:hover .bg-glow { opacity:0.25; }

  /* Misc */
  .fwd-app .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
  .fwd-app .muted { color:var(--ink-500); transition: color 0.3s ease; }
  .fwd-app .avatar { border-radius:50%; display:grid; place-items:center; color:#fff; font-family:var(--font-head); font-weight:700; flex-shrink:0; }
  .fwd-app .fade-in { animation:fwdfade .4s ease; }
  @keyframes fwdfade { from { transform:translateY(9px); opacity:.6; } to { transform:none; opacity:1; } }

  @media (max-width:1100px) {
    .fwd-app .stat-grid { grid-template-columns:repeat(2,1fr); }
  }

  /* Shell móvil empresario: menú overlay + contenido a ancho completo */
  .fwd-app .sb-mobile-toggle {
    display: none;
    position: fixed;
    top: 14px;
    left: 12px;
    z-index: 50;
    width: 40px;
    height: 40px;
    border-radius: var(--r-sm);
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--ink-700);
    place-items: center;
    box-shadow: var(--sh-sm);
  }
  .fwd-app .sb-mobile-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 44;
    background: rgba(12,27,51,0.45);
  }
  @media (max-width: 768px) {
    .fwd-app { grid-template-columns: 1fr !important; }
    .fwd-app .sb-mobile-toggle { display: grid; }
    .fwd-app .sidebar {
      position: fixed !important;
      left: 0;
      top: 0;
      bottom: 0;
      z-index: 45;
      width: min(280px, 88vw) !important;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      box-shadow: var(--sh);
    }
    .fwd-app.sb-mobile-open .sidebar { transform: translateX(0); }
    .fwd-app.sb-mobile-open .sb-mobile-backdrop { display: block; }
    .fwd-app .topbar { padding: 14px 88px 14px 52px !important; }
    .fwd-app .tb-actions { right: 12px !important; top: 12px !important; }
    .fwd-app .main { min-width: 0; width: 100%; }
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

      {/* Acciones de la barra superior: Toggle Tema y Campana */}
      <div className="tb-actions">
        <ThemeToggle />
        <NotificacionesCampana />
      </div>

      {completitud && !completitud.completo && (
        <CompletarPerfilModal datos={completitud} />
      )}
    </div>
  );
}
