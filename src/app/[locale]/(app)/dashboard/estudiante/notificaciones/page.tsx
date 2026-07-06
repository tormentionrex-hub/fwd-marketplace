import NotificacionesPanel from "@/components/features/dashboard/NotificacionesPanel";

export default function NotificacionesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-extrabold text-text">Notificaciones</h1>
        <p className="mt-1 text-sm text-text-muted">
          Actualizaciones sobre tus ofertas, proyectos, mensajes y reputación.
        </p>
      </header>
      <NotificacionesPanel />
    </div>
  );
}
