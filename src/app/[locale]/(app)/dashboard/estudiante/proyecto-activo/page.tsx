import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { IconArrowRight, IconBriefcase } from "@/components/ui/icons";
import { getUser } from "@/server/auth/get-user";
import { obtenerProyectoActivo } from "@/server/services/proyecto-activo.service";
import CalificarEmpresa from "@/components/features/estudiante/CalificarEmpresa";

interface ProyectoActivoPageProps {
  params: Promise<{ locale: string }>;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ProyectoActivoPage({ params }: ProyectoActivoPageProps) {
  const { locale } = await params;

  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  const activo = await obtenerProyectoActivo(user.id);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text">Proyecto activo</h1>
        <p className="text-text-muted">Aquí verás el detalle del proyecto que tienes en curso.</p>
      </header>

      {!activo ? (
        <EmptyState
          icon={<IconBriefcase width={28} height={28} />}
          title="No tienes proyectos activos"
          description="Cuando una de tus ofertas sea adjudicada, el proyecto en curso aparecerá aquí."
          action={<Button href={`/${locale}/marketplace`}>Explorar proyectos</Button>}
        />
      ) : (
        <>
        <Card className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-text">{activo.titulo}</h2>
              <p className="mt-0.5 text-sm text-text-muted">
                {activo.empresario} · {activo.sector}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                activo.estado === "abierto"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-surface-2 text-text-muted"
              }`}
            >
              {activo.estado === "abierto" ? "En curso" : "Finalizado"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Fecha inicio</p>
              <p className="font-semibold text-text">{fmtFecha(activo.fechaInicio)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Fecha finalización</p>
              <p className="font-semibold text-text">{fmtFecha(activo.fechaFin)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Estado</p>
              <p className="font-semibold capitalize text-text">{activo.estado}</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
              <span>Progreso</span>
              <span>{activo.progreso}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-2 rounded-full bg-fwd-azul transition-all"
                style={{ width: `${activo.progreso}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button href={`/${locale}/proyectos/${activo.proyectoId}`}>
              Ir al proyecto
              <IconArrowRight width={18} height={18} />
            </Button>
          </div>
        </Card>

        {activo.estado !== "abierto" && activo.empresarioId && (
          <CalificarEmpresa
            proyectoId={activo.proyectoId}
            empresario={activo.empresario}
            calificacionInicial={activo.evaluacionEmpresa}
          />
        )}
        </>
      )}
    </div>
  );
}
