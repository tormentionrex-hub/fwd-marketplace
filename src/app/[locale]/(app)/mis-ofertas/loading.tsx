// Skeleton de carga de "Mis Ofertas" (render inicial del servidor). La vista
// cliente tiene además su propio skeleton mientras consulta los endpoints.

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />;
}

export default function MisOfertasLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
      <div className="flex flex-col gap-3">
        <Block className="h-9 w-56" />
        <Block className="h-4 w-96 max-w-full" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} className="h-24" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}
