// Panel de administración.
// URL: /es/admin
export default function AdminPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Panel de administración
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Zona reservada para administradores.
      </p>
    </section>
  );
}
