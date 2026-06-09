"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-500">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Algo salió mal
      </span>
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
        Ocurrió un <span className="text-gradient-fwd">error</span>
      </h1>
      <p className="mt-3 max-w-md text-text-muted">
        Tuvimos un problema al cargar esta sección. Puedes reintentar o volver al inicio.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} size="lg">
          Reintentar
        </Button>
        <Button href="/" size="lg" variant="outline">
          Ir al inicio
          <IconArrowRight width={18} height={18} />
        </Button>
      </div>
    </section>
  );
}
