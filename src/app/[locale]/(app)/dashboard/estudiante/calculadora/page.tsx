import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { IconShieldCheck } from "@/components/ui/icons";
import { getUser } from "@/server/auth/get-user";
import { obtenerVerificacionEstudiante } from "@/server/services/verificacion.service";
import { listarMisOfertas } from "@/server/services/oferta.service";
import { listarMisPostulaciones } from "@/server/services/postulacion.service";
import CalculadoraCliente from "@/components/features/calculadora/CalculadoraCliente";

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 1. Obtener usuario autenticado
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  // 2. Verificar que sea estudiante
  if (user.roles.nombre !== "estudiante") {
    redirect(`/${locale}`);
  }

  // 3. Verificar estado de verificación del estudiante
  const verif = await obtenerVerificacionEstudiante(user.id);
  if (!verif.verificado) {
    const solicitado = verif.solicitado
      ? new Date(verif.solicitado).toLocaleDateString("es-CR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-fwd-naranja/10 text-fwd-naranja">
            <IconShieldCheck width={28} height={28} />
          </span>
          <h1 className="font-display text-xl font-bold text-text">
            Cuenta pendiente de verificación
          </h1>
          <p className="max-w-md text-sm text-text-muted">
            Tu cuenta aún está siendo revisada por FWD Costa Rica. Cuando la verificación sea
            aprobada podrás utilizar la calculadora, guardar cotizaciones y adjuntarlas a tus postulaciones.
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
      </div>
    );
  }

  // 4. Cargar ofertas de proyectos y postulaciones de vacantes del estudiante en paralelo
  const [ofertas, postulaciones] = await Promise.all([
    listarMisOfertas(user.id),
    listarMisPostulaciones(user.id),
  ]);

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-gradient-fwd">
          Herramienta de Cotizaciones
        </h1>
        <p className="text-sm text-text-muted max-w-2xl">
          Calculá el precio estimado de tus proyectos freelance de forma transparente, con base en el mercado
          y la complejidad, o utilizá el asistente de IA para realizar estimaciones automáticas.
        </p>
      </div>

      <CalculadoraCliente
        locale={locale}
        ofertas={ofertas}
        postulaciones={postulaciones}
      />
    </div>
  );
}
