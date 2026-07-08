// Skeleton de carga de la ficha de proyecto. Next.js App Router lo muestra
// automáticamente mientras el Server Component resuelve los datos.

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface-2 ${className}`} />;
}

export default function ProyectoLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
      <Block className="h-4 w-36" />

      {/* Encabezado */}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex gap-2">
          <Block className="h-7 w-20 rounded-full" />
          <Block className="h-7 w-28 rounded-full" />
        </div>
        <Block className="h-10 w-3/4" />
        <Block className="h-5 w-64 rounded-full" />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <main className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <Block className="h-4 w-28" />
            <Block className="h-24 w-full" />
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <Block className="h-4 w-40" />
            <div className="flex flex-wrap gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Block key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </main>

        <aside className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <Block className="mx-auto h-12 w-16" />
            <Block className="mx-auto mt-3 h-4 w-24" />
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <Block className="h-4 w-20" />
            <Block className="h-11 w-full rounded-full" />
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <Block className="h-4 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Block className="h-8 w-8 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Block className="h-3 w-16" />
                  <Block className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
