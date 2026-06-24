/**
 * Script de datos de demostración para FWD Marketplace.
 * Crea empresarios, estudiantes, proyectos, ofertas y evaluaciones realistas.
 *
 * Uso:  npx tsx prisma/seed-demo.ts
 *
 * Todos los usuarios se crean con contraseña:  Demo2024!
 * (Se puede cambiar la constante PASS abajo.)
 */

import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

const PASS = 'Demo2024!';

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('Obteniendo roles...');
  const roles = await prisma.roles.findMany();
  const rolEmpresario = roles.find((r) => r.nombre === 'empresario');
  const rolEstudiante = roles.find((r) => r.nombre === 'estudiante');
  if (!rolEmpresario || !rolEstudiante) {
    throw new Error('Roles empresario/estudiante no encontrados. Verifica la BD.');
  }

  // ── Tecnologías ─────────────────────────────────────────────────────────────
  console.log('Creando tecnologías...');
  const techs = await Promise.all(
    [
      'React', 'Next.js', 'Node.js', 'TypeScript', 'Python',
      'Flutter', 'Dart', 'TensorFlow', 'PostgreSQL', 'MongoDB',
      'Docker', 'FastAPI', 'Vue.js', 'Figma', 'GraphQL',
      'Tailwind CSS', 'Express.js', 'Prisma', 'Swift', 'Kotlin',
    ].map((nombre) =>
      prisma.tecnologias.upsert({
        where: { nombre },
        create: { nombre },
        update: {},
      }),
    ),
  );

  const tech = Object.fromEntries(techs.map((t) => [t.nombre, t.id]));

  // ── Empresarios ─────────────────────────────────────────────────────────────
  console.log('Creando empresarios...');

  const empresariosData = [
    {
      nombre: 'Ana González Picado',
      correo: 'ana.gonzalez@techcr.cr',
      empresa: 'TechCR S.A.',
      sector: 'Tecnología de Software',
      tipo: 'Sociedad Anónima',
      descripcion:
        'Empresa costarricense de desarrollo de software a medida para el mercado centroamericano. Especializada en soluciones web y móviles para el sector retail y logística.',
      cedula: '3-101-547821',
    },
    {
      nombre: 'Roberto Fernández Mora',
      correo: 'rfernandez@innovatica.cr',
      empresa: 'Innovatica Digital',
      sector: 'Marketing Digital',
      tipo: 'Sociedad de Responsabilidad Limitada',
      descripcion:
        'Agencia de transformación digital enfocada en e-learning, automatización de procesos y experiencias de usuario innovadoras.',
      cedula: '3-102-781234',
    },
    {
      nombre: 'Gabriela Salas Brenes',
      correo: 'gsalas@biosolutions.cr',
      empresa: 'BioSolutions CR',
      sector: 'Biotecnología',
      tipo: 'Empresa Individual de Responsabilidad Limitada',
      descripcion:
        'Empresa de biotecnología ambiental que desarrolla soluciones digitales para el monitoreo y conservación de la biodiversidad costarricense.',
      cedula: '3-103-219087',
    },
    {
      nombre: 'Luis Vargas Herrera',
      correo: 'lvargas@datalens.cr',
      empresa: 'DataLens Analytics',
      sector: 'Análisis de Datos',
      tipo: 'Sociedad Anónima',
      descripcion:
        'Consultora especializada en inteligencia de negocios, ciencia de datos y machine learning para empresas financieras y telecomunicaciones.',
      cedula: '3-101-982345',
    },
  ];

  const empresarios: Record<string, string> = {};

  for (const d of empresariosData) {
    const u = await prisma.usuarios.upsert({
      where: { correo: d.correo },
      create: {
        nombre: d.nombre,
        correo: d.correo,
        hash_contrasena: hashPassword(PASS),
        id_rol: rolEmpresario.id,
        estado: 'activo',
        edad: Math.floor(Math.random() * 15) + 30,
      },
      update: {},
    });
    await prisma.perfiles_empresario.upsert({
      where: { id_usuario: u.id },
      create: {
        id_usuario: u.id,
        nombre_empresa: d.empresa,
        sector: d.sector,
        tipo: d.tipo,
        descripcion: d.descripcion,
        numero_identificacion: d.cedula,
        reputacion: 0,
      },
      update: {},
    });
    empresarios[d.empresa] = u.id;
    console.log(`  Empresario: ${d.nombre} (${d.empresa})`);
  }

  // ── Estudiantes ──────────────────────────────────────────────────────────────
  console.log('Creando estudiantes...');

  const estudiantesData = [
    {
      nombre: 'Andrés Mora Quesada',
      correo: 'andres.mora@est.fwd.cr',
      titulo: 'Desarrollo Web Full Stack',
      descripcion:
        'Estudiante de Ingeniería en Computación en el TEC. Apasionado por las tecnologías web modernas y el desarrollo de APIs escalables.',
      edad: 22,
      generacion: 5,
      reputacion: 87,
      totalCalificaciones: 3,
      habilidades: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    },
    {
      nombre: 'Valeria Jiménez Solano',
      correo: 'valeria.jimenez@est.fwd.cr',
      titulo: 'Ciencia de Datos e Inteligencia Artificial',
      descripcion:
        'Estudiante de último año de Estadística en la UCR. Especializada en machine learning aplicado y visualización de datos.',
      edad: 21,
      generacion: 5,
      reputacion: 93,
      totalCalificaciones: 4,
      habilidades: ['Python', 'TensorFlow', 'PostgreSQL', 'FastAPI'],
    },
    {
      nombre: 'Diego Castro Ulate',
      correo: 'diego.castro@est.fwd.cr',
      titulo: 'Desarrollo de Aplicaciones Móviles',
      descripcion:
        'Desarrollador móvil con experiencia en Flutter y Kotlin. Ha participado en 3 proyectos FWD y cuenta con un portafolio sólido en Play Store.',
      edad: 23,
      generacion: 4,
      reputacion: 78,
      totalCalificaciones: 2,
      habilidades: ['Flutter', 'Dart', 'Kotlin', 'Firebase'],
    },
    {
      nombre: 'Sofía Rodríguez Barrantes',
      correo: 'sofia.rodriguez@est.fwd.cr',
      titulo: 'Diseño UX/UI y Experiencia de Usuario',
      descripcion:
        'Diseñadora graduada de la UNA con especialización en research de usuarios e interfaces accesibles. Maneja Figma y sistemas de diseño.',
      edad: 22,
      generacion: 5,
      reputacion: 82,
      totalCalificaciones: 2,
      habilidades: ['Figma', 'React', 'Tailwind CSS', 'Vue.js'],
    },
    {
      nombre: 'Carlos Obando Fallas',
      correo: 'carlos.obando@est.fwd.cr',
      titulo: 'Ingeniería de Backend y Arquitectura Cloud',
      descripcion:
        'Estudiante de Ingeniería en Sistemas en la UNED. Experiencia en microservicios, contenedores Docker y APIs REST de alto rendimiento.',
      edad: 24,
      generacion: 4,
      reputacion: 71,
      totalCalificaciones: 2,
      habilidades: ['Node.js', 'Docker', 'PostgreSQL', 'Express.js'],
    },
    {
      nombre: 'María Fernanda Vargas Torres',
      correo: 'mfvargas@est.fwd.cr',
      titulo: 'Machine Learning e Ingeniería de Datos',
      descripcion:
        'Estudiante de Matemáticas aplicadas en la UCR. Desarrolla modelos predictivos y pipelines de datos para el sector financiero.',
      edad: 21,
      generacion: 5,
      reputacion: 96,
      totalCalificaciones: 5,
      habilidades: ['Python', 'TensorFlow', 'FastAPI', 'MongoDB'],
    },
    {
      nombre: 'Joshua Méndez Elizondo',
      correo: 'joshua.mendez@est.fwd.cr',
      titulo: 'Desarrollo Frontend y Diseño de Interfaces',
      descripcion:
        'Apasionado del frontend moderno. Trabaja con React, animaciones GSAP y accesibilidad web. Actualmente en tercer año del TEC.',
      edad: 20,
      generacion: 6,
      reputacion: 65,
      totalCalificaciones: 1,
      habilidades: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    },
    {
      nombre: 'Camila Arce Badilla',
      correo: 'camila.arce@est.fwd.cr',
      titulo: 'Ingeniería de Software y QA',
      descripcion:
        'Especializada en pruebas automatizadas, integración continua y aseguramiento de la calidad de software. Estudiante del ITCR.',
      edad: 23,
      generacion: 4,
      reputacion: 59,
      totalCalificaciones: 1,
      habilidades: ['TypeScript', 'Node.js', 'Docker', 'GraphQL'],
    },
  ];

  const estudiantes: Record<string, string> = {};

  for (const d of estudiantesData) {
    const u = await prisma.usuarios.upsert({
      where: { correo: d.correo },
      create: {
        nombre: d.nombre,
        correo: d.correo,
        hash_contrasena: hashPassword(PASS),
        id_rol: rolEstudiante.id,
        estado: 'activo',
        edad: d.edad,
      },
      update: {},
    });

    await prisma.perfiles_estudiante.upsert({
      where: { id_usuario: u.id },
      create: {
        id_usuario: u.id,
        titulo_profesional: d.titulo,
        descripcion: d.descripcion,
        estado_verificacion: 'verificado',
        reputacion: d.reputacion,
        total_calificaciones: d.totalCalificaciones,
        generacion_fwd: d.generacion,
      },
      update: {
        reputacion: d.reputacion,
        total_calificaciones: d.totalCalificaciones,
      },
    });

    // Habilidades
    for (const habilidadNombre of d.habilidades) {
      let habilidad = await prisma.habilidades.findFirst({
        where: { nombre: habilidadNombre },
      });
      if (!habilidad) {
        habilidad = await prisma.habilidades.create({
          data: { nombre: habilidadNombre, categoria: 'Tecnología' },
        });
      }
      await prisma.estudiantes_habilidades.upsert({
        where: { id_usuario_id_habilidad: { id_usuario: u.id, id_habilidad: habilidad.id } },
        create: { id_usuario: u.id, id_habilidad: habilidad.id, nivel: 'intermedio' },
        update: {},
      });
    }

    estudiantes[d.nombre] = u.id;
    console.log(`  Estudiante: ${d.nombre}`);
  }

  // ── Proyectos CERRADOS (con evaluaciones, para el ranking) ───────────────────
  console.log('Creando proyectos cerrados...');

  type ProyectoSeed = {
    titulo: string;
    descripcion: string;
    area: string;
    plazoDias: number;
    empresario: string;
    techs: string[];
    adjudicadoA: string;
    puntuacion: number;
    comentario: string;
    diasAtras: number;
    otrasOfertas: string[];
  };

  const proyectosCerrados: ProyectoSeed[] = [
    {
      titulo: 'Sistema de Gestión de Inventario Web',
      descripcion:
        'Desarrollar una plataforma web para la gestión en tiempo real del inventario de sucursales, con reportes automáticos, alertas de stock mínimo y módulo de compras integrado. El sistema debe manejar múltiples bodegas y soportar hasta 50.000 SKUs.',
      area: 'Logística y Supply Chain',
      plazoDias: 45,
      empresario: 'TechCR S.A.',
      techs: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      adjudicadoA: 'Andrés Mora Quesada',
      puntuacion: 5,
      comentario:
        'Andrés entregó un trabajo excepcional. El sistema superó nuestras expectativas en rendimiento y la documentación fue impecable.',
      diasAtras: 60,
      otrasOfertas: ['Valeria Jiménez Solano', 'Carlos Obando Fallas'],
    },
    {
      titulo: 'App de Identificación de Fauna Costarricense',
      descripcion:
        'Aplicación móvil con reconocimiento de imágenes para identificar especies de fauna costarricense en campo. Debe funcionar offline, tener base de datos de 800+ especies y permitir al usuario contribuir con avistamientos geolocalizados.',
      area: 'Conservación Ambiental',
      plazoDias: 60,
      empresario: 'BioSolutions CR',
      techs: ['Flutter', 'Dart', 'TensorFlow', 'Python'],
      adjudicadoA: 'Valeria Jiménez Solano',
      puntuacion: 5,
      comentario:
        'El modelo de reconocimiento alcanzó un 94% de precisión en las pruebas de campo. Valeria demostró un dominio técnico sobresaliente y una comunicación excelente durante todo el proyecto.',
      diasAtras: 90,
      otrasOfertas: ['María Fernanda Vargas Torres', 'Diego Castro Ulate'],
    },
    {
      titulo: 'Portal Digital de Recursos Humanos',
      descripcion:
        'Portal web para la gestión integral de RRHH: onboarding de colaboradores, control de vacaciones, evaluaciones de desempeño y reportes gerenciales. Integración con sistemas de planilla existentes vía API.',
      area: 'Recursos Humanos',
      plazoDias: 50,
      empresario: 'Innovatica Digital',
      techs: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      adjudicadoA: 'Diego Castro Ulate',
      puntuacion: 4,
      comentario:
        'Buen trabajo en general. La integración con la planilla tomó más tiempo del estimado pero Diego lo resolvió con profesionalismo. Recomendable.',
      diasAtras: 45,
      otrasOfertas: ['Andrés Mora Quesada', 'Sofía Rodríguez Barrantes'],
    },
    {
      titulo: 'Modelo Predictivo de Retención de Clientes',
      descripcion:
        'Desarrollar un modelo de machine learning que prediga el abandono de clientes en una empresa de telecomunicaciones. Incluye pipeline de datos desde BigQuery, dashboard interactivo de resultados y API de inferencia en tiempo real.',
      area: 'Ciencia de Datos',
      plazoDias: 40,
      empresario: 'DataLens Analytics',
      techs: ['Python', 'TensorFlow', 'FastAPI', 'PostgreSQL'],
      adjudicadoA: 'María Fernanda Vargas Torres',
      puntuacion: 5,
      comentario:
        'El modelo alcanzó un AUC de 0.91 en producción. María Fernanda entregó código limpio, bien documentado y el dashboard es exactamente lo que necesitábamos. Excelente.',
      diasAtras: 30,
      otrasOfertas: ['Valeria Jiménez Solano', 'Carlos Obando Fallas'],
    },
    {
      titulo: 'Rediseño de Experiencia de Usuario para App Financiera',
      descripcion:
        'Rediseño completo de la experiencia de usuario de una aplicación fintech costarricense. Research con usuarios reales, prototipos interactivos en Figma, sistema de diseño y handoff a desarrollo.',
      area: 'Diseño y Experiencia de Usuario',
      plazoDias: 30,
      empresario: 'DataLens Analytics',
      techs: ['Figma', 'React', 'Tailwind CSS'],
      adjudicadoA: 'Sofía Rodríguez Barrantes',
      puntuacion: 4,
      comentario:
        'Sofía entregó un sistema de diseño muy bien estructurado. El research de usuarios aportó insights valiosos que no teníamos contemplados.',
      diasAtras: 20,
      otrasOfertas: ['Joshua Méndez Elizondo'],
    },
  ];

  const proyectoIds: string[] = [];

  for (const p of proyectosCerrados) {
    const idEmpresario = empresarios[p.empresario];
    if (!idEmpresario) continue;

    // Crear o reusar el proyecto
    const existing = await prisma.proyectos.findFirst({
      where: { titulo: p.titulo, id_empresario: idEmpresario },
      select: { id: true, publicado: true },
    });

    const techIds = await Promise.all(
      p.techs.map((nombre) =>
        prisma.tecnologias.upsert({
          where: { nombre },
          create: { nombre },
          update: {},
          select: { id: true },
        }),
      ),
    );

    let proyecto: { id: string };
    let publicado: Date;
    let cierre: Date;

    if (existing) {
      proyecto = existing;
      cierre = daysAgo(p.diasAtras);
      publicado = existing.publicado ?? new Date(cierre.getTime() - p.plazoDias * 24 * 60 * 60 * 1000);
      proyectoIds.push(existing.id);
      console.log(`  [skip] Proyecto cerrado ya existe: ${p.titulo}`);
    } else {
      cierre = daysAgo(p.diasAtras);
      publicado = new Date(cierre);
      publicado.setDate(publicado.getDate() - p.plazoDias);

      proyecto = await prisma.proyectos.create({
        data: {
          id_empresario: idEmpresario,
          titulo: p.titulo,
          descripcion: p.descripcion,
          area_negocio: p.area,
          plazo_dias: p.plazoDias,
          estado: 'cerrado',
          publicado,
          cierre,
          proyectos_tecnologias: {
            create: techIds.map((t) => ({ id_tecnologia: t.id })),
          },
        },
      });

      proyectoIds.push(proyecto.id);
      console.log(`  Proyecto cerrado: ${p.titulo}`);
    }

    const idAdjudicado = estudiantes[p.adjudicadoA];
    if (!idAdjudicado) continue;

    // Oferta adjudicada
    await prisma.ofertas.upsert({
      where: { id_proyecto_id_estudiante: { id_proyecto: proyecto.id, id_estudiante: idAdjudicado } },
      create: {
        id_proyecto: proyecto.id,
        id_estudiante: idAdjudicado,
        propuesta: `Me postulo para este proyecto con una propuesta enfocada en calidad y entrega puntual. Tengo experiencia en ${p.techs.slice(0, 2).join(' y ')} y puedo completar el trabajo en el plazo indicado con documentación completa y pruebas unitarias.`,
        estado: 'adjudicada',
        enviado: new Date(publicado.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      update: {},
    });

    // Otras ofertas rechazadas
    for (const otroEstudiante of p.otrasOfertas) {
      const idOtro = estudiantes[otroEstudiante];
      if (!idOtro) continue;
      await prisma.ofertas.upsert({
        where: { id_proyecto_id_estudiante: { id_proyecto: proyecto.id, id_estudiante: idOtro } },
        create: {
          id_proyecto: proyecto.id,
          id_estudiante: idOtro,
          propuesta: `Tengo habilidades sólidas en ${p.techs[0]} y puedo aportar valor significativo a este proyecto. Mi enfoque es iterativo y mantengo comunicación constante con el cliente.`,
          estado: 'rechazada',
          enviado: new Date(publicado.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
        update: {},
      });
    }

    // Evaluación del empresario al estudiante
    await prisma.evaluaciones.upsert({
      where: { id_proyecto_id_estudiante_id_empresario: { id_proyecto: proyecto.id, id_estudiante: idAdjudicado, id_empresario: idEmpresario } },
      create: {
        id_proyecto: proyecto.id,
        id_estudiante: idAdjudicado,
        id_empresario: idEmpresario,
        puntuacion: p.puntuacion,
        comentario: p.comentario,
        creado: cierre,
      },
      update: {},
    });

    // Actualizar reputacion y total_calificaciones del estudiante
    const perfil = await prisma.perfiles_estudiante.findUnique({
      where: { id_usuario: idAdjudicado },
      select: { reputacion: true, total_calificaciones: true },
    });
    if (perfil) {
      const nuevaRep = Math.round(
        ((perfil.reputacion * perfil.total_calificaciones + p.puntuacion) /
          (perfil.total_calificaciones + 1)) * 10 / 10,
      );
      // Ya seteamos reputacion directamente en los datos iniciales
    }
  }

  // ── Proyectos PUBLICADOS (activos en marketplace) ────────────────────────────
  console.log('Creando proyectos publicados...');

  type ProyectoPublicadoSeed = {
    titulo: string;
    descripcion: string;
    area: string;
    plazoDias: number;
    empresario: string;
    techs: string[];
    ofertas: { estudiante: string; propuesta: string }[];
    diasAtras: number;
  };

  const proyectosPublicados: ProyectoPublicadoSeed[] = [
    {
      titulo: 'App Móvil de Delivery para Restaurantes',
      descripcion:
        'Plataforma móvil completa para restaurantes medianos: app de cliente (iOS/Android), panel de cocina en tiempo real y módulo de repartidores con GPS. Integración con pasarela de pagos local (SINPE Móvil) y sistema de calificaciones.',
      area: 'Gastronomía y Delivery',
      plazoDias: 55,
      empresario: 'TechCR S.A.',
      techs: ['Flutter', 'Dart', 'Node.js', 'MongoDB'],
      diasAtras: 5,
      ofertas: [
        {
          estudiante: 'Diego Castro Ulate',
          propuesta:
            'Tengo experiencia publicando apps en Flutter en ambas tiendas. Puedo entregar el MVP en 4 semanas y el producto completo en el plazo indicado. Incluiré pruebas automatizadas y CI/CD desde el inicio.',
        },
        {
          estudiante: 'Joshua Méndez Elizondo',
          propuesta:
            'He desarrollado 2 apps móviles con Flutter en mi carrera en el TEC. Me enfocaría en la experiencia de usuario del módulo de cliente y la integración con SINPE Móvil, que conozco bien.',
        },
        {
          estudiante: 'Andrés Mora Quesada',
          propuesta:
            'Aunque mi stack principal es web, tengo conocimiento de Flutter y puedo adaptar rápidamente. Mi fortaleza estaría en el backend Node.js y la arquitectura del sistema de pedidos en tiempo real.',
        },
      ],
    },
    {
      titulo: 'Plataforma E-learning con Inteligencia Artificial',
      descripcion:
        'Plataforma de cursos online con recomendaciones personalizadas mediante IA, generación automática de quizzes a partir del contenido de los cursos, y análisis de progreso del estudiante. Incluye módulo de videoconferencia integrado.',
      area: 'Educación y E-learning',
      plazoDias: 60,
      empresario: 'Innovatica Digital',
      techs: ['Next.js', 'Python', 'TensorFlow', 'PostgreSQL'],
      diasAtras: 8,
      ofertas: [
        {
          estudiante: 'María Fernanda Vargas Torres',
          propuesta:
            'Tengo experiencia en modelos de recomendación y NLP. Puedo desarrollar el motor de IA de la plataforma usando transformers y embeddings semánticos para los quizzes automáticos.',
        },
        {
          estudiante: 'Valeria Jiménez Solano',
          propuesta:
            'Mi experiencia en machine learning aplicado a datos educativos me permitiría construir un sistema de recomendación efectivo. También tengo conocimiento en análisis de secuencias de aprendizaje.',
        },
        {
          estudiante: 'Andrés Mora Quesada',
          propuesta:
            'Me centraría en el frontend con Next.js y la integración del módulo de videoconferencia. Tengo experiencia con WebRTC y puedo entregar una experiencia de usuario fluida.',
        },
      ],
    },
    {
      titulo: 'Dashboard de Análisis de Ventas en Tiempo Real',
      descripcion:
        'Sistema de business intelligence con dashboards interactivos para monitoreo de ventas en tiempo real. Integración con múltiples fuentes de datos (POS, CRM, ERP), alertas automatizadas y reportes ejecutivos exportables en PDF/Excel.',
      area: 'Business Intelligence',
      plazoDias: 35,
      empresario: 'DataLens Analytics',
      techs: ['React', 'Python', 'FastAPI', 'PostgreSQL'],
      diasAtras: 3,
      ofertas: [
        {
          estudiante: 'Valeria Jiménez Solano',
          propuesta:
            'Mi especialización en visualización de datos y análisis estadístico es ideal para este proyecto. Trabajaría con D3.js o Recharts para los dashboards y Python para los conectores de datos.',
        },
        {
          estudiante: 'Carlos Obando Fallas',
          propuesta:
            'Tengo experiencia construyendo APIs de alto rendimiento con Node.js y PostgreSQL. Me enfocaría en la arquitectura de ingesta de datos en tiempo real y la API de consultas optimizadas.',
        },
      ],
    },
    {
      titulo: 'API de Integración con Ecosistema Bancario Nacional',
      descripcion:
        'Desarrollar una capa de integración segura con las APIs del sistema bancario costarricense (BCCR, SINPE). La solución debe manejar autenticación OAuth 2.0, rate limiting, cifrado en tránsito y logs de auditoría completos para cumplimiento regulatorio.',
      area: 'Fintech y Servicios Financieros',
      plazoDias: 45,
      empresario: 'TechCR S.A.',
      techs: ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL'],
      diasAtras: 10,
      ofertas: [
        {
          estudiante: 'Carlos Obando Fallas',
          propuesta:
            'Tengo conocimiento de los estándares de seguridad financiera y experiencia con microservicios en Docker. Puedo diseñar una arquitectura robusta con circuit breakers y logging de auditoría.',
        },
        {
          estudiante: 'Andrés Mora Quesada',
          propuesta:
            'He trabajado con OAuth 2.0 e integraciones de terceros en proyectos anteriores. Me enfocaría en la documentación OpenAPI y las pruebas de integración automáticas.',
        },
        {
          estudiante: 'Camila Arce Badilla',
          propuesta:
            'Mi especialización en QA y pruebas automatizadas sería valiosa para un sistema de esta criticidad. Garantizaría cobertura completa de pruebas y revisión de seguridad de la API.',
        },
      ],
    },
    {
      titulo: 'Sistema de Monitoreo de Biodiversidad con IoT',
      descripcion:
        'Plataforma web para recibir, almacenar y visualizar datos de sensores IoT instalados en reservas naturales. Incluye mapas interactivos con heatmaps de actividad, alertas de intrusión y reportes para investigadores.',
      area: 'Conservación y Tecnología Ambiental',
      plazoDias: 50,
      empresario: 'BioSolutions CR',
      techs: ['Vue.js', 'Python', 'MongoDB', 'FastAPI'],
      diasAtras: 7,
      ofertas: [
        {
          estudiante: 'María Fernanda Vargas Torres',
          propuesta:
            'El manejo de series temporales de sensores y la construcción de pipelines de datos para IoT es exactamente mi área. Puedo implementar la detección de anomalías con modelos ligeros que funcionen en tiempo real.',
        },
        {
          estudiante: 'Sofía Rodríguez Barrantes',
          propuesta:
            'Me enfocaría en los mapas interactivos y los dashboards para investigadores. Tengo experiencia con Mapbox GL y diseño de visualizaciones de datos complejos que sean intuitivas para usuarios no técnicos.',
        },
      ],
    },
    {
      titulo: 'Marketplace Interno de Habilidades Corporativas',
      descripcion:
        'Plataforma interna para que los colaboradores de una empresa ofrezcan y demanden habilidades entre sí (mentoría, talleres, consultas). Incluye sistema de puntos, perfiles de habilidades, calendario de sesiones y feedback post-sesión.',
      area: 'Gestión del Conocimiento',
      plazoDias: 40,
      empresario: 'Innovatica Digital',
      techs: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      diasAtras: 12,
      ofertas: [
        {
          estudiante: 'Andrés Mora Quesada',
          propuesta:
            'Este proyecto combina mis habilidades en Next.js y diseño de bases de datos relacionales. Puedo construir el sistema de puntos y matching de habilidades de forma eficiente y escalable.',
        },
        {
          estudiante: 'Sofía Rodríguez Barrantes',
          propuesta:
            'Diseñaría primero la experiencia de usuario con un proceso de investigación rápido para validar los flujos de mentoría y sesiones antes de implementar. La interfaz sería clave para la adopción interna.',
        },
        {
          estudiante: 'Joshua Méndez Elizondo',
          propuesta:
            'Tengo experiencia en interfaces web interactivas con React y animaciones. El módulo de calendario y el sistema de feedback serían mi fortaleza principal en este proyecto.',
        },
      ],
    },
  ];

  for (const p of proyectosPublicados) {
    const idEmpresario = empresarios[p.empresario];
    if (!idEmpresario) continue;

    const existing = await prisma.proyectos.findFirst({
      where: { titulo: p.titulo, id_empresario: idEmpresario },
      select: { id: true, publicado: true },
    });
    if (existing) {
      console.log(`  [skip] Proyecto publicado ya existe: ${p.titulo}`);
      continue;
    }

    const techIds = await Promise.all(
      p.techs.map((nombre) =>
        prisma.tecnologias.upsert({
          where: { nombre },
          create: { nombre },
          update: {},
          select: { id: true },
        }),
      ),
    );

    const publicado = daysAgo(p.diasAtras);

    const proyecto = await prisma.proyectos.create({
      data: {
        id_empresario: idEmpresario,
        titulo: p.titulo,
        descripcion: p.descripcion,
        area_negocio: p.area,
        plazo_dias: p.plazoDias,
        estado: 'publicado',
        publicado,
        proyectos_tecnologias: {
          create: techIds.map((t) => ({ id_tecnologia: t.id })),
        },
      },
    });

    console.log(`  Proyecto publicado: ${p.titulo}`);

    for (const o of p.ofertas) {
      const idEstudiante = estudiantes[o.estudiante];
      if (!idEstudiante) continue;

      await prisma.ofertas.upsert({
        where: { id_proyecto_id_estudiante: { id_proyecto: proyecto.id, id_estudiante: idEstudiante } },
        create: {
          id_proyecto: proyecto.id,
          id_estudiante: idEstudiante,
          propuesta: o.propuesta,
          estado: 'pendiente',
          enviado: new Date(publicado.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000),
        },
        update: {},
      });
    }
  }

  // ── Resumen ──────────────────────────────────────────────────────────────────
  const totalUsuarios = await prisma.usuarios.count();
  const totalProyectos = await prisma.proyectos.count();
  const totalOfertas = await prisma.ofertas.count();
  const totalEvaluaciones = await prisma.evaluaciones.count();

  console.log('\n========================================');
  console.log('  Seed de demostración completado');
  console.log('========================================');
  console.log(`  Usuarios en BD:      ${totalUsuarios}`);
  console.log(`  Proyectos en BD:     ${totalProyectos}`);
  console.log(`  Ofertas en BD:       ${totalOfertas}`);
  console.log(`  Evaluaciones en BD:  ${totalEvaluaciones}`);
  console.log('');
  console.log(`  Contraseña de todos los usuarios demo: ${PASS}`);
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
