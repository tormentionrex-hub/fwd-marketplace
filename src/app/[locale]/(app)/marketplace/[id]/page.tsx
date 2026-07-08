import Link from "next/link";
import Image from "next/image";
import { IconArrowLeft, IconBriefcase, IconClock, IconCpu, IconCalendar, IconRocket, IconShieldCheck, IconUsers, IconArrowRight } from "@/components/ui/icons";
import { Coins, DollarSign } from "lucide-react";
import { obtenerDetalleProyecto, obtenerDatosSidebar } from "@/server/services/proyecto.service";
import { MODALIDAD_LABEL, type Modalidad } from "@/lib/empleabilidad";
import { formatearPresupuesto } from "@/lib/presupuesto";
import ParticleBackground from "@/components/ParticleBackground";
import CarruselImagenes from "@/components/features/marketplace/CarruselImagenes";
import MarketplaceDetailNav from "@/components/features/marketplace/MarketplaceDetailNav";
import ChatBurbuja from "@/components/features/marketplace/ChatBurbuja";

const COLOR_POR_AREA: Record<string, string> = {
  "Tecnología":       "#008FD4",
  "Educación":        "#662D91",
  "Servicios":        "#20BEC6",
  "Marketing":        "#008FD4",
  "Emprendimiento":   "#F7901E",
  "Innovación":       "#EC008C",
  "Logística":        "#20BEC6",
  "Comercio":         "#F7901E",
  "Finanzas":         "#008FD4",
  "Gastronomía":      "#EC008C",
  "Recursos Humanos": "#662D91",
  "Salud":            "#20BEC6",
  "Turismo":          "#008FD4",
  "Operaciones":      "#F7901E",
  "Mercadeo":         "#EC008C",
};

function areaColor(area: string): string {
  return COLOR_POR_AREA[area] ?? "#008FD4";
}

