import { notFound } from "next/navigation";

// Captura cualquier ruta no existente dentro de un locale y muestra
// la página 404 temática ([locale]/not-found.tsx).
export default function CatchAllNotFound() {
  notFound();
}
