import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { FwdLogo } from "@/components/ui/fwd-logo";

export const metadata: Metadata = {
  title: "Términos y Condiciones · FWD Costa Rica",
};

const SECTIONS = [
  {
    title: "1. Aceptación de los términos",
    body: "Al crear una cuenta y utilizar FWD Marketplace, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, no debes registrarte ni usar la plataforma.",
  },
  {
    title: "2. Uso de la plataforma",
    body: "FWD Marketplace conecta a estudiantes, ex-estudiantes y empresarios de la comunidad. Te comprometes a usar la plataforma de forma lícita, respetuosa y conforme a la legislación de Costa Rica.",
  },
  {
    title: "3. Registro y cuenta",
    body: "Eres responsable de la veracidad de los datos que proporcionas (nombre, cédula, edad y lugar de residencia) y de mantener la confidencialidad de tu contraseña. Cualquier actividad realizada desde tu cuenta es responsabilidad tuya.",
  },
  {
    title: "4. Roles: Estudiante y Empresario",
    body: "Según el rol elegido al registrarte, tendrás acceso a distintas funciones. La selección de un rol no garantiza beneficios específicos y puede estar sujeta a verificación.",
  },
  {
    title: "5. Privacidad y datos personales",
    body: "Tratamos tus datos conforme a nuestra Política de Privacidad y a la normativa aplicable. Tus datos se utilizan para operar la plataforma y mejorar tu experiencia; no se venden a terceros.",
  },
  {
    title: "6. Propiedad intelectual",
    body: "La marca FWD, su logotipo, colores y el sistema gráfico son propiedad de FWD · Costa Rica. No se permite su uso, reproducción o modificación sin autorización.",
  },
  {
    title: "7. Limitación de responsabilidad",
    body: "FWD Marketplace se ofrece «tal cual». No garantizamos disponibilidad ininterrumpida ni nos hacemos responsables de acuerdos entre usuarios fuera de la plataforma.",
  },
  {
    title: "8. Modificaciones",
    body: "Podemos actualizar estos términos en cualquier momento. Los cambios se publicarán en esta página y, cuando corresponda, se notificarán a los usuarios registrados.",
  },
  {
    title: "9. Contacto",
    body: "Para consultas sobre estos términos, escríbenos a través de los canales oficiales de FWD · Costa Rica.",
  },
];

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-fwd-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <FwdLogo />
          <Link
            href="/register"
            className="text-sm font-semibold text-fwd-blue transition hover:text-fwd-purple"
          >
            ← Volver al registro
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fwd-blue">
          FWD · Costa Rica
        </p>
        <h1 className="mt-3 font-display text-4xl font-black text-fwd-ink">
          Términos y Condiciones
        </h1>
        <p className="mt-3 text-fwd-ink/60">
          Última actualización: junio de 2026.
        </p>

        <div
          role="note"
          className="mt-6 rounded-xl border border-fwd-yellow/40 bg-fwd-yellow/10 px-4 py-3 text-sm text-fwd-ink/70"
        >
          Borrador preliminar. Este contenido es un marcador de posición y debe
          ser reemplazado por el texto legal definitivo antes de publicar.
        </div>

        <div className="mt-10 flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-bold text-fwd-ink">
                {section.title}
              </h2>
              <p className="mt-2 leading-relaxed text-fwd-ink/70">
                {section.body}
              </p>
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
