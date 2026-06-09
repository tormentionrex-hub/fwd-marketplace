// Skeleton de carga de la ficha de proyecto. Next.js App Router lo muestra
// automáticamente mientras el Server Component resuelve los datos.

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface-2 ${className}`} />;
}

export default function ProyectoLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">
      <Block className="h-4 w-36" />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <main className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Block className="h-7 w-44 rounded-full" />
            <div className="flex gap-2">
              <Block className="h-6 w-16 rounded-full" />
              <Block className="h-6 w-56 rounded-full" />
            </div>
            <Block className="h-10 w-3/4" />
            <Block className="h-24 w-full max-w-2xl" />
          </div>

          <div className="flex flex-col gap-3">
            <Block className="h-4 w-48" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Block key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </main>

        <aside>
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Block className="h-11 w-11 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Block className="h-4 w-32" />
                <Block className="h-3 w-24" />
              </div>
            </div>
            <Block className="h-11 w-full" />
            <Block className="h-px w-full" />
            <Block className="h-11 w-full rounded-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
