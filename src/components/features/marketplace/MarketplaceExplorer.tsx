"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "@/components/features/cards/ProductCard";
import SearchInput from "@/components/ui/SearchInput";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { CategoriaProducto, ProductoMarketplace } from "@/types/marketplace";

interface MarketplaceExplorerProps {
  productos: ProductoMarketplace[];
  locale: string;
}

const CATEGORIAS: CategoriaProducto[] = [
  "Tecnología",
  "Educación",
  "Servicios",
  "Emprendimiento",
  "Innovación",
];

const ORDENES = ["Más recientes", "Más populares", "Mejor valorados"] as const;
type Orden = (typeof ORDENES)[number];

export default function MarketplaceExplorer({ productos, locale }: MarketplaceExplorerProps) {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProducto | null>(null);
  const [orden, setOrden] = useState<Orden>("Más recientes");

  const visibles = useMemo(() => {
    let lista = productos.filter((p) => {
      const coincideCategoria = !categoria || p.categoria === categoria;
      const q = query.trim().toLowerCase();
      const coincideTexto =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.autor.toLowerCase().includes(q);
      return coincideCategoria && coincideTexto;
    });

    if (orden === "Mejor valorados") {
      lista = [...lista].sort((a, b) => b.calificacion - a.calificacion);
    } else if (orden === "Más populares") {
      lista = [...lista].sort(
        (a, b) =>
          Number(b.destacado ?? false) - Number(a.destacado ?? false) ||
          b.calificacion - a.calificacion,
      );
    }
    return lista;
  }, [productos, categoria, query, orden]);

  return (
    <div id="explorar" className="scroll-mt-24">
      {/* Buscador + orden */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos, servicios o soluciones..."
          containerClassName="flex-1"
        />
        <div className="relative">
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            aria-label="Ordenar por"
            className="h-12 w-full appearance-none rounded-full border border-border bg-surface py-2 pl-5 pr-11 font-medium text-text outline-none transition-colors focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10 lg:w-56"
          >
            {ORDENES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <IconChevronDown
            width={18}
            height={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <FilterChip active={categoria === null} onClick={() => setCategoria(null)}>
          Todos
        </FilterChip>
        {CATEGORIAS.map((cat) => (
          <FilterChip key={cat} active={categoria === cat} onClick={() => setCategoria(cat)}>
            {cat}
          </FilterChip>
        ))}
      </div>

      {/* Resultados */}
      <motion.div layout className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibles.map((producto) => (
            <ProductCard key={producto.id} producto={producto} locale={locale} />
          ))}
        </AnimatePresence>
      </motion.div>

      {visibles.length === 0 && (
        <p className="mt-12 text-center text-text-muted">
          No encontramos resultados. Prueba con otra búsqueda o categoría.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-fwd-azul text-white shadow-md shadow-fwd-azul/25"
          : "border border-border bg-surface text-text-muted hover:border-fwd-azul hover:text-fwd-azul",
      )}
    >
      {children}
    </button>
  );
}
