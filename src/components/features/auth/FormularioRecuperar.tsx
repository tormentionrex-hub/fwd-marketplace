"use client";

import Link from "next/link";
import { useState } from "react";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { IconCheck, IconMail, IconLock } from "@/components/ui/icons";

type Paso = "solicitar" | "nueva";

interface FormularioRecuperarProps {
  locale: string;
  pasoInicial: Paso;
}

export default function FormularioRecuperar({
  locale,
  pasoInicial,
}: FormularioRecuperarProps) {
  if (pasoInicial === "nueva") {
    return <PasoNuevaContrasena locale={locale} />;
  }
  return <PasoSolicitarEnlace />;
}

function ExitoIcono() {
  return (
    <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <IconCheck />
    </span>
  );
}

function PasoSolicitarEnlace() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <ExitoIcono />
        <p className="text-lg font-semibold text-text">Revisá tu bandeja de entrada</p>
        <p className="text-sm text-text-muted">
          Enviamos un enlace de recuperación a{" "}
          <span className="font-medium text-text">{correo}</span>. Es de un solo uso y expira en 1 hora.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setEnviado(true);
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-text-muted">
        Ingresá tu correo registrado y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <Input
        type="email"
        required
        value={correo}
        onChange={(event) => setCorreo(event.target.value)}
        label="Correo electrónico"
        placeholder="tucorreo@ejemplo.com"
        icon={<IconMail width={18} height={18} />}
      />
      <Button type="submit" fullWidth size="lg" className="mt-2">
        Enviar enlace de recuperación
      </Button>
    </form>
  );
}

function PasoNuevaContrasena({ locale }: { locale: string }) {
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [guardada, setGuardada] = useState(false);

  const coinciden = contrasena.length >= 8 && contrasena === confirmar;
  const errorConfirmar =
    confirmar.length > 0 && contrasena !== confirmar ? "Las contraseñas no coinciden." : undefined;

  if (guardada) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <ExitoIcono />
        <p className="text-lg font-semibold text-text">Contraseña actualizada</p>
        <Button href={`/${locale}/login`} size="lg">
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!coinciden) return;
        setGuardada(true);
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-text-muted">Definí tu nueva contraseña (mínimo 8 caracteres).</p>
      <PasswordInput
        required
        value={contrasena}
        onChange={(event) => setContrasena(event.target.value)}
        label="Nueva contraseña"
        placeholder="Mínimo 8 caracteres"
        icon={<IconLock width={18} height={18} />}
      />
      <PasswordInput
        required
        value={confirmar}
        onChange={(event) => setConfirmar(event.target.value)}
        label="Confirmar contraseña"
        placeholder="Repetí la contraseña"
        icon={<IconLock width={18} height={18} />}
        error={errorConfirmar}
      />
      <Button type="submit" disabled={!coinciden} fullWidth size="lg" className="mt-2">
        Guardar contraseña
      </Button>
      <p className="text-center text-sm text-text-muted">
        <Link href={`/${locale}/login`} className="font-medium text-fwd-azul hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
