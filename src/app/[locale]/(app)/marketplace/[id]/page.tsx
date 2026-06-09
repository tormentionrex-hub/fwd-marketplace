import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/features/cards/ProductCard";
import {
  IconArrowLeft,
  IconCheck,
  IconHeart,
  IconStar,
} from "@/components/ui/icons";
import { PRODUCTOS } from "@/lib/marketplace-data";

const BENEFICIOS = [
  "Acceso inmediato tras la compra",
  "Soporte de la comunidad FWD",
  "Actualizaciones incluidas",
];

export default async function MarketplaceItemPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const producto = PRODUCTOS.find((p) => p.id === id);

  if (!producto) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-text">Producto no encontrado</h1>
        <p className="mt-2 text-text-muted">El producto que buscas no está disponible.</p>
        <Button href={`/${locale}/marketplace`} className="mt-6">
          Volver al marketplace
        </Button>
      </div>
    );
  }

  const relacionados = PRODUCTOS.filter(
    (p) => p.categoria === producto.categoria && p.id !== producto.id,
  ).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">
      <Link
        href={`/${locale}/marketplace`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-fwd-azul"
      >
        <IconArrowLeft width={16} height={16} />
        Volver al marketplace
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Cover */}
        <div
          className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl lg:h-full lg:min-h-[420px]"
          style={{ backgroundColor: producto.color }}
        >
          <svg viewBox="0 0 66 76" className="h-40 w-40" fill="#ffffff" opacity={0.22} aria-hidden>
            <path d="M0 0 L66 38 L0 76 Z" />
          </svg>
          <svg
            viewBox="0 0 66 76"
            className="absolute -right-6 top-10 h-28 w-28"
            fill="#ffffff"
            opacity={0.12}
            aria-hidden
          >
            <path d="M0 0 L66 38 L0 76 Z" />
          </svg>
          <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
            {producto.categoria}
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <Badge variant="featured">{producto.estado}</Badge>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-text-muted">
              <IconStar width={16} height={16} className="text-fwd-amarillo" />
              {producto.calificacion.toFixed(1)} · 128 reseñas
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            {producto.nombre}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-text-muted">
            {producto.descripcion} Diseñado para integrarse fácilmente en tu flujo de trabajo y
            ayudarte a avanzar más rápido.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {BENEFICIOS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-text">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-fwd-azul/10 text-fwd-azul">
                  <IconCheck width={14} height={14} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {/* Autor */}
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-fwd-soft font-semibold text-white">
              {producto.autor.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-semibold text-text">{producto.autor}</p>
              <p className="text-xs text-text-muted">Publicado por la comunidad FWD</p>
            </div>
          </div>

          {/* Precio + acciones */}
          <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center">
            <span className="font-display text-3xl font-bold text-fwd-azul">{producto.precio}</span>
            <div className="flex flex-1 gap-3">
              <Button size="lg" fullWidth>
                Adquirir ahora
              </Button>
              <Button size="lg" variant="outline" aria-label="Agregar a favoritos">
                <IconHeart width={18} height={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="También te puede interesar" title="Productos relacionados" />
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((p) => (
              <ProductCard key={p.id} producto={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
