// Listado de solicitudes / postulaciones del usuario.
// URL: /es/applications
export default function ApplicationsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Mis solicitudes</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Aún no tienes solicitudes. Cuando crees una, aparecerá aquí.
      </p>
    </section>
  );
}
