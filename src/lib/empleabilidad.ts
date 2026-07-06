// Tipos y catálogos de las preferencias de empleabilidad del estudiante.
// Compartido entre el server (service) y el cliente (Configuración), por eso NO
// es server-only.

export const MODALIDADES = ['remoto', 'hibrido', 'presencial', 'indistinto'] as const;
export type Modalidad = (typeof MODALIDADES)[number];

export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  remoto: 'Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
  indistinto: 'Indistinto',
};

export interface Empleabilidad {
  areas: string[];
  tecnologias: string[];
  modalidad: Modalidad;
  disponibilidadHoras: number | null;
  fechaInicio: string | null; // ISO date "disponible desde"
  tipoProyecto: string[];
  // Expectativa de pago: rango PRIVADO, solo para afinar el matching (no visible al empresario).
  pagoMin: number | null;
  pagoMax: number | null;
  pagoMoneda: 'CRC' | 'USD';
}

export const DEFAULT_EMPLEABILIDAD: Empleabilidad = {
  areas: [],
  tecnologias: [],
  modalidad: 'indistinto',
  disponibilidadHoras: null,
  fechaInicio: null,
  tipoProyecto: [],
  pagoMin: null,
  pagoMax: null,
  pagoMoneda: 'CRC',
};

// Áreas de negocio del marketplace (mismas que usa la página de detalle).
export const AREAS_FWD = [
  'Tecnología', 'Educación', 'Servicios', 'Marketing', 'Emprendimiento',
  'Innovación', 'Logística', 'Comercio', 'Finanzas', 'Gastronomía',
  'Recursos Humanos', 'Salud', 'Turismo', 'Operaciones', 'Mercadeo',
] as const;

// Catálogo curado de tecnologías (para los chips de selección).
export const TECNOLOGIAS_FWD = [
  'React', 'Next.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Node.js',
  'Express', 'Python', 'Django', 'FastAPI', 'PHP', 'Laravel', 'Java', 'C#',
  '.NET', 'Go', 'Ruby on Rails', 'PostgreSQL', 'MySQL', 'MongoDB', 'Supabase',
  'Firebase', 'Redis', 'Docker', 'Git', 'AWS', 'Vercel', 'Tailwind CSS',
  'Figma', 'React Native', 'Flutter',
] as const;

export const TIPOS_PROYECTO = [
  'Corto plazo', 'Mediano plazo', 'Largo plazo', 'Puntual / freelance',
] as const;

// ── Notificaciones (Fase 2) ──
export interface NotifPrefs {
  ofertas: boolean;
  solicitudes: boolean;
  mensajes: boolean;
  proyecto: boolean;
  evaluaciones: boolean;
  resumen: boolean;
  marketing: boolean;
}
export const DEFAULT_NOTIF: NotifPrefs = {
  ofertas: true, solicitudes: true, mensajes: true, proyecto: true,
  evaluaciones: true, resumen: false, marketing: false,
};
export const NOTIF_ROWS: { key: keyof NotifPrefs; titulo: string; desc: string }[] = [
  { key: 'ofertas', titulo: 'Sugerencias de proyectos', desc: 'Cuando hay proyectos que encajan con vos.' },
  { key: 'solicitudes', titulo: 'Resultado de tus postulaciones', desc: 'Cuando aceptan, rechazan o adjudican una oferta tuya.' },
  { key: 'mensajes', titulo: 'Mensajes', desc: 'Cuando recibís un mensaje en el chat.' },
  { key: 'proyecto', titulo: 'Proyecto activo', desc: 'Comentarios y avances en el proyecto en el que trabajás.' },
  { key: 'evaluaciones', titulo: 'Evaluaciones recibidas', desc: 'Cuando una empresa te califica.' },
  { key: 'resumen', titulo: 'Resumen semanal', desc: 'Un correo con tu actividad cada semana.' },
  { key: 'marketing', titulo: 'Novedades y consejos', desc: 'Noticias de FWD, recursos y oportunidades.' },
];

// ── Privacidad (Fase 2) ──
export interface PrivPrefs {
  perfilVisible: boolean;
  mostrarReputacion: boolean;
  contactoDirecto: boolean;
}
export const DEFAULT_PRIV: PrivPrefs = {
  perfilVisible: true, mostrarReputacion: true, contactoDirecto: true,
};
export const PRIV_ROWS: { key: keyof PrivPrefs; titulo: string; desc: string }[] = [
  { key: 'perfilVisible', titulo: 'Perfil visible para empresas', desc: 'Aparecés en las búsquedas de talento de las empresas.' },
  { key: 'mostrarReputacion', titulo: 'Mostrar mi reputación', desc: 'Tu calificación promedio aparece en tu perfil.' },
  { key: 'contactoDirecto', titulo: 'Permitir contacto directo', desc: 'Las empresas pueden escribirte fuera de un proyecto.' },
];

// Porcentaje de completitud del perfil de empleabilidad (para el medidor).
export function completitudEmpleabilidad(e: Empleabilidad): number {
  const checks = [
    e.areas.length > 0,
    e.tecnologias.length > 0,
    e.modalidad !== 'indistinto',
    e.disponibilidadHoras !== null,
    !!e.fechaInicio,
    e.tipoProyecto.length > 0,
    e.pagoMin !== null || e.pagoMax !== null,
  ];
  const ok = checks.filter(Boolean).length;
  return Math.round((ok / checks.length) * 100);
}
