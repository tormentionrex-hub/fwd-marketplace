// Skeleton de carga del perfil público. Se muestra mientras el Server Component
// resuelve los datos (Next.js App Router lo toma automáticamente).

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-surface-2 ${className}`} />;
}

export default function PerfilLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div className="h-[180px] animate-pulse bg-surface-2 sm:h-[240px] lg:h-[300px]" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-end">
              <div className="h-32 w-32 animate-pulse rounded-full border-4 border-surface bg-surface-2" />
              <div className="flex flex-col items-center gap-2 lg:items-start">
                <Block className="h-7 w-56" />
                <Block className="h-4 w-24" />
                <Block className="h-4 w-72" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 lg:items-end">
              <Block className="h-6 w-40" />
              <div className="flex gap-2">
                <Block className="h-9 w-28" />
                <Block className="h-9 w-36" />
                <Block className="h-9 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-14">
          {/* Acerca de mí */}
          <section className="flex flex-col gap-3">
            <Block className="h-4 w-20" />
            <Block className="h-8 w-64" />
            <Block className="h-20 w-full max-w-2xl" />
          </section>

          {/* Stats */}
          <section>
            <Block className="mb-4 h-8 w-72" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Block key={i} className="h-28" />
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <Block className="mb-4 h-8 w-64" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Block key={i} className="h-6 w-full" />
              ))}
            </div>
          </section>

          {/* Portafolio */}
          <section>
            <Block className="mb-4 h-8 w-72" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Block key={i} className="h-64" />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <Block className="h-14 w-full" />
          <Block className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Block key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
