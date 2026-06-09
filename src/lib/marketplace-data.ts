import type {
  EmpresaCard,
  EventoCard,
  ProductoMarketplace,
  UsuarioCard,
} from "@/types/marketplace";
import type { ProyectoDetalle } from "@/types/sefora";

// Datos de ejemplo. Más adelante vendrán de Supabase.

export const PRODUCTOS: ProductoMarketplace[] = [
  {
    id: "1",
    nombre: "FWD Analytics Suite",
    categoria: "Tecnología",
    descripcion: "Panel de métricas en tiempo real para equipos que deciden con datos.",
    precio: "$49 / mes",
    estado: "Destacado",
    autor: "Datalab CR",
    color: "#008fd4",
    calificacion: 4.9,
    destacado: true,
  },
  {
    id: "2",
    nombre: "Academia Código Futuro",
    categoria: "Educación",
    descripcion: "Ruta de aprendizaje en desarrollo web moderno con mentorías en vivo.",
    precio: "$120",
    estado: "Nuevo",
    autor: "EduTech",
    color: "#662d91",
    calificacion: 4.7,
    destacado: true,
  },
  {
    id: "3",
    nombre: "Consultoría UX Express",
    categoria: "Servicios",
    descripcion: "Auditoría de experiencia de usuario con recomendaciones accionables en 72h.",
    precio: "$280",
    estado: "Disponible",
    autor: "Pixel Studio",
    color: "#20bec6",
    calificacion: 4.8,
    destacado: true,
  },
  {
    id: "4",
    nombre: "Kit Lanzamiento Startup",
    categoria: "Emprendimiento",
    descripcion: "Plantillas legales, financieras y de marca para lanzar tu idea sin fricción.",
    precio: "$75",
    estado: "Disponible",
    autor: "Founders Lab",
    color: "#f7901e",
    calificacion: 4.6,
  },
  {
    id: "5",
    nombre: "Motor de Ideas FWD",
    categoria: "Innovación",
    descripcion: "Plataforma colaborativa para validar y priorizar ideas dentro de tu equipo.",
    precio: "$35 / mes",
    estado: "Nuevo",
    autor: "Innova CR",
    color: "#ec008c",
    calificacion: 4.5,
  },
  {
    id: "6",
    nombre: "API Conecta Pagos",
    categoria: "Tecnología",
    descripcion: "Integración de pagos lista para producción con documentación impecable.",
    precio: "Gratis",
    estado: "Disponible",
    autor: "PayBridge",
    color: "#008fd4",
    calificacion: 4.4,
  },
  {
    id: "7",
    nombre: "Mentoría Liderazgo Ágil",
    categoria: "Educación",
    descripcion: "Programa de 6 semanas para líderes técnicos que escalan equipos remotos.",
    precio: "$210",
    estado: "Disponible",
    autor: "GrowthPath",
    color: "#662d91",
    calificacion: 4.9,
  },
  {
    id: "8",
    nombre: "Branding para Founders",
    categoria: "Servicios",
    descripcion: "Identidad visual completa y guía de marca para emprendimientos tempranos.",
    precio: "$340",
    estado: "Disponible",
    autor: "Marca Viva",
    color: "#20bec6",
    calificacion: 4.7,
  },
  {
    id: "9",
    nombre: "Sandbox de Prototipos",
    categoria: "Innovación",
    descripcion: "Entorno para crear y compartir prototipos interactivos en minutos.",
    precio: "$28 / mes",
    estado: "Nuevo",
    autor: "ProtoLab",
    color: "#f7901e",
    calificacion: 4.3,
  },
];

export const PRODUCTOS_DESTACADOS = PRODUCTOS.filter((p) => p.destacado);
export const PRODUCTOS_RECIENTES = [...PRODUCTOS].slice(-3).reverse();

export const EMPRESAS: EmpresaCard[] = [
  { id: "1", nombre: "Datalab CR", sector: "Analítica de datos", proyectos: 12, verificada: true, color: "#008fd4" },
  { id: "2", nombre: "EduTech", sector: "Educación digital", proyectos: 8, verificada: true, color: "#662d91" },
  { id: "3", nombre: "Pixel Studio", sector: "Diseño de producto", proyectos: 21, color: "#20bec6" },
  { id: "4", nombre: "Founders Lab", sector: "Emprendimiento", proyectos: 15, verificada: true, color: "#f7901e" },
];

export const EVENTOS: EventoCard[] = [
  { id: "1", titulo: "FWD Summit: IA para Startups", fecha: "18 JUN", modalidad: "Presencial", lugar: "San José, CR", categoria: "Conferencia", color: "#008fd4" },
  { id: "2", titulo: "Taller: Diseño de Producto", fecha: "25 JUN", modalidad: "Virtual", lugar: "Online", categoria: "Taller", color: "#ec008c" },
  { id: "3", titulo: "Networking Founders Night", fecha: "02 JUL", modalidad: "Híbrido", lugar: "Heredia, CR", categoria: "Comunidad", color: "#20bec6" },
];

export const USUARIOS: UsuarioCard[] = [
  { username: "ana-dev", nombre: "Ana Rodríguez", rol: "Full-Stack Developer", reputacion: 4.9, habilidades: ["React", "Node", "AWS"], verificadoFwd: true },
  { username: "luis-ux", nombre: "Luis Méndez", rol: "Product Designer", reputacion: 4.7, habilidades: ["Figma", "UX", "Research"] },
  { username: "sofia-data", nombre: "Sofía Castro", rol: "Data Scientist", reputacion: 4.8, habilidades: ["Python", "ML", "SQL"], verificadoFwd: true },
  { username: "diego-mkt", nombre: "Diego Vargas", rol: "Growth Marketer", reputacion: 4.6, habilidades: ["SEO", "Ads", "Analytics"] },
];

export const PROYECTOS: ProyectoDetalle[] = [
  {
    id: "1",
    titulo: "Plataforma de e-commerce headless",
    descripcion: "Buscamos desarrollador para construir una tienda headless con Next.js y Stripe.",
    area: "Tecnología",
    tecnologias: ["Next.js", "Stripe", "Tailwind", "Supabase"],
    diasRestantes: 12,
    empresario: { nombre: "Tienda Verde", sector: "Retail sostenible" },
    estado: "abierto",
  },
  {
    id: "2",
    titulo: "App móvil de bienestar financiero",
    descripcion: "Diseño y desarrollo de una app para hábitos de ahorro con gamificación.",
    area: "Innovación",
    tecnologias: ["React Native", "Firebase", "Figma"],
    diasRestantes: 7,
    empresario: { nombre: "FinWell", sector: "Fintech" },
    estado: "abierto",
  },
  {
    id: "3",
    titulo: "Rediseño de marca y sitio web",
    descripcion: "Identidad visual y landing para una startup de logística.",
    area: "Servicios",
    tecnologias: ["Branding", "Webflow", "Illustrator"],
    diasRestantes: 20,
    empresario: { nombre: "RutaCR", sector: "Logística" },
    estado: "abierto",
  },
];
