import { redirect } from 'next/navigation';
import { getUser } from '@/server/auth/get-user';
import {
  buscarProyectoParaOferta,
  buscarOfertaExistente,
} from '@/server/repositories/oferta.repository';
import { FormularioOferta } from '@/components/features/marketplace/FormularioOferta';

export default async function OfertarProyectoPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (user.roles.nombre !== 'estudiante') {
    redirect(`/${locale}/dashboard/estudiante`);
  }

  // ── Datos del proyecto ────────────────────────────────────────────────────
  const proyecto = await buscarProyectoParaOferta(id);
  if (!proyecto) {
    redirect(`/${locale}/marketplace`);
  }

  // ── Calcular días restantes ───────────────────────────────────────────────
  let diasRestantes: number | null = null;
  if (proyecto.cierre) {
    const diff = proyecto.cierre.getTime() - Date.now();
    diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
  } else if (proyecto.publicado && proyecto.plazo_dias) {
    const cierre = new Date(proyecto.publicado.getTime() + proyecto.plazo_dias * 86400000);
    const diff = cierre.getTime() - Date.now();
    diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ── ¿Está cerrado? ────────────────────────────────────────────────────────
  const vencido = diasRestantes !== null && diasRestantes <= 0;
  const cerrado = proyecto.estado === 'cerrado' || vencido;

  // ── ¿Ya ofertó? ──────────────────────────────────────────────────────────
  const ofertaExistente = await buscarOfertaExistente(id, user.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <FormularioOferta
        proyecto={{
          id: proyecto.id,
          titulo: proyecto.titulo,
          diasRestantes,
          cerrado,
        }}
        ofertaExistente={
          ofertaExistente
            ? {
                id: ofertaExistente.id,
                propuesta: ofertaExistente.propuesta,
                estado: ofertaExistente.estado,
              }
            : null
        }
      />
    </main>
  );
}
