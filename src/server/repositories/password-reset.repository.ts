import "server-only";
import { db } from "@/lib/db";

// Capa de datos sobre password_resets. Solo lee/escribe; la lógica va en el service.

export function invalidarResetsDeUsuario(idUsuario: string) {
  return db.password_resets.updateMany({
    where: { id_usuario: idUsuario, usado: false },
    data: { usado: true },
  });
}

export function crearReset(datos: { idUsuario: string; codigoHash: string; expira: Date }) {
  return db.password_resets.create({
    data: {
      id_usuario: datos.idUsuario,
      codigo_hash: datos.codigoHash,
      expira: datos.expira,
    },
    select: { id: true },
  });
}

export function buscarResetVigentePorUsuario(idUsuario: string) {
  return db.password_resets.findFirst({
    where: { id_usuario: idUsuario, usado: false },
    orderBy: { creado: "desc" },
  });
}

export function buscarResetPorId(id: string) {
  return db.password_resets.findUnique({ where: { id } });
}

export function incrementarIntentos(id: string) {
  return db.password_resets.update({
    where: { id },
    data: { intentos: { increment: 1 } },
  });
}

export function marcarVerificado(id: string) {
  return db.password_resets.update({ where: { id }, data: { verificado: true } });
}

export function marcarUsado(id: string) {
  return db.password_resets.update({ where: { id }, data: { usado: true } });
}
