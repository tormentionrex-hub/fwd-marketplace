import 'server-only';
import { db } from '@/lib/db';

// --- Tecnologías ---
export async function listarTecnologias() {
  return db.tecnologias.findMany({
    orderBy: { nombre: 'asc' },
  });
}

export async function crearTecnologia(nombre: string) {
  return db.tecnologias.create({
    data: { nombre, activa: true },
  });
}

export async function actualizarTecnologia(id: number | bigint, nombre: string, activa: boolean) {
  return db.tecnologias.update({
    where: { id: BigInt(id) },
    data: { nombre, activa },
  });
}

// --- Habilidades ---
export async function listarHabilidades() {
  return db.habilidades.findMany({
    orderBy: { nombre: 'asc' },
  });
}

export async function crearHabilidad(nombre: string, categoria: string | null = null) {
  return db.habilidades.create({
    data: { nombre, categoria, activa: true },
  });
}

export async function actualizarHabilidad(id: number | bigint, nombre: string, categoria: string | null, activa: boolean) {
  return db.habilidades.update({
    where: { id: BigInt(id) },
    data: { nombre, categoria, activa },
  });
}

// --- Categorías de Negocio ---
export async function listarCategoriasNegocio() {
  return db.categorias_negocio.findMany({
    orderBy: { nombre: 'asc' },
  });
}

export async function crearCategoriaNegocio(nombre: string) {
  return db.categorias_negocio.create({
    data: { nombre, activa: true },
  });
}

export async function actualizarCategoriaNegocio(id: number | bigint, nombre: string, activa: boolean) {
  return db.categorias_negocio.update({
    where: { id: BigInt(id) },
    data: { nombre, activa },
  });
}
