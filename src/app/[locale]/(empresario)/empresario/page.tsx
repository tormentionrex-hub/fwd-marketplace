import Link from 'next/link'; // TODO: migrar a @/i18n/navigation cuando el Carril B esté mergeado
import {
  EMPRESARIO_ACTUAL_ID,
  resumenEmpresario,
  getProyectosByEmpresario,
  getOfertasByProyecto,
} from '@/lib/mocks';

// Mapa de estado de proyecto -> etiqueta y colores del badge.
const ESTADO_BADGE = {
  borrador: { label: 'Borrador', dot: 'bg-slate-400', cls: 'bg-slate-100 text-slate-500' },
  publicado: { label: 'Publicado', dot: 'bg-[#00B2B2]', cls: 'bg-[#00B2B2]/10 text-[#00B2B2]' },
  en_desarrollo: {
    label: 'En desarrollo',
    dot: 'bg-[#008FD4]',
    cls: 'bg-[#008FD4]/10 text-[#008FD4]',
  },
  cerrado: { label: 'Cerrado', dot: 'bg-slate-400', cls: 'bg-slate-100 text-slate-500' },
};

// Días restantes hasta la fecha límite (fórmula simple inline).
// TODO Fase 3: extraer a un componente <ContadorPlazo />.
function diasRestantes(fechaLimite: string): number {
  const ms = new Date(fechaLimite).getTime() - new Date().getTime();
  return Math.ceil(ms / 86400000);
}

