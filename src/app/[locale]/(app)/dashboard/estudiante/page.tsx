import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { IconShieldCheck } from "@/components/ui/icons";
import { EVENTOS } from "@/lib/marketplace-data";
import { tiempoRelativo } from "@/lib/tiempo";
import { getUser } from "@/server/auth/get-user";
import { obtenerVerificacionEstudiante } from "@/server/services/verificacion.service";
import { resumenDashboardEstudiante } from "@/server/services/dashboard.service";
import { listarMisOfertas } from "@/server/services/oferta.service";
import { cargarPerfilEditable } from "@/server/services/perfil-estudiante.service";
import { obtenerMiCv } from "@/server/services/curriculum.service";
import { cargarQuizzes } from "@/server/services/quizzes.service";
import { contarFasesCompletadas, porcentajeGlobal } from "@/lib/quizzes/progreso";
import DashboardEstudianteCliente from "@/components/features/dashboard/DashboardEstudianteCliente";

export default async function DashboardEstudiantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  const verif = await obtenerVerificacionEstudiante(user.id);
  const nombre = user.nombre.trim().split(/\s+/)[0] || "Estudiante";
  const ultimaSesion = tiempoRelativo(user.ultima_sesion);

  if (!verif.verificado) {
    const solicitado = verif.solicitado
      ? new Date(verif.solicitado).toLocaleDateString("es-CR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";
    return (
      <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 p-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-fwd-naranja/10 text-fwd-naranja">
          <IconShieldCheck width={28} height={28} />
        </span>
        <h1 className="font-display text-xl font-bold text-text">
          Cuenta pendiente de verificación
        </h1>
        <p className="max-w-md text-sm text-text-muted">
          Tu cuenta aún está siendo revisada por FWD Costa Rica. Cuando la verificación sea
          aprobada podrás enviar ofertas, aplicar a proyectos, participar en adjudicaciones y
          acceder al dashboard completo.
        </p>
        <dl className="mt-1 grid w-full max-w-sm grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-left">
            <dt className="text-xs uppercase tracking-wide text-text-muted">Estado</dt>
            <dd className="font-semibold capitalize text-text">{verif.estado ?? "pendiente"}</dd>
          </div>
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-left">
            <dt className="text-xs uppercase tracking-wide text-text-muted">Fecha de envío</dt>
            <dd className="font-semibold text-text">{solicitado}</dd>
          </div>
        </dl>
        <p className="text-xs text-text-muted">
          Tiempo estimado de revisión: 24–72 horas hábiles.
        </p>
        <Button href={`/${locale}/dashboard/estudiante/perfil`}>Actualizar información</Button>
      </Card>
    );
  }

  const [resumen, misOfertas, perfil, cv, quizzes] = await Promise.all([
    resumenDashboardEstudiante(user.id),
    listarMisOfertas(user.id),
    cargarPerfilEditable(user.id),
    obtenerMiCv(user.id),
    cargarQuizzes(user.id),
  ]);

  const quizPuntos = quizzes.puntos;
  const quizInsignias = contarFasesCompletadas(quizzes.progreso);
  const quizPorcentaje = porcentajeGlobal(quizzes.progreso);

  const señales = [
    Boolean(perfil.correo),
    Boolean(perfil.fotoUrl),
    perfil.resumen.trim().length > 0,
    perfil.habilidades.length > 0,
    perfil.portafolio.length > 0,
  ];
  const perfilCompletado = Math.round((señales.filter(Boolean).length / señales.length) * 100);
  const habilidadesVerificadas = perfil.habilidades.length;

  return (
    <DashboardEstudianteCliente
      locale={locale}
      nombre={nombre}
      ultimaSesion={ultimaSesion}
      perfilCompletado={perfilCompletado}
      resumen={resumen}
      misOfertas={misOfertas}
      perfil={perfil}
      cv={cv}
      habilidadesVerificadas={habilidadesVerificadas}
      eventos={EVENTOS}
      quizPuntos={quizPuntos}
      quizInsignias={quizInsignias}
      quizPorcentaje={quizPorcentaje}
    />
  );
}