const HABILIDADES_POR_TECH: Record<string, string[]> = {
  "React":          ["Arquitectura de componentes", "Manejo de estado", "Hooks avanzados"],
  "Next.js":        ["Renderizado del servidor (SSR)", "Rutas dinamicas", "Optimizacion SEO"],
  "Vue":            ["Componentes reactivos", "Composition API", "Manejo de estado con Pinia"],
  "Angular":        ["Arquitectura modular", "Inyeccion de dependencias", "Formularios reactivos"],
  "TypeScript":     ["Tipado estatico", "Interfaces y genericos", "Codigo mas seguro"],
  "Tailwind CSS":   ["Diseno responsivo", "Utilidades CSS modernas", "Sistemas de diseno"],
  "JavaScript":     ["Programacion asincrona", "Manipulacion del DOM", "ES6+ moderno"],
  "Node.js":        ["APIs REST", "Manejo de solicitudes HTTP", "Middleware"],
  "Express":        ["Enrutamiento de servidor", "Autenticacion con JWT", "Validacion de datos"],
  "Python":         ["Scripting y automatizacion", "Librerias de datos", "APIs con FastAPI/Flask"],
  "Django":         ["ORM de Django", "Autenticacion integrada", "Panel administrativo"],
  "FastAPI":        ["APIs modernas con Python", "Tipado con Pydantic", "Documentacion automatica"],
  "PHP":            ["Logica del servidor", "Integracion con bases de datos", "Formularios y sesiones"],
  "Laravel":        ["MVC en PHP", "ORM Eloquent", "Autenticacion y middleware"],
  "PostgreSQL":     ["Modelado relacional", "Consultas SQL avanzadas", "Indexacion y performance"],
  "MySQL":          ["Consultas relacionales", "Joins y subconsultas", "Administracion de DB"],
  "MongoDB":        ["Bases de datos NoSQL", "Documentos y colecciones", "Agregaciones"],
  "Supabase":       ["Backend como servicio", "Auth en tiempo real", "Storage y Edge Functions"],
  "Firebase":       ["Base de datos en tiempo real", "Autenticacion OAuth", "Cloud Functions"],
  "Redis":          ["Cache de datos", "Sesiones rapidas", "Colas de trabajo"],
  "Docker":         ["Contenedorizacion", "Entornos reproducibles", "Docker Compose"],
  "Git":            ["Control de versiones", "Flujos de trabajo en equipo", "Pull Requests"],
  "AWS":            ["Servicios cloud", "Almacenamiento S3", "Despliegue en la nube"],
  "Vercel":         ["Deploy continuo", "Variables de entorno", "Preview URLs"],
  "OpenAI":         ["Integracion de LLMs", "Prompt engineering", "APIs de IA generativa"],
  "LangChain":      ["Cadenas de prompts", "Agentes con IA", "Memoria conversacional"],
  "TensorFlow":     ["Redes neuronales", "Entrenamiento de modelos", "ML en produccion"],
  "Prisma":         ["ORM type-safe", "Migraciones de base de datos", "Consultas relacionales"],
  "Vue.js":         ["Componentes reactivos", "Composition API", "Manejo de estado con Pinia"],
  "Express.js":     ["Enrutamiento de servidor", "Autenticacion con JWT", "Validacion de datos"],
  "TailwindCSS":    ["Diseno responsivo", "Utilidades CSS modernas", "Sistemas de diseno"],
  "Bootstrap":      ["Diseno responsivo", "Componentes UI", "Sistema de grillas"],
  "Socket.io":      ["Comunicacion en tiempo real", "WebSockets", "Eventos bidireccionales"],
  "GraphQL":        ["Consultas flexibles", "Esquemas y resolvers", "Optimizacion de datos"],
  "React Native":   ["Apps moviles multiplataforma", "Componentes nativos", "Navegacion movil"],
  "Flutter":        ["UI multiplataforma", "Widgets y manejo de estado", "Apps nativas con Dart"],
  "Dart":           ["Lenguaje de Flutter", "Programacion asincrona", "Tipado moderno"],
  "Swift":          ["Desarrollo iOS nativo", "SwiftUI", "Gestion de memoria"],
  "Kotlin":         ["Desarrollo Android nativo", "Coroutines", "Jetpack Compose"],
  "Stripe API":     ["Integracion de pagos", "Checkout seguro", "Webhooks de facturacion"],
  "JWT":            ["Autenticacion con tokens", "Sesiones sin estado", "Seguridad de APIs"],
  "Chart.js":       ["Visualizacion de datos", "Graficos interactivos", "Dashboards de metricas"],
  "Electron":       ["Apps de escritorio", "Procesos main/renderer", "Empaquetado multiplataforma"],
  "Figma":          ["Diseno de interfaces", "Prototipado", "Sistemas de diseno"],
  "FramerMotion":   ["Animaciones en React", "Transiciones fluidas", "Gestos e interacciones"],
  "Video.js":       ["Reproduccion de video", "Streaming", "Controles personalizados"],
  "WhatsApp Business API": ["Mensajeria automatizada", "Notificaciones", "Integracion de chatbots"],
  "xlsx":           ["Generacion de reportes Excel", "Procesamiento de datos", "Exportacion de informacion"],
};