export default async function DashboardEmpresarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Datos mock para el empresario actual.
  const resumen = resumenEmpresario(EMPRESARIO_ACTUAL_ID);
  const proyectos = getProyectosByEmpresario(EMPRESARIO_ACTUAL_ID);

  // Tarjetas resumen (cada número viene de resumenEmpresario).
  const metricas = [
    { label: 'Proyectos activos', valor: resumen.activos, icon: 'rocket_launch', badge: 'Publicados', badgeCls: 'text-[#00B2B2] bg-[#00B2B2]/10' },
    { label: 'Ofertas recibidas', valor: resumen.ofertasRecibidas, icon: 'description', badge: 'Total', badgeCls: 'text-[#00B2B2] bg-[#00B2B2]/10' },
    { label: 'En desarrollo', valor: resumen.enDesarrollo, icon: 'pending_actions', badge: 'En curso', badgeCls: 'text-[#F26522] bg-[#F26522]/10' },
    { label: 'Cerrados', valor: resumen.cerrados, icon: 'task_alt', badge: 'Finalizados', badgeCls: 'text-slate-500 bg-slate-100' },
  ];

  return (
    <div className="p12 flex min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      {/* Fuentes (Figtree/Outfit) e iconos (Material Symbols), cargados local a esta página
          para no tocar layout.tsx ni globals.css del Carril B. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .p12 { font-family: 'Outfit', sans-serif; }
            .p12 h1, .p12 h2, .p12 h3, .p12 h4, .p12 .font-display { font-family: 'Figtree', sans-serif; }
            .p12 .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
              vertical-align: middle;
            }
            .p12 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .p12 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .p12 .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
          `,
        }}
      />

      {/* TODO Fase 3: mover sidebar a (empresario)/layout.tsx para no repetirlo */}
      <aside className="h-screen w-[280px] fixed left-0 top-0 bg-[#00B2B2] flex flex-col py-2 border-r border-white/10 shadow-xl z-50">
        <div className="px-6 py-8">
          <div className="font-display text-2xl font-bold text-white mb-1">TechLink</div>
          <div className="text-white text-sm opacity-90 uppercase tracking-wider font-semibold">
            Talent Marketplace
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Home (activo) */}
          <a className="flex items-center px-4 py-3 border-l-4 border-white bg-white/20 text-white font-bold transition-colors duration-200 group" href="#">
            <span className="material-symbols-outlined mr-3 text-white">home</span>
            <span className="text-sm">Home</span>
          </a>
          <a className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 group" href="#">
            <span className="material-symbols-outlined mr-3">person</span>
            <span className="text-sm">Perfil</span>
          </a>
          <a className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 group" href="#">
            <span className="material-symbols-outlined mr-3">work</span>
            <span className="text-sm">Mis Proyectos</span>
          </a>
          <a className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 group" href="#">
            <span className="material-symbols-outlined mr-3">notifications</span>
            <span className="text-sm">Notificaciones</span>
          </a>
        </nav>
        <div className="mt-auto px-4 py-6 space-y-1">
          <Link
            href={`/${locale}/empresario/nuevo-proyecto`}
            className="w-full block text-center bg-white text-[#00B2B2] font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-sky-50 transition-all active:scale-95 mb-6"
          >
            Publicar proyecto
          </Link>
          <a className="flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 group" href="#">
            <span className="material-symbols-outlined mr-3">settings</span>
            <span className="text-sm">Ajustes</span>
          </a>
          <a className="flex items-center px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 group" href="#">
            <span className="material-symbols-outlined mr-3">help</span>
            <span className="text-sm">Soporte</span>
          </a>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="ml-[280px] flex-1 flex flex-col min-w-0 bg-[#f8f9ff]">
        {/* Barra superior */}
        <header className="h-16 w-full sticky top-0 z-40 bg-white flex items-center justify-between px-10 border-b border-slate-300 shadow-sm">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full focus-within:ring-2 focus-within:ring-[#008FD4]/20 rounded-lg transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                search
              </span>
              <input
                className="w-full bg-slate-50 border-none rounded-lg pl-10 pr-4 py-2 text-base focus:ring-0 placeholder:text-slate-500"
                placeholder="Buscar proyectos o talento..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all relative">
              <span className="material-symbols-outlined">mail</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E6007E] rounded-full" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
              <span className="material-symbols-outlined">notifications_active</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-300 mx-2" />
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-[#0b1c30] font-semibold">Alex Rivera</p>
                <p className="text-xs text-slate-500">Cuenta empresario</p>
              </div>
              <img
                alt="Perfil"
                className="h-10 w-10 rounded-full border-2 border-[#008FD4]/20 group-hover:border-[#008FD4] transition-colors"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0cFz52brwjm4EK5GvQQ8jJVJ4CwgqXYpXpr_uxwWgwUmtvjYeU2WfJ1VJhCj4q9gaoVjruQxx_giEr5K-UIT2UfdWygyYOC-HsF976QrcgkmrdV80kd2OVVdLDmr3ttztDGtOypuzGGteWZPCFFbl71xrAQvkanuZ6zO0_dbHAO1isx_8OM9b1MaueNABDkPignMSudzE1zQTGhOi1DHvUZBWN5Wh0CaLPf8wDb44rtR2dhDDJpaTjppLLWAcm-4gSXT82GEJ2GE"
              />
            </div>
          </div>
        </header>

        {/* Área del dashboard */}
        <div className="p-10 space-y-8 max-w-[1440px] mx-auto w-full">
          {/* Encabezado + CTA principal */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[2rem] leading-tight text-[#0b1c30] tracking-tight font-semibold">
                Dashboard Empresario
              </h1>
              <p className="text-base text-slate-500 mt-1">
                Gestione sus proyectos y talento técnico en un solo lugar.
              </p>
            </div>
            <Link
              href={`/${locale}/empresario/nuevo-proyecto`}
              className="bg-[#008FD4] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#008FD4]/20 hover:shadow-[#008FD4]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined mr-2">add</span>
              Publicar nuevo proyecto
            </Link>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricas.map((m) => (
              <div
                key={m.label}
                className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-sky-50 rounded-lg text-[#008FD4] group-hover:bg-[#008FD4] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-bold ${m.badgeCls}`}>
                    {m.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                  {m.label}
                </p>
                <p className="font-display text-[2rem] leading-tight text-[#0b1c30] mt-1">
                  {m.valor}
                </p>
              </div>
            ))}
          </div>

          {/* Workspace principal */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Tabla de proyectos recientes */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-300 flex items-center justify-between">
                <h2 className="font-display text-xl text-[#0b1c30] font-bold">Proyectos Recientes</h2>
                <button className="text-[#008FD4] text-sm hover:underline flex items-center font-bold">
                  Ver todos <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-sm text-slate-500">Proyecto</th>
                      <th className="px-6 py-4 text-sm text-slate-500">Estado</th>
                      <th className="px-6 py-4 text-sm text-slate-500">Candidatos</th>
                      <th className="px-6 py-4 text-sm text-slate-500">Presupuesto</th>
                      <th className="px-6 py-4 text-sm text-slate-500" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {proyectos.map((p) => {
                      const badge = ESTADO_BADGE[p.estado];
                      const candidatos = getOfertasByProyecto(p.id).length;
                      const dias = diasRestantes(p.fechaLimite);
                      const plazo =
                        p.estado === 'cerrado'
                          ? 'Finalizado'
                          : dias < 0
                            ? 'Plazo vencido'
                            : `${dias} días restantes`;
                      const iniciales = p.titulo
                        .split(' ')
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase();
                      const presupuesto =
                        p.presupuesto != null ? `$${p.presupuesto.toLocaleString('es-AR')}` : '—';

                      return (
                        <tr key={p.id} className="hover:bg-sky-50/30 transition-colors">
                          <td className="px-6 py-5">
                            <Link
                              href={`/${locale}/empresario/proyectos/${p.id}`}
                              className="flex items-center group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-[#008FD4] mr-3 font-bold">
                                {iniciales}
                              </div>
                              <div>
                                <p className="text-sm text-[#0b1c30] font-semibold group-hover:text-[#008FD4] transition-colors">
                                  {p.titulo}
                                </p>
                                <p className="text-sm text-slate-500">{plazo}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center ${badge.cls}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-base text-[#0b1c30]">
                            {candidatos} {candidatos === 1 ? 'aplicante' : 'aplicantes'}
                          </td>
                          <td className="px-6 py-5 text-base text-[#0b1c30] font-semibold">
                            {presupuesto}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/${locale}/empresario/proyectos/${p.id}`}
                              className="p-2 text-slate-500 hover:text-[#008FD4] transition-colors inline-flex"
                            >
                              <span className="material-symbols-outlined">more_vert</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panel lateral / timeline (contenido estático de diseño) */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm">
                <h2 className="font-display text-xl text-[#0b1c30] mb-6 font-bold">
                  Próximas Entrevistas
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#008FD4] mt-2" />
                      <div className="w-0.5 h-12 bg-slate-300 mt-2 border-dashed border-l" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#0b1c30] font-semibold">Sofía Jensen</p>
                      <p className="text-sm text-slate-500">Senior Fullstack Engineer</p>
                      <div className="flex items-center mt-2 text-xs text-[#008FD4] font-bold">
                        <span className="material-symbols-outlined text-[16px] mr-1">schedule</span>
                        Hoy, 14:30
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-2" />
                      <div className="w-0.5 h-12 bg-slate-300 mt-2 border-dashed border-l" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#0b1c30] font-semibold">Marcus Thorne</p>
                      <p className="text-sm text-slate-500">DevOps Specialist</p>
                      <div className="flex items-center mt-2 text-xs text-slate-500 font-medium">
                        <span className="material-symbols-outlined text-[16px] mr-1">schedule</span>
                        Mañana, 10:00
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-2" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#0b1c30] font-semibold">Elena Rodríguez</p>
                      <p className="text-sm text-slate-500">Product Designer</p>
                      <div className="flex items-center mt-2 text-xs text-slate-500 font-medium">
                        <span className="material-symbols-outlined text-[16px] mr-1">schedule</span>
                        15 Oct, 16:00
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-2 border border-slate-300 text-slate-500 text-sm rounded-lg hover:bg-slate-50 transition-colors font-bold">
                  Ver Calendario Completo
                </button>
              </div>

              {/* Tarjeta de insights */}
              <div className="bg-[#008FD4] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-display text-xl mb-2 font-bold">Talento Disponible</h3>
                  <p className="text-sm opacity-90 mb-4 leading-relaxed">
                    Hemos encontrado 5 nuevos desarrolladores expertos en Go que coinciden con tus
                    proyectos activos.
                  </p>
                  <button className="bg-white text-[#008FD4] font-bold px-4 py-2 rounded-lg text-sm hover:bg-sky-50 transition-colors">
                    Explorar Talento
                  </button>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[120px]">groups</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
