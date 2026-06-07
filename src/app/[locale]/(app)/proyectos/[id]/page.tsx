export default async function ProyectoActivoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Página 11 — Proyecto activo (estudiante) (placeholder)
      </h1>
      <p className="mt-2">Proyecto: {id}</p>

      {/* Aquí va el diseño de Stitch */}
    </main>
  );
}