const EDITORIAL_POR_AREA: Record<string, { titulo: string; descripcion: string }> = {
  "Tecnología":       { titulo: "Tecnologia real, cliente real", descripcion: "Trabajaras en un proyecto de software con impacto directo en un negocio. Primera vez que tu codigo corre en produccion." },
  "Educación":        { titulo: "Transforma como se aprende", descripcion: "Contribuyes a una solucion educativa que llegara a estudiantes reales. Tu trabajo tiene impacto en la formacion de otras personas." },
  "Marketing":        { titulo: "Estrategia que mueve negocios", descripcion: "Disenaras o ejecutaras acciones de marketing con resultados medibles para una empresa real. Tu trabajo se ve en numeros." },
  "Emprendimiento":   { titulo: "Construye junto a fundadores", descripcion: "Trabajaras directamente con emprendedores que necesitan tu talento para crecer. Velocidad y aprendizaje garantizados." },
  "Innovacion":       { titulo: "Ideas que se vuelven realidad", descripcion: "Este proyecto explora terreno nuevo. Tu aportacion puede definir una direccion que la empresa no habia tomado antes." },
  "Innovación":       { titulo: "Ideas que se vuelven realidad", descripcion: "Este proyecto explora terreno nuevo. Tu aportacion puede definir una direccion que la empresa no habia tomado antes." },
  "Logistica":        { titulo: "Operaciones que no se detienen", descripcion: "Optimizaras flujos reales de trabajo. Tu solucion afecta directamente la eficiencia del negocio." },
  "Logística":        { titulo: "Operaciones que no se detienen", descripcion: "Optimizaras flujos reales de trabajo. Tu solucion afecta directamente la eficiencia del negocio." },
  "Comercio":         { titulo: "Ventas con impacto inmediato", descripcion: "Tu trabajo impulsara los ingresos de un negocio real. Veraas el resultado de tu esfuerzo reflejado en el rendimiento comercial." },
  "Finanzas":         { titulo: "Datos que toman decisiones", descripcion: "Trabajaras con informacion financiera real. Tu analisis o herramienta ayudara a la empresa a gestionar mejor su dinero." },
  "Gastronomia":      { titulo: "Donde la tecnologia y la gastronomia se cruzan", descripcion: "Un sector lleno de oportunidades digitales. Ayudaras a un negocio a llevar su experiencia al siguiente nivel." },
  "Gastronomía":      { titulo: "Donde la tecnologia y la gastronomia se cruzan", descripcion: "Un sector lleno de oportunidades digitales. Ayudaras a un negocio a llevar su experiencia al siguiente nivel." },
  "Recursos Humanos": { titulo: "Las personas son el producto", descripcion: "Trabajaras en soluciones que mejoran la experiencia de los empleados o los procesos de contratacion de una empresa real." },
  "Salud":            { titulo: "Tu trabajo puede ayudar a alguien", descripcion: "Proyectos en salud tienen consecuencias concretas. Lo que construyas o analices puede mejorar la atencion de pacientes reales." },
  "Turismo":          { titulo: "Experiencias que la gente recordara", descripcion: "Contribuiras a mejorar como los viajeros descubren o viven destinos. Impacto tangible en el sector de servicios." },
  "Operaciones":      { titulo: "Eficiencia que se mide en resultados", descripcion: "Mejoraras procesos operativos con impacto directo en la productividad del negocio. Cada mejora cuenta." },
  "Mercadeo":         { titulo: "Marcas que conectan con personas", descripcion: "Tu trabajo construira o reforzara la presencia de una empresa en el mercado. Creatividad aplicada a objetivos reales." },
  "Servicios":        { titulo: "Solucion real para un negocio real", descripcion: "Trabajaras directamente en mejorar el servicio que una empresa entrega a sus clientes. Tu contribucion es visible." },
};

const TIPO_PROBLEMA: Record<string, string> = {
  "Tecnología":       "Desarrollo de software",
  "Educación":        "Educacion y formacion",
  "Marketing":        "Marketing digital",
  "Emprendimiento":   "Proyecto emprendedor",
  "Innovación":       "Innovacion tecnologica",
  "Logística":        "Optimizacion logistica",
  "Comercio":         "Comercio electronico",
  "Finanzas":         "Analisis financiero",
  "Gastronomía":      "Tecnologia gastronomica",
  "Recursos Humanos": "Gestion de personas",
  "Salud":            "Tecnologia en salud",
  "Turismo":          "Turismo digital",
  "Operaciones":      "Optimizacion operativa",
  "Mercadeo":         "Estrategia de marca",
  "Servicios":        "Mejora de servicios",
};

function obtenerEditorial(area: string): { titulo: string; descripcion: string } {
  return EDITORIAL_POR_AREA[area] ?? {
    titulo: "Tu primera experiencia profesional paga",
    descripcion: "Un proyecto real, una empresa real, y un pago real por tu trabajo. La mejor forma de comenzar tu carrera.",
  };
}

