import type { EmpresaCard, EventoCard, UsuarioCard } from "@/types/marketplace";

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
