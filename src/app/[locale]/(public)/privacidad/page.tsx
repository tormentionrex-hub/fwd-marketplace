import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { FwdLogo } from "@/components/ui/fwd-logo";

export const metadata: Metadata = {
  title: "Política de Privacidad · FWD Costa Rica",
};

const SECTIONS = [
  {
    title: "1. Responsable del tratamiento",
    body: "FWD · Costa Rica es responsable del tratamiento de los datos personales que recopilamos a través de FWD Marketplace. Tratamos tus datos conforme a la legislación costarricense de protección de datos.",
  },
  {
    title: "2. Datos que recopilamos",
    body: "Recopilamos los datos que nos proporcionás al registrarte y usar la plataforma: nombre, correo electrónico, foto de perfil, habilidades, proyectos de portafolio y la información asociada a tus ofertas y evaluaciones.",
  },
  {
    title: "3. Finalidad del tratamiento",
    body: "Usamos tus datos para operar la plataforma: crear y mostrar tu perfil, conectar estudiantes con empresarios, gestionar ofertas y notificaciones, y mejorar tu experiencia. No vendemos tus datos a terceros.",
  },
  {
    title: "4. Perfil público",
    body: "Parte de tu información (nombre, foto, resumen, habilidades y portafolio) se muestra en tu perfil público para que los empresarios puedan conocerte. Vos controlás ese contenido desde el editor de perfil.",
  },
  {
    title: "5. Conservación de los datos",
    body: "Conservamos tus datos mientras tu cuenta esté activa y durante el tiempo necesario para cumplir obligaciones legales. Podés solicitar la eliminación de tu cuenta y datos en cualquier momento.",
  },
  {
    title: "6. Tus derechos",
    body: "Tenés derecho a acceder, rectificar, actualizar y eliminar tus datos personales, así como a oponerte a su tratamiento. Para ejercerlos, escribinos por los canales oficiales de FWD · Costa Rica.",
  },
  {
    title: "7. Seguridad",
    body: "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos. Las contraseñas se almacenan cifradas y los accesos están protegidos por roles y verificación.",
  },
  {
    title: "8. Cambios a esta política",
    body: "Podemos actualizar esta Política de Privacidad. Los cambios se publicarán en esta página y, cuando corresponda, se notificarán a los usuarios registrados.",
  },
  {
    title: "9. Contacto",
    body: "Para consultas sobre privacidad o el tratamiento de tus datos, escribinos a través de los canales oficiales de FWD · Costa Rica.",
  },
];

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-fwd-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <FwdLogo />
          <Link
            href="/terminos"
            className="text-sm font-semibold text-fwd-blue transition hover:text-fwd-purple"
          >
            Términos y Condiciones →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fwd-blue">
          FWD · Costa Rica
        </p>
        <h1 className="mt-3 font-display text-4xl font-black text-fwd-ink">
          Política de Privacidad
        </h1>
        <p className="mt-3 text-fwd-ink/60">Última actualización: junio de 2026.</p>

        <div
          role="note"
          className="mt-6 rounded-xl border border-fwd-yellow/40 bg-fwd-yellow/10 px-4 py-3 text-sm text-fwd-ink/70"
        >
          Borrador preliminar. Este contenido es un marcador de posición y debe ser reemplazado por
          el texto legal definitivo antes de publicar.
        </div>

        <div className="mt-10 flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-bold text-fwd-ink">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-fwd-ink/70">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-fwd-ink/10 pt-6">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white shadow-sm transition hover:bg-fwd-purple"
          >
            Volver y crear cuenta
            <span>▶</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
