import { redirect } from "next/navigation";
import { getUser } from "@/server/auth/get-user";
import { cargarCuentaEstudiante, listarEvaluaciones } from "@/server/services/cuenta-estudiante.service";
import { cargarPreferencias } from "@/server/services/preferencias-estudiante.service";
import ConfiguracionCuentaCliente from "@/components/features/estudiante/ConfiguracionCuentaCliente";

interface ConfiguracionPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ConfiguracionPage({ params }: ConfiguracionPageProps) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login`);

  const [cuenta, prefs, evaluaciones] = await Promise.all([
    cargarCuentaEstudiante(user.id),
    cargarPreferencias(user.id),
    listarEvaluaciones(user.id),
  ]);

  return (
    <ConfiguracionCuentaCliente
      locale={locale}
      nombre={cuenta?.nombre ?? user.nombre}
      correo={cuenta?.correo ?? user.correo}
      telefono={cuenta?.telefono ?? null}
      reputacion={cuenta?.reputacion ?? 0}
      empleabilidad={prefs.empleabilidad}
      notif={prefs.notif}
      priv={prefs.priv}
      conexiones={prefs.conexiones}
      evaluaciones={evaluaciones}
    />
  );
}
