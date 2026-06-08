// Datos de prueba en español para maquetar y programar la lógica sin base de datos.
// Fechas pensadas con "hoy" ~ 2026-06-05 para distinguir plazos futuros y vencidos.

import type {
  Usuario,
  Proyecto,
  Oferta,
  Entregable,
  Mensaje,
} from '@/types';

// === Usuarios: 2 empresarios + 3 estudiantes ===
export const usuarios: Usuario[] = [
  { id: 'emp-1', nombre: 'Constructora del Valle S.A.', rol: 'empresario' },
  { id: 'emp-2', nombre: 'AgroTech Misiones', rol: 'empresario' },
  { id: 'est-1', nombre: 'Lucía Fernández', rol: 'estudiante' },
  { id: 'est-2', nombre: 'Martín Gómez', rol: 'estudiante' },
  { id: 'est-3', nombre: 'Sofía Ramírez', rol: 'estudiante' },
];

// === Proyectos: uno por cada escenario que prueban las páginas ===
export const proyectos: Proyecto[] = [
  // P-1: publicado, plazo FUTURO, varias ofertas 'enviada' (Página 14 fase 1 y Página 10)
  {
    id: 'proy-1',
    titulo: 'App móvil para gestión de obras',
    descripcion:
      'Necesitamos una aplicación móvil para registrar el avance diario de las obras, con fotos y reportes por etapa.',
    requerimientos: [
      'React Native o Flutter',
      'Carga de fotos desde el celular',
      'Reportes en PDF',
    ],
    empresarioId: 'emp-1',
    estado: 'publicado',
    fechaCreacion: '2026-05-20T10:00:00.000Z',
    fechaLimite: '2026-07-15T23:59:00.000Z', // futuro
    presupuesto: 350000,
  },

  // P-2: publicado, plazo YA VENCIDO (Página 10 debe bloquear el envío)
  {
    id: 'proy-2',
    titulo: 'Sitio web institucional',
    descripcion:
      'Rediseño del sitio web institucional con sección de noticias y formulario de contacto.',
    requerimientos: ['Next.js', 'Diseño responsivo', 'Panel para cargar noticias'],
    empresarioId: 'emp-1',
    estado: 'publicado',
    fechaCreacion: '2026-04-01T09:00:00.000Z',
    fechaLimite: '2026-05-10T23:59:00.000Z', // vencido
    presupuesto: 200000,
  },

  // P-3: publicado, est-1 YA envió oferta (probar "no permitir segunda oferta")
  {
    id: 'proy-3',
    titulo: 'Sistema de turnos para consultorio',
    descripcion:
      'Sistema web para que los pacientes reserven turnos online y el consultorio los administre.',
    requerimientos: ['Calendario de turnos', 'Recordatorios por email', 'Roles de acceso'],
    empresarioId: 'emp-2',
    estado: 'publicado',
    fechaCreacion: '2026-05-15T11:00:00.000Z',
    fechaLimite: '2026-07-01T23:59:00.000Z', // futuro
    presupuesto: 280000,
  },

  // P-4: en_desarrollo (adjudicado a est-2), con entregables y chat
  {
    id: 'proy-4',
    titulo: 'Dashboard de ventas en tiempo real',
    descripcion:
      'Tablero para visualizar ventas en tiempo real con filtros por sucursal y exportación de datos.',
    requerimientos: ['Gráficos interactivos', 'Filtros por sucursal', 'Exportar a Excel'],
    empresarioId: 'emp-2',
    estado: 'en_desarrollo',
    fechaCreacion: '2026-03-10T08:00:00.000Z',
    fechaLimite: '2026-04-01T23:59:00.000Z',
    presupuesto: 420000,
    adjudicadaOfertaId: 'ofe-5',
    estudianteAdjudicadoId: 'est-2',
  },

  // P-5: cerrado, con calificación al estudiante
  {
    id: 'proy-5',
    titulo: 'Landing page para campaña agrícola',
    descripcion:
      'Página de aterrizaje para una campaña de venta de semillas, con formulario de leads.',
    requerimientos: ['Diseño atractivo', 'Formulario de contacto', 'Optimización SEO'],
    empresarioId: 'emp-1',
    estado: 'cerrado',
    fechaCreacion: '2026-01-12T08:00:00.000Z',
    fechaLimite: '2026-02-01T23:59:00.000Z',
    presupuesto: 150000,
    adjudicadaOfertaId: 'ofe-7',
    estudianteAdjudicadoId: 'est-3',
    calificacionEstudiante: 5,
  },

  // P-6: borrador (aún no publicado) del empresario emp-1
  {
    id: 'proy-6',
    titulo: 'Chatbot de atención al cliente',
    descripcion: 'Borrador inicial para un asistente automático de atención al cliente.',
    requerimientos: ['Integración con WhatsApp'],
    empresarioId: 'emp-1',
    estado: 'borrador',
    fechaCreacion: '2026-06-02T15:00:00.000Z',
    fechaLimite: '2026-08-01T23:59:00.000Z',
  },
];

