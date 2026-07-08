// Tipos y catálogos compartidos (server + cliente) para la feature de Vacantes.
// No es `server-only`: se importa tanto en la UI como en la capa de servicios.

// ── Catálogos de campos de una vacante ──────────────────────────────────────

export const TIPOS_EMPLEO = [
  "tiempo_completo",
  "medio_tiempo",
  "por_proyecto",
  "pasantia",
  "freelance",
] as const;
export type TipoEmpleo = (typeof TIPOS_EMPLEO)[number];

export const TIPO_EMPLEO_LABEL: Record<TipoEmpleo, string> = {
  tiempo_completo: "Tiempo completo",
  medio_tiempo: "Medio tiempo",
  por_proyecto: "Por proyecto",
  pasantia: "Pasantía",
  freelance: "Freelance",
};

export const NIVELES_EXPERIENCIA = [
  "sin_experiencia",
  "junior",
  "semi_senior",
  "senior",
] as const;
export type NivelExperiencia = (typeof NIVELES_EXPERIENCIA)[number];

export const NIVEL_LABEL: Record<NivelExperiencia, string> = {
  sin_experiencia: "Sin experiencia",
  junior: "Junior",
  semi_senior: "Semi Senior",
  senior: "Senior",
};

export const PERIODOS_SALARIO = ["mensual", "por_hora", "por_proyecto"] as const;
export type PeriodoSalario = (typeof PERIODOS_SALARIO)[number];

export const PERIODO_SALARIO_LABEL: Record<PeriodoSalario, string> = {
  mensual: "por mes",
  por_hora: "por hora",
  por_proyecto: "por proyecto",
};

// ── Estados de la vacante ───────────────────────────────────────────────────
// Solo 'abierta' se muestra en el marketplace público.

export const ESTADOS_VACANTE = [
  "borrador",
  "abierta",
  "en_contratacion",
  "cerrada",
  "finalizada",
] as const;
export type EstadoVacante = (typeof ESTADOS_VACANTE)[number];

export const ESTADO_VACANTE_META: Record<
  EstadoVacante,
  { label: string; color: string; descripcion: string }
> = {
  borrador: { label: "Borrador", color: "#64748b", descripcion: "Aún no publicada" },
  abierta: { label: "Abierta", color: "#16a34a", descripcion: "Recibiendo postulaciones" },
  en_contratacion: { label: "En contratación", color: "#f7901e", descripcion: "En proceso de selección" },
  cerrada: { label: "Cerrada", color: "#64748b", descripcion: "Ya no recibe postulaciones" },
  finalizada: { label: "Finalizada", color: "#662d91", descripcion: "Proceso concluido" },
};

// ── Estados de la postulación ───────────────────────────────────────────────

export const ESTADOS_POSTULACION = [
  "pendiente",
  "en_revision",
  "aceptado",
  "rechazado",
  "retirada",
] as const;
export type EstadoPostulacion = (typeof ESTADOS_POSTULACION)[number];

// Estados que el empresario puede asignar a una postulación (no incluye 'retirada',
// que solo la fija el estudiante al retirarse).
export const ESTADOS_POSTULACION_EMPRESA = [
  "pendiente",
  "en_revision",
  "aceptado",
  "rechazado",
] as const;
export type EstadoPostulacionEmpresa = (typeof ESTADOS_POSTULACION_EMPRESA)[number];

export const ESTADO_POSTULACION_META: Record<
  EstadoPostulacion,
  { label: string; color: string }
> = {
  pendiente: { label: "Pendiente", color: "#64748b" },
  en_revision: { label: "En revisión", color: "#008fd5" },
  aceptado: { label: "Aceptado", color: "#16a34a" },
  rechazado: { label: "Rechazado", color: "#dc2626" },
  retirada: { label: "Retirada", color: "#94a3b8" },
};

// ── DTOs ────────────────────────────────────────────────────────────────────

// Vacante en el listado del marketplace (card).
export interface VacanteMarketplace {
  id: string;
  titulo: string;
  descripcion: string;
  area: string | null;
  modalidad: string | null;
  tipoEmpleo: string | null;
  nivelExperiencia: string | null;
  ubicacion: string | null;
  salarioMin: number | null;
  salarioMax: number | null;
  salarioMoneda: string;
  salarioPeriodo: string | null;
  salarioVisible: boolean;
  plazas: number;
  publicado: string | null;
  fechaCierre: string | null;
  tecnologias: string[];
  imagenes: string[];
  empresario: {
    id: string;
    nombre: string;
    nombreEmpresa: string | null;
    sector: string | null;
    /** Foto de perfil de la empresa (usuarios.image_url) o null. */
    fotoUrl: string | null;
  };
}

// Documento adjunto a una vacante (PDF/Word/Excel subido por la empresa).
export interface DocumentoVacante {
  nombre: string;
  url: string;
}

// Detalle completo de una vacante (ficha pública).
export interface VacanteDetalleDTO extends VacanteMarketplace {
  responsabilidades: string | null;
  requisitos: string | null;
  beneficios: string | null;
  estado: EstadoVacante;
  documentos: DocumentoVacante[];
  /** Descripción pública de la empresa (perfiles_empresario.descripcion). */
  empresaDescripcion: string | null;
}

// Vacante compacta para el bloque "Vacantes similares" del sidebar.
export interface VacanteSimilarDTO {
  id: string;
  titulo: string;
  empresa: string;
  area: string | null;
  modalidad: string | null;
  salario: string | null;
}

// Datos agregados del sidebar de la ficha de vacante.
export interface DatosSidebarVacante {
  totalPostulaciones: number;
  similares: VacanteSimilarDTO[];
}

// Vacante en el dashboard del empresario (lista con conteo de postulantes).
export interface VacanteEmpresarioDTO {
  id: string;
  titulo: string;
  area: string | null;
  modalidad: string | null;
  tipoEmpleo: string | null;
  estado: EstadoVacante;
  plazas: number;
  publicado: string | null;
  fechaCierre: string | null;
  totalPostulaciones: number;
}

// Postulación del estudiante en "Mis postulaciones".
export interface MiPostulacionDTO {
  id: string;
  estado: EstadoPostulacion;
  mensaje: string;
  fecha: string;
  vacante: {
    id: string;
    titulo: string;
    area: string | null;
    empresa: string;
    modalidad: string | null;
    tipoEmpleo: string | null;
    estado: EstadoVacante;
  };
}

// Postulante visto por el empresario en la gestión de una vacante.
export interface PostulanteDTO {
  id: string;
  estado: EstadoPostulacion;
  mensaje: string;
  cvUrl: string | null;
  fecha: string;
  estudiante: {
    id: string;
    nombre: string;
    imageUrl: string | null;
    tituloProfesional: string | null;
  };
}