function inferirHabilidades(tecnologias: string[]): string[] {
  const vistas = new Set<string>();
  const resultado: string[] = [];
  for (const tech of tecnologias) {
    // Fallback: si la tecnologia no esta en el mapa, igual aporta una habilidad
    // generica para que "Lo que desarrollaras" nunca quede vacio.
    const habilidades = HABILIDADES_POR_TECH[tech] ?? [`Experiencia practica con ${tech}`];
    for (const h of habilidades) {
      if (!vistas.has(h) && resultado.length < 6) {
        vistas.add(h);
        resultado.push(h);
      }
    }
  }
  return resultado;
}

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const proyecto = await obtenerDetalleProyecto(id);

  if (!proyecto) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center"
        style={{ background: "var(--surface)" }}>
        <ParticleBackground />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-heading font-black text-3xl text-text mb-3">Proyecto no encontrado</h1>
          <p className="text-text-muted mb-8">El proyecto que buscas no esta disponible.</p>
          <Link
            href={`/${locale}/marketplace`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-bold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #20BEC6, #008FD4)", boxShadow: "0 4px 20px rgba(32,190,198,0.4)" }}
          >
            <IconArrowLeft width={16} height={16} />
            Volver al marketplace
          </Link>
        </div>
      </div>
    );
  }

  const color = areaColor(proyecto.area);
  const empresa = proyecto.empresario.nombre;
  const fotoEmpresa = proyecto.empresario.fotoUrl;
  // Enlace al perfil público de la empresa (o null si por algún motivo no hay id).
  const empresaHref = proyecto.empresario.id
    ? `/${locale}/empresa/${proyecto.empresario.id}`
    : null;
  const estaAbierto = proyecto.estado === "abierto";
  const modalidadLabel = proyecto.modalidad
    ? (MODALIDAD_LABEL[proyecto.modalidad as Modalidad] ?? proyecto.modalidad)
    : null;
  const tipoProblemaTitulo = `${TIPO_PROBLEMA[proyecto.area] ?? proyecto.area}${proyecto.usaIA ? " con IA" : ""}`;
  const habilidades = inferirHabilidades(proyecto.tecnologias);
  const editorial = obtenerEditorial(proyecto.area);
  const { postulaciones, similares } = await obtenerDatosSidebar(proyecto.id, proyecto.area);

  // Presupuesto: texto formateado + ícono de dinero segun moneda (dolar / colon).
  const presupuestoTexto = formatearPresupuesto(proyecto.presupuestoMin, proyecto.presupuestoMax, proyecto.moneda);
  const MonedaIcon = proyecto.moneda === "USD" ? DollarSign : Coins;
  const monedaColor = proyecto.moneda === "USD" ? "#16a34a" : "#F59E0B";

  const itemsAlcance = [
    {
      icon: <IconCalendar width={20} height={20} />,
      label: "Duracion estimada",
      value: proyecto.plazoDias ? `${proyecto.plazoDias} dias` : "Por definir",
      color: "#008FD4",
    },
    {
      icon: <IconCpu width={20} height={20} />,
      label: "Tecnologias",
      value: proyecto.tecnologias.length > 0
        ? `${proyecto.tecnologias.length} requerida${proyecto.tecnologias.length !== 1 ? "s" : ""}`
        : "Por definir",
      color: "#662D91",
    },
    {
      icon: <IconBriefcase width={20} height={20} />,
      label: "Modalidad",
      value: modalidadLabel ?? "Por definir",
      color: "#20BEC6",
    },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--surface)" }}>
      {/* Textura de fondo sutil */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-25">
        <ParticleBackground />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 6px 28px var(--cta-color-shadow); }
          50%       { box-shadow: 0 6px 40px var(--cta-color-glow); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none !important; opacity: 1 !important; }
          .cta-pulse { animation: none !important; }
        }
        .fade-up { opacity: 0; animation: fadeUp 0.45s ease forwards; }
        .fade-up-1 { animation-delay: 0.04s; }
        .fade-up-2 { animation-delay: 0.10s; }
        .fade-up-3 { animation-delay: 0.16s; }
        .fade-up-4 { animation-delay: 0.22s; }
        .fade-up-5 { animation-delay: 0.28s; }
        .cta-pulse { animation: ctaPulse 2.4s ease-in-out infinite; }
      `}</style>

      {/* Navbar estilo Adelante — logo + links + usuario */}
      <MarketplaceDetailNav locale={locale} area={proyecto.area} areaColor={color} />

      {/* Contenido principal */}
      <div className="relative z-10 mx-auto max-w-5xl w-full px-6 sm:px-8 py-8">

        {/* Encabezado (ancho completo, encima del grid) */}
        <div className="mb-8 fade-up fade-up-1">

          {/* Título */}
          <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-text leading-tight mb-5">
            {proyecto.titulo}
          </h1>

          {/* Fila empresa — estilo Fiverr */}
          <div
            className="flex items-start gap-4 pb-5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {/* Avatar redondo (foto de perfil) — enlaza al perfil de la empresa */}
            {empresaHref ? (
              <Link
                href={empresaHref}
                title={`Ver perfil de ${empresa}`}
                className="grid h-14 w-14 place-items-center overflow-hidden rounded-full font-black text-white text-2xl shrink-0 shadow-sm transition-transform hover:scale-105"
                style={fotoEmpresa ? undefined : { background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
              >
                {fotoEmpresa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoEmpresa} alt={empresa} className="h-full w-full object-cover" />
                ) : (
                  empresa.charAt(0).toUpperCase()
                )}
              </Link>
            ) : (
              <span
                className="grid h-14 w-14 place-items-center overflow-hidden rounded-full font-black text-white text-2xl shrink-0 shadow-sm"
                style={fotoEmpresa ? undefined : { background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
              >
                {fotoEmpresa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoEmpresa} alt={empresa} className="h-full w-full object-cover" />
                ) : (
                  empresa.charAt(0).toUpperCase()
                )}
              </span>
            )}

            {/* Bloque de texto */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">

              {/* Línea 1: nombre + badges */}
              <div className="flex flex-wrap items-center gap-2">
                {empresaHref ? (
                  <Link href={empresaHref} className="font-bold text-text text-base hover:text-[color:var(--fwd-azul,#008FD4)] hover:underline">
                    {empresa}
                  </Link>
                ) : (
                  <span className="font-bold text-text text-base">{empresa}</span>
                )}
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                >
                  <IconShieldCheck width={10} height={10} />
                  Empresa verificada
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}35` }}
                >
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color }} />
                    <span className="w-1.5 h-1.5 rounded-sm" style={{ background: color, opacity: 0.4 }} />
                  </span>
                  Top en {proyecto.area}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-text-muted font-medium">
                  <IconBriefcase width={13} height={13} />
                  Empresa
                </span>
              </div>

              {/* Línea 2: postulantes en cola */}
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-text">{postulaciones}</span>
                {" "}postulante{postulaciones !== 1 ? "s" : ""} en cola
                {estaAbierto
                  ? <span className="ml-2 font-semibold" style={{ color: "#10b981" }}>· Abierto</span>
                  : <span className="ml-2 font-semibold" style={{ color: "#ef4444" }}>· Cerrado</span>
                }
              </p>

              {/* Línea 3: tipo de problema + fecha */}
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="font-semibold text-text">{tipoProblemaTitulo}</span>
                {proyecto.publicado && (
                  <>
                    <span className="text-text-muted" style={{ opacity: 0.5 }}>·</span>
                    <span className="text-text-muted text-xs">
                      {new Date(proyecto.publicado).toLocaleDateString("es-CR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de dos columnas */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">

          {/* ── Columna principal ── */}
          <div className="flex flex-col gap-8">

            {/* Carrusel de imágenes */}
            {proyecto.imagenes && proyecto.imagenes.length > 0 && (
              <div className="fade-up fade-up-2">
                <CarruselImagenes imagenes={proyecto.imagenes} titulo={proyecto.titulo} />
              </div>
            )}

            {/* Callout editorial */}
            <div
              className="fade-up fade-up-2 rounded-2xl px-6 py-5 flex gap-4 items-start"
              style={{
                background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`,
                border: `1px solid ${color}28`,
              }}
            >
              <span
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ background: `${color}20`, color }}
              >
                <IconRocket width={18} height={18} />
              </span>
              <div>
                <p className="font-heading font-black text-base text-text leading-tight">
                  {editorial.titulo}
                </p>
                <p className="mt-1 text-sm text-text-muted leading-relaxed">
                  {editorial.descripcion}
                </p>
              </div>
            </div>

            {/* Grilla de alcance */}
            <div className="fade-up fade-up-3 grid grid-cols-3 gap-3">
              {itemsAlcance.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4 flex flex-col items-center text-center gap-2"
                  style={{ border: `1px solid ${item.color}22`, background: `${item.color}07` }}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl shrink-0"
                    style={{ background: `${item.color}18`, color: item.color }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: item.color }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-text mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Descripcion completa */}
            <div
              className="fade-up fade-up-3 rounded-2xl p-7"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-1 h-6 rounded-full flex-shrink-0"
                  style={{ background: `linear-gradient(180deg, ${color}, ${color}80)` }}
                />
                <h2 className="font-heading font-black text-lg text-text">Descripcion del proyecto</h2>
              </div>
              <p className="text-text-muted leading-relaxed text-base whitespace-pre-line">
                {proyecto.descripcion}
              </p>
            </div>

            {/* Tecnologías requeridas */}
            {proyecto.tecnologias.length > 0 && (
              <div
                className="fade-up fade-up-4 rounded-2xl p-7"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(180deg, #662D91, #ED008C)" }}
                  />
                  <h2 className="font-heading font-black text-lg text-text">Tecnologias requeridas</h2>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {proyecto.tecnologias.map((tech, i) => {
                    const techColors = ["#008FD4", "#662D91", "#20BEC6", "#F7901E", "#EC008C"];
                    const tc = techColors[i % techColors.length]!;
                    return (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 hover:scale-105"
                        style={{
                          background: `${tc}12`,
                          border: `1px solid ${tc}35`,
                          color: tc,
                          boxShadow: `0 2px 8px ${tc}15`,
                        }}
                      >
                        <IconCpu width={13} height={13} className="opacity-80" />
                        {tech}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lo que desarrollaras */}
            {habilidades.length > 0 && (
              <div
                className="fade-up fade-up-5 rounded-2xl p-7"
                style={{
                  border: `1px solid ${color}22`,
                  background: `linear-gradient(135deg, ${color}05 0%, transparent 60%)`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ background: `linear-gradient(180deg, ${color}, #662D91)` }}
                  />
                  <h2 className="font-heading font-black text-lg text-text">Lo que desarrollaras</h2>
                </div>
                <p className="text-sm text-text-muted mb-5 ml-4">
                  Habilidades profesionales que pondras en practica en este proyecto
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {habilidades.map((h, i) => {
                    const accentColors = ["#008FD4", "#662D91", "#20BEC6", "#F7901E", "#EC008C", "#20BEC6"];
                    const ac = accentColors[i % accentColors.length]!;
                    return (
                      <li
                        key={h}
                        className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                        style={{ background: `${ac}09`, border: `1px solid ${ac}1e` }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: ac }} />
                        <span className="text-sm font-medium text-text">{h}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* ── Sidebar sticky ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-[56px] lg:self-start">

            {/* CTA principal */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${color}30`, boxShadow: `0 4px 24px ${color}10` }}
            >
              <div
                className="px-5 py-3"
                style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)` }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
                  {estaAbierto ? "Proyecto abierto" : "Proyecto cerrado"}
                </p>
              </div>
              <div className="px-5 py-4 bg-surface flex flex-col gap-4">
                {proyecto.fechaLimite && (
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-xl shrink-0"
                      style={{ background: "rgba(247,144,30,0.12)", color: "#F7901E" }}
                    >
                      <IconClock width={17} height={17} />
                    </span>
                    <div>
                      <p className="font-bold text-text text-sm">
                        {proyecto.vencido
                          ? "Convocatoria vencida"
                          : `${proyecto.diasRestantes} día${proyecto.diasRestantes !== 1 ? "s" : ""} restantes`}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(proyecto.fechaLimite).toLocaleDateString("es-CR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {proyecto.plazoDias && (
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-xl shrink-0"
                      style={{ background: `${color}15`, color }}
                    >
                      <IconCalendar width={17} height={17} />
                    </span>
                    <div>
                      <p className="text-xs text-text-muted">Duracion estimada</p>
                      <p className="font-bold text-text text-sm">{proyecto.plazoDias} dias de trabajo</p>
                    </div>
                  </div>
                )}
                {estaAbierto ? (
                  <a
                    href={`/${locale}/proyectos/${id}/ofertar`}
                    className="cta-pulse group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl px-6 py-3.5 text-base font-black text-white transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                      ["--cta-color-shadow" as string]: `${color}45`,
                      ["--cta-color-glow" as string]: `${color}70`,
                    }}
                  >
                    <span className="pointer-events-none absolute inset-0 translate-x-[-100%] skew-x-[-20deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]" />
                    <Image
                      src="/imagenes/fordy/fordy-postula.png"
                      alt=""
                      width={44}
                      height={44}
                      className="relative z-10 h-11 w-11 shrink-0 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                    />
                    <span className="relative z-10">Postularme a este proyecto</span>
                  </a>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold"
                    style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    Proyecto cerrado
                  </div>
                )}
              </div>
            </div>

            {/* Empresa */}
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              {empresaHref ? (
                <Link
                  href={empresaHref}
                  title={`Ver perfil de ${empresa}`}
                  className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl font-black text-white text-lg shrink-0 transition-transform hover:scale-105"
                  style={fotoEmpresa ? undefined : { background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
                >
                  {fotoEmpresa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fotoEmpresa} alt={empresa} className="h-full w-full object-cover" />
                  ) : (
                    empresa.charAt(0).toUpperCase()
                  )}
                </Link>
              ) : (
                <span
                  className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl font-black text-white text-lg shrink-0"
                  style={fotoEmpresa ? undefined : { background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
                >
                  {fotoEmpresa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fotoEmpresa} alt={empresa} className="h-full w-full object-cover" />
                  ) : (
                    empresa.charAt(0).toUpperCase()
                  )}
                </span>
              )}
              <div className="min-w-0 flex-1">
                {empresaHref ? (
                  <Link href={empresaHref} className="font-heading font-black text-text truncate block hover:underline">
                    {empresa}
                  </Link>
                ) : (
                  <p className="font-heading font-black text-text truncate">{empresa}</p>
                )}
                <p className="text-xs text-text-muted">{proyecto.empresario.sector}</p>
              </div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black shrink-0"
                style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.22)" }}
              >
                <IconShieldCheck width={10} height={10} />
                Verificada
              </span>
            </div>

            {/* Actividad */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(32,190,198,0.25)" }}>
              <div
                className="px-5 py-3"
                style={{ background: "linear-gradient(135deg, rgba(32,190,198,0.12), rgba(32,190,198,0.04))" }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#20BEC6]">Actividad</p>
              </div>
              <div className="px-5 py-4 bg-surface flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl shrink-0"
                  style={{ background: "rgba(32,190,198,0.12)", color: "#20BEC6" }}
                >
                  <IconUsers width={18} height={18} />
                </span>
                <div>
                  <p className="font-black text-text text-lg leading-none">{postulaciones}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {postulaciones === 1 ? "estudiante interesado" : "estudiantes interesados"}
                  </p>
                </div>
              </div>
            </div>

            {/* Ver mas proyectos */}
            <Link
              href={`/${locale}/marketplace`}
              className="group flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              <IconArrowLeft width={14} height={14} />
              Ver mas proyectos
            </Link>

            {/* Proyectos similares */}
            {similares.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div
                  className="px-5 py-3"
                  style={{ background: "linear-gradient(135deg, rgba(102,45,145,0.12), rgba(102,45,145,0.04))" }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#662D91]">
                    Proyectos similares
                  </p>
                </div>
                <div className="px-4 py-3 bg-surface flex flex-col gap-2">
                  {similares.map((sim) => (
                    <Link
                      key={sim.id}
                      href={`/${locale}/marketplace/${sim.id}`}
                      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.01]"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      <span
                        className="grid h-8 w-8 place-items-center rounded-lg shrink-0 font-black text-white text-sm"
                        style={{ background: `linear-gradient(135deg, ${areaColor(sim.area)}, ${areaColor(sim.area)}bb)` }}
                      >
                        {sim.empresa.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text truncate group-hover:text-[#008FD4] transition-colors">
                          {sim.titulo}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">{sim.empresa}</p>
                        {!sim.vencido && (
                          <p className="text-[10px] mt-1" style={{ color: areaColor(sim.area) }}>
                            {sim.diasRestantes} dia{sim.diasRestantes !== 1 ? "s" : ""} restantes
                          </p>
                        )}
                      </div>
                      <IconArrowRight width={13} height={13} className="shrink-0 mt-1 opacity-40 group-hover:opacity-80 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Presupuesto (lo que se paga) */}
            {presupuestoTexto && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <div
                  className="px-5 py-3"
                  style={{ background: "linear-gradient(135deg, rgba(22,163,74,0.12), rgba(0,143,212,0.05))" }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#16a34a" }}>
                    Presupuesto
                  </p>
                </div>
                <div className="px-5 py-4 bg-surface">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                      style={{ background: `${monedaColor}1a` }}
                    >
                      <MonedaIcon width={24} height={24} style={{ color: monedaColor }} />
                    </span>
                    <div>
                      <p className="font-heading font-black text-xl text-text leading-none">{presupuestoTexto}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {proyecto.moneda === "USD" ? "Dolares (USD)" : "Colones (CRC)"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                      style={
                        proyecto.negociable
                          ? { background: "rgba(22,163,74,0.12)", color: "#16a34a" }
                          : { background: "rgba(220,38,38,0.12)", color: "#dc2626" }
                      }
                    >
                      {proyecto.negociable ? "Negociable" : "No negociable"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Detalles del proyecto */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div
                className="px-5 py-3"
                style={{ background: "linear-gradient(135deg, rgba(32,190,198,0.1), rgba(102,45,145,0.06))" }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#20BEC6]">
                  Detalles del proyecto
                </p>
              </div>
              <div className="px-5 py-4 bg-surface flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Area</span>
                  <span className="font-semibold text-text">{proyecto.area}</span>
                </div>
                {proyecto.plazoDias && (
                  <div
                    className="flex items-center justify-between text-sm"
                    style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}
                  >
                    <span className="text-text-muted">Duracion estimada</span>
                    <span className="font-semibold text-text">{proyecto.plazoDias} dias</span>
                  </div>
                )}
                {modalidadLabel && (
                  <div
                    className="flex items-center justify-between text-sm"
                    style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}
                  >
                    <span className="text-text-muted">Modalidad</span>
                    <span className="font-semibold text-text">{modalidadLabel}</span>
                  </div>
                )}
                {proyecto.tecnologias.length > 0 && (
                  <div
                    className="flex items-center justify-between text-sm"
                    style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}
                  >
                    <span className="text-text-muted">Tecnologias</span>
                    <span className="font-semibold text-text">{proyecto.tecnologias.length} requeridas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Como funciona */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <div
                className="px-5 py-3"
                style={{ background: "linear-gradient(135deg, rgba(0,143,212,0.1), rgba(0,143,212,0.04))" }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#008FD4]">
                  Como funciona
                </p>
              </div>
              <div className="px-5 py-4 bg-surface flex flex-col gap-4">
                {(
                  [
                    { step: "1", title: "Postulate", desc: "Envia tu propuesta con tu perfil y motivacion al proyecto.", c: "#008FD4" },
                    { step: "2", title: "La empresa te elige", desc: "Revisan tu postulacion y te contactan si encajas.", c: "#662D91" },
                    { step: "3", title: "Trabaja y cobra", desc: "Completas el proyecto y recibes tu pago al entregar.", c: "#20BEC6" },
                  ] as const
                ).map(({ step, title, desc, c }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span
                      className="grid h-7 w-7 place-items-center rounded-full text-xs font-black text-white shrink-0 mt-0.5"
                      style={{ background: `linear-gradient(135deg, ${c}, ${c}bb)` }}
                    >
                      {step}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-text">{title}</p>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Postula con confianza */}
            <div
              className="rounded-2xl px-5 py-5"
              style={{
                background: `linear-gradient(135deg, ${color}0d 0%, rgba(102,45,145,0.05) 100%)`,
                border: `1px solid ${color}22`,
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color }}>
                Postula con confianza
              </p>
              <ul className="flex flex-col gap-2.5">
                {(
                  [
                    { text: "Sin costo de postulacion", c: "#10b981" },
                    { text: "Proyecto validado por FWD", c: "#008FD4" },
                    { text: "Empresa verificada", c: "#662D91" },
                    { text: "Soporte durante el proyecto", c: "#20BEC6" },
                  ] as const
                ).map(({ text, c }) => (
                  <li key={text} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c }} />
                    <span className="text-xs font-medium text-text">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Badge FWD */}
            <div className="flex items-center justify-center py-1">
              <span
                className="text-[10px] font-black tracking-[0.25em] uppercase"
                style={{
                  background: "linear-gradient(90deg, #20BEC6, #008FD5, #662D91, #ED008C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                FWD Marketplace
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Burbuja de chat con el dueño del proyecto */}
      <ChatBurbuja nombre={empresa} fotoUrl={fotoEmpresa} color={color} idProyecto={proyecto.id} locale={locale} />
    </div>
  );
}