// === Ofertas ===
export const ofertas: Oferta[] = [
  // P-1: varias ofertas 'enviada', con y sin prototipo, algunas con calificación
  {
    id: 'ofe-1',
    proyectoId: 'proy-1',
    estudianteId: 'est-1',
    propuesta:
      'Propongo desarrollar la app en Flutter con sincronización offline para usar en obra sin señal.',
    prototipoUrl: 'https://www.figma.com/proto/app-obras-lucia',
    estado: 'enviada',
    calificacion: 4,
    fechaEnvio: '2026-05-25T14:00:00.000Z',
  },
  {
    id: 'ofe-2',
    proyectoId: 'proy-1',
    estudianteId: 'est-2',
    propuesta:
      'Desarrollo en React Native con generación de reportes en PDF y panel de administración web.',
    prototipoArchivoNombre: 'prototipo-app-obras.pdf',
    documentoUrl: 'https://drive.example.com/doc-martin',
    estado: 'enviada',
    fechaEnvio: '2026-05-26T09:30:00.000Z',
  },
  {
    id: 'ofe-3',
    proyectoId: 'proy-1',
    estudianteId: 'est-3',
    propuesta: 'Puedo entregar la app en 6 semanas con foco en la carga rápida de fotos.',
    estado: 'enviada',
    calificacion: 3,
    fechaEnvio: '2026-05-27T18:10:00.000Z',
  },

  // P-3: est-1 YA tiene una oferta enviada (bloqueo de segunda oferta)
  {
    id: 'ofe-4',
    proyectoId: 'proy-3',
    estudianteId: 'est-1',
    propuesta:
      'Sistema de turnos con calendario semanal y recordatorios automáticos por email.',
    prototipoUrl: 'https://www.figma.com/proto/turnos-lucia',
    estado: 'enviada',
    fechaEnvio: '2026-05-28T12:00:00.000Z',
  },

  // P-4: oferta adjudicada (est-2) + otra rechazada
  {
    id: 'ofe-5',
    proyectoId: 'proy-4',
    estudianteId: 'est-2',
    propuesta:
      'Dashboard con gráficos en tiempo real usando WebSockets y exportación a Excel.',
    prototipoArchivoNombre: 'mockup-dashboard.fig',
    estado: 'adjudicada',
    calificacion: 5,
    fechaEnvio: '2026-03-12T10:00:00.000Z',
  },
  {
    id: 'ofe-6',
    proyectoId: 'proy-4',
    estudianteId: 'est-3',
    propuesta: 'Propuesta con actualización cada 5 minutos en lugar de tiempo real.',
    estado: 'rechazada',
    fechaEnvio: '2026-03-13T16:30:00.000Z',
  },

  // P-5: oferta adjudicada y cerrada (est-3)
  {
    id: 'ofe-7',
    proyectoId: 'proy-5',
    estudianteId: 'est-3',
    propuesta: 'Landing optimizada para SEO con formulario integrado a planilla de leads.',
    prototipoUrl: 'https://www.figma.com/proto/landing-sofia',
    estado: 'adjudicada',
    calificacion: 5,
    fechaEnvio: '2026-01-15T11:00:00.000Z',
  },
];

// === Entregables (todos del proyecto en_desarrollo proy-4) ===
export const entregables: Entregable[] = [
  // Hito 1 con historial de versiones: v1 pidió cambios, v2 aprobado
  {
    id: 'ent-1',
    proyectoId: 'proy-4',
    estudianteId: 'est-2',
    tipo: 'hito',
    titulo: 'Hito 1 — Estructura de datos y conexión',
    version: 1,
    archivoNombre: 'hito1-v1.zip',
    estado: 'cambios_solicitados',
    comentarioEmpresario:
      'Falta incluir el filtro por sucursal. Por favor agregarlo antes de continuar.',
    fecha: '2026-03-18T09:00:00.000Z',
  },
  {
    id: 'ent-2',
    proyectoId: 'proy-4',
    estudianteId: 'est-2',
    tipo: 'hito',
    titulo: 'Hito 1 — Estructura de datos y conexión',
    version: 2,
    archivoNombre: 'hito1-v2.zip',
    estado: 'aprobado',
    fecha: '2026-03-25T14:30:00.000Z',
  },
  // Hito 2 recién enviado, a la espera de revisión
  {
    id: 'ent-3',
    proyectoId: 'proy-4',
    estudianteId: 'est-2',
    tipo: 'hito',
    titulo: 'Hito 2 — Gráficos en tiempo real',
    version: 1,
    archivoUrl: 'https://drive.example.com/hito2-dashboard',
    estado: 'enviado',
    fecha: '2026-04-05T17:00:00.000Z',
  },
  // Entregable final enviado
  {
    id: 'ent-4',
    proyectoId: 'proy-4',
    estudianteId: 'est-2',
    tipo: 'final',
    titulo: 'Entrega final — Dashboard completo',
    version: 1,
    archivoNombre: 'dashboard-final.zip',
    estado: 'enviado',
    fecha: '2026-04-20T10:00:00.000Z',
  },
];

// === Mensajes (chat del proyecto en_desarrollo proy-4) ===
export const mensajes: Mensaje[] = [
  {
    id: 'msg-1',
    proyectoId: 'proy-4',
    emisorId: 'emp-2',
    emisorRol: 'empresario',
    contenido: 'Hola Martín, ¿cómo va el avance del primer hito?',
    fecha: '2026-03-16T09:00:00.000Z',
  },
  {
    id: 'msg-2',
    proyectoId: 'proy-4',
    emisorId: 'est-2',
    emisorRol: 'estudiante',
    contenido: 'Hola! Voy bien, mañana subo la primera versión para que la revises.',
    fecha: '2026-03-16T09:15:00.000Z',
  },
  {
    id: 'msg-3',
    proyectoId: 'proy-4',
    emisorId: 'emp-2',
    emisorRol: 'empresario',
    contenido: 'Perfecto. Recordá incluir el filtro por sucursal, es clave para nosotros.',
    fecha: '2026-03-16T09:20:00.000Z',
  },
];
