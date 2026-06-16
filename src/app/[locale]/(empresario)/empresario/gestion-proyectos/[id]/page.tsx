import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import { buscarProyectoGestion } from '@/server/repositories/proyecto.repository';
import {
  listarOfertasDeProyecto,
  buscarEstudianteAdjudicado,
} from '@/server/repositories/oferta-gestion.repository';
import { listarEntregablesDeProyecto } from '@/server/repositories/entregable.repository';
import { buscarEvaluacion } from '@/server/repositories/evaluacion.repository';
import { buscarChatEntre } from '@/server/repositories/chat.repository';
import { tiempoRelativo } from '@/lib/tiempo';
import GestionProyecto from '@/components/features/marketplace/GestionProyecto';

export default async function GestionProyectoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.roles.nombre !== 'empresario') redirect(`/${locale}`);

  const proyecto = await buscarProyectoGestion(id);
  if (!proyecto) notFound();

  // Solo el empresario dueño del proyecto puede gestionarlo.
  if (proyecto.id_empresario !== user.id) {
    return (
      <main className="page">
        <div className="card card-pad">No tenés acceso a este proyecto.</div>
      </main>
    );
  }

  const [ofertasRaw, entregablesRaw, adj] = await Promise.all([
    listarOfertasDeProyecto(id),
    listarEntregablesDeProyecto(id),
    buscarEstudianteAdjudicado(id),
  ]);

  const evaluacion = adj ? await buscarEvaluacion(id, adj.id_estudiante, user.id) : null;
  const chat = adj ? await buscarChatEntre(id, adj.id_estudiante, user.id) : null;

  // Mapeo snake_case (DB) -> camelCase plano para el Client Component.
  const ofertas = ofertasRaw.map((o) => ({
    id: o.id,
    estudianteNombre: o.perfiles_estudiante?.usuarios?.nombre ?? 'Estudiante',
    propuesta: o.propuesta,
    prototipoUrl: o.prototipo_url,
    documentacionUrl: o.documentacion_url,
    estado: o.estado,
    fechaEnvio: o.enviado.toISOString(),
    // Texto relativo precomputado en el servidor para evitar desajustes de
    // hidratación (Date.now() difiere entre server y cliente).
    enviadoTexto: tiempoRelativo(o.enviado),
  }));

  const entregables = entregablesRaw.map((e) => ({
    id: e.id,
    tipo: e.tipo ?? 'hito',
    version: e.version,
    archivoUrl: e.archivo_url,
    estado: e.estado,
    comentarioEmpresario: e.comentario_empresario,
    fecha: e.creado.toISOString(),
    fechaTexto: tiempoRelativo(e.creado),
  }));

  return (
    <GestionProyecto
      proyecto={{ id: proyecto.id, titulo: proyecto.titulo, estado: proyecto.estado }}
      ofertasIniciales={ofertas}
      entregablesIniciales={entregables}
      calificacionInicial={evaluacion?.puntuacion ?? 0}
      chatIdInicial={chat?.id ?? null}
    />
  );
}
