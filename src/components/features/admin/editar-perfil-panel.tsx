"use client";

import { useRef, useState } from "react";
import { UserCircle, Save, Mail, Lock, Upload, Loader } from "lucide-react";
import { toastExito, alertaError } from "@/lib/sweetalert-admin";
import { useRouter } from "@/i18n/navigation";

const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FOTO_MB = 5;

type Props = {
  nombre: string;
  segundoApellido: string | null;
  correo: string;
  imageUrl: string | null;
  rol: string;
};

const ETIQUETA_ROL: Record<string, string> = {
  owner: "Owner",
  admin: "Administrador",
  staff: "Staff",
  moderator: "Moderador",
  estudiante: "Estudiante",
  empresario: "Empresario",
};

export function EditarPerfilPanel({
  nombre: nombreInicial,
  segundoApellido: segundoApellidoInicial,
  correo,
  imageUrl: imageUrlInicial,
  rol,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState(nombreInicial);
  const [segundoApellido, setSegundoApellido] = useState(segundoApellidoInicial ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(imageUrlInicial);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrlInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [imageUrlNueva, setImageUrlNueva] = useState<string | null | undefined>(undefined);

  const sinCambios =
    nombre.trim() === nombreInicial &&
    (segundoApellido.trim() || null) === (segundoApellidoInicial ?? null) &&
    imageUrlNueva === undefined;

  async function seleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    // Resetear el input para permitir volver a seleccionar el mismo archivo
    e.target.value = "";

    if (!TIPOS_FOTO.includes(archivo.type)) {
      alertaError("La foto debe ser JPG, PNG, WEBP o GIF.");
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      alertaError(`La foto no puede superar ${MAX_FOTO_MB} MB.`);
      return;
    }

    // Vista previa inmediata
    const localUrl = URL.createObjectURL(archivo);
    setPreviewUrl(localUrl);
    setSubiendo(true);

    try {
      const fd = new FormData();
      fd.append("archivo", archivo);
      fd.append("tipo", "prototipo");
      const res = await fetch("/api/upload/archivo", { method: "POST", body: fd });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        alertaError(data.error ?? "No se pudo subir la foto.");
        setPreviewUrl(imageUrl); // revertir preview
        return;
      }
      setImageUrlNueva(data.url);
      setImageUrl(data.url);
    } catch {
      alertaError("Error al subir la foto. Intentá de nuevo.");
      setPreviewUrl(imageUrl);
    } finally {
      setSubiendo(false);
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      alertaError("El nombre es obligatorio.");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch("/api/admin/mi-perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          segundoApellido: segundoApellido.trim() || null,
          ...(imageUrlNueva !== undefined && { imageUrl: imageUrlNueva }),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        alertaError(data?.error ?? "No se pudo guardar el perfil.");
        return;
      }
      setImageUrlNueva(undefined); // marcar como sin cambios pendientes
      toastExito("Perfil actualizado.");
      router.refresh();
    } catch {
      alertaError("Error de red. Intentá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      {/* Encabezado */}
      <div className="mb-6 flex items-start gap-3">
        <UserCircle className="mt-0.5 h-5 w-5 shrink-0 text-fwd-blue" />
        <div>
          <h2 className="font-display text-lg font-bold text-white">Editar perfil</h2>
          <p className="mt-0.5 text-sm text-white/50">
            Actualiza los datos de tu cuenta de administrador.
          </p>
        </div>
      </div>

      <form onSubmit={guardar} className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Avatar clickable */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept={TIPOS_FOTO.join(",")}
            className="hidden"
            onChange={seleccionarFoto}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={subiendo}
            title="Cambiar foto de perfil"
            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-fwd-blue/50 hover:bg-white/10 disabled:cursor-wait"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle className="h-12 w-12 text-white/20 transition group-hover:text-white/30" />
            )}

            {/* Overlay al hover / cargando */}
            <span
              className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-black/60 transition-opacity ${
                subiendo ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {subiendo ? (
                <Loader className="h-5 w-5 animate-spin text-white" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-white" />
                  <span className="text-[10px] font-semibold text-white/90">Cambiar foto</span>
                </>
              )}
            </span>
          </button>
          <p className="text-center text-[11px] text-white/30">
            JPG, PNG, WEBP · máx. {MAX_FOTO_MB} MB
          </p>
        </div>

        {/* Campos */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Correo (solo lectura) */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
              <Mail className="h-3.5 w-3.5" />
              Correo electrónico
              <Lock className="h-3 w-3 text-white/25" />
            </label>
            <div className="flex items-center rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/40 select-none">
              {correo}
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="admin-nombre"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40"
              >
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                id="admin-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fwd-blue focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/20"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label
                htmlFor="admin-apellido"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/40"
              >
                Apellido
              </label>
              <input
                id="admin-apellido"
                type="text"
                value={segundoApellido}
                onChange={(e) => setSegundoApellido(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fwd-blue focus:bg-white/10 focus:ring-4 focus:ring-fwd-blue/20"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          {/* Teléfono y Rol */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Teléfono — bloqueado (campo no disponible en DB aún) */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
                Teléfono
                <Lock className="h-3 w-3 text-white/25" />
              </label>
              <div className="flex items-center rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/30 select-none italic">
                No disponible
              </div>
            </div>

            {/* Rol — bloqueado */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
                Rol
                <Lock className="h-3 w-3 text-white/25" />
              </label>
              <div className="flex items-center rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/50 select-none">
                {ETIQUETA_ROL[rol] ?? rol}
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={sinCambios || guardando || subiendo}
              className="inline-flex items-center gap-2 rounded-xl bg-fwd-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-fwd-blue/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
