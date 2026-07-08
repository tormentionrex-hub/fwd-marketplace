export interface SugerenciaMejora {
  seccion: string;
  consejo: string;
  prioridad: 'alta' | 'media' | 'baja';
}

export interface ValidacionCv {
  tieneContacto: boolean;
  tieneResumen: boolean;
  tieneExperiencia: boolean;
  tieneEducacion: boolean;
  tieneHabilidades: boolean;
}

export interface AnalisisCv {
  score: number;
  mensajeGeneral: string;
  fortalezas: string[];
  sugerenciasMejora: SugerenciaMejora[];
  requiereCambiosUrgentes: boolean;
  validacion: ValidacionCv;
}
