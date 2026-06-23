import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks declarados antes de cualquier import de modulos del proyecto ────────

// server-only lanza un error fuera del runtime de Next — lo silenciamos.
vi.mock('server-only', () => ({}));

// Dependencias externas que no deben ejecutarse en tests.
vi.mock('@/server/auth/get-user', () => ({ getUser: vi.fn() }));
vi.mock('@/server/services/cv-analyzer.service', () => ({ analizarMiCv: vi.fn() }));
vi.mock('@/lib/ia-cv', () => ({ analizarCv: vi.fn() }));

// Prisma / Supabase nunca se inicializan en tests.
vi.mock('@/lib/db', () => ({ db: {} }));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ storage: {} })) }));

// ── Imports post-mock ─────────────────────────────────────────────────────────

import { POST as postAnalizar } from '@/app/api/estudiante/cv/analizar/route';
import { getUser } from '@/server/auth/get-user';
import { analizarMiCv } from '@/server/services/cv-analyzer.service';
import { analizarCv } from '@/lib/ia-cv';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USUARIO_ESTUDIANTE = {
  id: 'usuario-test-123',
  nombre: 'Test Estudiante',
  correo: 'test@fwd.cr',
  roles: { nombre: 'estudiante' },
};

const USUARIO_EMPRESARIO = {
  ...USUARIO_ESTUDIANTE,
  roles: { nombre: 'empresario' },
};

/** Analisis con todas las propiedades requeridas por el contrato. */
const ANALISIS_COMPLETO = {
  score: 78,
  mensajeGeneral: 'Tu CV tiene una base solida pero necesita ajustes en la presentacion de logros.',
  fortalezas: [
    'Estructura visual clara y profesional',
    'Habilidades tecnicas bien organizadas por categoria',
  ],
  sugerenciasMejora: [
    {
      seccion: 'Experiencia',
      consejo: 'Agrega metricas concretas: porcentajes de mejora, tiempos reducidos, etc.',
      prioridad: 'alta' as const,
    },
    {
      seccion: 'Resumen profesional',
      consejo: 'Personaliza el resumen con tu especialidad y tecnologias principales.',
      prioridad: 'media' as const,
    },
  ],
  requiereCambiosUrgentes: false,
  validacion: {
    tieneContacto: true,
    tieneResumen: true,
    tieneExperiencia: false,
    tieneEducacion: true,
    tieneHabilidades: true,
  },
};

/** PDF minimo valido (cabecera + trailer). Suficiente para pasar la validacion de tipo MIME. */
function crearPdfBuffer(): Buffer {
  return Buffer.from('%PDF-1.4 1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\ntrailer<</Size 1>>\n%%EOF');
}

/** Crea un Request multipart con el PDF adjunto. */
function crearRequestConPdf(archivo = crearPdfBuffer(), nombre = 'curriculum.pdf'): Request {
  const blob = new Blob([new Uint8Array(archivo)], { type: 'application/pdf' });
  const fd = new FormData();
  fd.append('archivo', new File([blob], nombre, { type: 'application/pdf' }));
  return new Request('http://localhost/api/estudiante/cv/validar', {
    method: 'POST',
    body: fd,
  });
}

// ── Suite: /api/estudiante/cv/analizar ───────────────────────────────────────

describe('POST /api/estudiante/cv/analizar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve 401 cuando no hay sesion activa', async () => {
    vi.mocked(getUser).mockResolvedValue(null);
    const res = await postAnalizar();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error');
  });

  it('devuelve 403 cuando el usuario no es estudiante', async () => {
    vi.mocked(getUser).mockResolvedValue(USUARIO_EMPRESARIO as never);
    const res = await postAnalizar();
    expect(res.status).toBe(403);
  });

  it('devuelve 404 cuando el estudiante no tiene CV cargado', async () => {
    vi.mocked(getUser).mockResolvedValue(USUARIO_ESTUDIANTE as never);
    vi.mocked(analizarMiCv).mockResolvedValue('sin_cv');
    const res = await postAnalizar();
    expect(res.status).toBe(404);
  });

  it('devuelve 422 cuando el CV no es PDF', async () => {
    vi.mocked(getUser).mockResolvedValue(USUARIO_ESTUDIANTE as never);
    vi.mocked(analizarMiCv).mockResolvedValue('solo_pdf');
    const res = await postAnalizar();
    expect(res.status).toBe(422);
  });

  it('devuelve 500 cuando no se puede descargar el archivo', async () => {
    vi.mocked(getUser).mockResolvedValue(USUARIO_ESTUDIANTE as never);
    vi.mocked(analizarMiCv).mockResolvedValue('error_descarga');
    const res = await postAnalizar();
    expect(res.status).toBe(500);
  });

  it('devuelve 503 cuando el servicio de IA no responde', async () => {
    vi.mocked(getUser).mockResolvedValue(USUARIO_ESTUDIANTE as never);
    vi.mocked(analizarMiCv).mockResolvedValue('error_ia');
    const res = await postAnalizar();
    expect(res.status).toBe(503);
  });

  it('devuelve 200 con el analisis completo y todas las propiedades requeridas', async () => {
    vi.mocked(getUser).mockResolvedValue(USUARIO_ESTUDIANTE as never);
    vi.mocked(analizarMiCv).mockResolvedValue({ ok: true, analisis: ANALISIS_COMPLETO });

    const res = await postAnalizar();

    expect(res.status).toBe(200);

    const body = await res.json();

    // Propiedad raiz
    expect(body).toHaveProperty('analisis');
    const { analisis } = body;

    // Contrato completo del AnalisisCv
    expect(analisis).toHaveProperty('score');
    expect(analisis).toHaveProperty('mensajeGeneral');
    expect(analisis).toHaveProperty('fortalezas');
    expect(analisis).toHaveProperty('sugerenciasMejora');
    expect(analisis).toHaveProperty('requiereCambiosUrgentes');
    expect(analisis).toHaveProperty('validacion');

    // Tipos correctos
    expect(typeof analisis.score).toBe('number');
    expect(analisis.score).toBeGreaterThanOrEqual(0);
    expect(analisis.score).toBeLessThanOrEqual(100);
    expect(typeof analisis.mensajeGeneral).toBe('string');
    expect(Array.isArray(analisis.fortalezas)).toBe(true);
    expect(Array.isArray(analisis.sugerenciasMejora)).toBe(true);
    expect(typeof analisis.requiereCambiosUrgentes).toBe('boolean');
    expect(typeof analisis.validacion).toBe('object');

    // Estructura de sugerencias
    const [primera] = analisis.sugerenciasMejora;
    expect(primera).toHaveProperty('seccion');
    expect(primera).toHaveProperty('consejo');
    expect(primera).toHaveProperty('prioridad');
    expect(['alta', 'media', 'baja']).toContain(primera.prioridad);

    // Estructura de validacion
    const { validacion } = analisis;
    expect(typeof validacion.tieneContacto).toBe('boolean');
    expect(typeof validacion.tieneResumen).toBe('boolean');
    expect(typeof validacion.tieneExperiencia).toBe('boolean');
    expect(typeof validacion.tieneEducacion).toBe('boolean');
    expect(typeof validacion.tieneHabilidades).toBe('boolean');

    // Valores identicos al fixture
    expect(analisis.score).toBe(78);
    expect(analisis.fortalezas).toHaveLength(2);
    expect(analisis.requiereCambiosUrgentes).toBe(false);
  });
});

