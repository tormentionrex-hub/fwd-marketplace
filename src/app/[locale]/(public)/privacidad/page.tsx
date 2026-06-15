import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import AnimatedProjectsTitle from "@/components/AnimatedProjectsTitle";
import type { ReactNode } from "react";

const SECCIONES = [
  { id: "sec1", titulo: "1. Responsable del tratamiento" },
  { id: "sec2", titulo: "2. Datos que recopilamos" },
  { id: "sec3", titulo: "3. Finalidad del tratamiento" },
  { id: "sec4", titulo: "4. Perfil público" },
  { id: "sec5", titulo: "5. Conservación de los datos" },
  { id: "sec6", titulo: "6. Tus derechos" },
  { id: "sec7", titulo: "7. Seguridad" },
  { id: "sec8", titulo: "8. Cambios a esta política" },
  { id: "sec9", titulo: "9. Contacto" },
];

const COLORES = ["#008FD5","#ED008C","#662D91","#20BEC6","#F7901E","#FFCB05","#008FD5","#ED008C","#662D91"];

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-16 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #1a0a40 50%, #662D91 85%, #20BEC6 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 70% 40%, rgba(32,190,198,0.15) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-[#20BEC6] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Legal · Privacidad
          </span>
          <AnimatedProjectsTitle text="Política de Privacidad" className="text-center mb-4" />
          <p className="text-white/50 text-sm mb-3">Última actualización: Junio 2026</p>
          <p className="text-white/70 text-base max-w-xl mx-auto">
            Tu privacidad es importante para nosotros. Conocé cómo tratamos tus datos conforme a la Ley N° 8968 de Costa Rica.
          </p>
        </div>
      </section>

      {/* ── CONTENIDO ────────────────────────────────── */}
      <section className="flex-1" style={{ background: "#f7f6f4" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex gap-12 items-start">

            {/* Índice lateral sticky */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="font-black text-xs uppercase tracking-widest text-[#20BEC6] mb-4">
                  Contenido
                </p>
                <nav className="flex flex-col gap-1">
                  {SECCIONES.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="text-sm text-gray-500 hover:text-[#662D91] hover:translate-x-1 transition-all duration-200 py-1.5 border-l-2 border-transparent hover:border-[#20BEC6] pl-3 leading-snug"
                    >
                      {s.titulo}
                    </a>
                  ))}
                </nav>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href="/terminos"
                    className="text-xs text-[#008FD5] hover:text-[#662D91] transition-colors font-semibold"
                  >
                    Ver Términos y Condiciones →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Secciones */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {SECCIONES.map((s, i) => (
                <Seccion key={s.id} id={s.id} titulo={s.titulo} color={COLORES[i] ?? "#008FD5"}>
                  {CONTENIDO[i]}
                </Seccion>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #1a0a40 50%, #662D91 85%, #20BEC6 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(32,190,198,0.12) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <p className="text-[#20BEC6] text-xs font-bold uppercase tracking-widest mb-4">¿Preguntas?</p>
          <h2 className="font-heading font-black text-white text-3xl md:text-4xl mb-4">
            ¿Querés saber más sobre cómo cuidamos tus datos?
          </h2>
          <p className="text-white/60 text-base mb-8">
            Nuestro equipo responde en un máximo de 5 días hábiles.
          </p>
          <a
            href="mailto:contacto@fwdcostarica.com"
            className="group relative inline-flex items-center gap-3 font-black text-sm uppercase tracking-widest px-10 py-4 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(32,190,198,0.4)] active:scale-95 text-white"
            style={{ background: "linear-gradient(90deg,#20BEC6,#008FD4)" }}
          >
            <span className="relative z-10">Contactanos</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/20 skew-x-[-20deg] transition-transform duration-700" />
          </a>
          <p className="text-white/30 text-xs mt-10">
            © 2026 FWD Costa Rica. Todos los derechos reservados.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <Link href="/terminos" className="text-white/40 hover:text-white/70 transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="text-white/40 hover:text-white/70 transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Contenido de cada sección ──────────────────── */
const CONTENIDO: ReactNode[] = [
  "FWD Costa Rica es responsable del tratamiento de los datos personales que recopilamos a través de FWD Marketplace. Tratamos tus datos conforme a la Ley N° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales y su Reglamento, legislación costarricense de protección de datos personales.",
  "Recopilamos los datos que nos proporcionás al registrarte y usar la plataforma: nombre, correo electrónico, foto de perfil, habilidades, proyectos de portafolio y la información asociada a tus ofertas y evaluaciones. Únicamente recopilamos los datos estrictamente necesarios para brindarte el servicio.",
  "Usamos tus datos para operar la plataforma: crear y mostrar tu perfil, conectar estudiantes con empresarios, gestionar ofertas y notificaciones, y mejorar tu experiencia. No vendemos ni cedemos tus datos a terceros sin tu consentimiento expreso.",
  "Parte de tu información (nombre, foto, resumen, habilidades y portafolio) se muestra en tu perfil público para que los empresarios puedan conocerte. Vos controlás ese contenido desde el editor de perfil en cualquier momento.",
  "Conservamos tus datos mientras tu cuenta esté activa y durante el tiempo necesario para cumplir obligaciones legales conforme a la legislación costarricense. Podés solicitar la eliminación de tu cuenta y datos personales en cualquier momento escribiéndonos a contacto@fwdcostarica.com.",
  "Conforme a la Ley N° 8968, tenés derecho a acceder, rectificar, actualizar y eliminar tus datos personales, así como a oponerte a su tratamiento. Para ejercer estos derechos, escribinos a contacto@fwdcostarica.com y te responderemos en un plazo máximo de 5 días hábiles.",
  "Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: contraseñas cifradas, conexiones HTTPS, control de acceso por roles y verificación de identidad para estudiantes. Revisamos periódicamente nuestras prácticas de seguridad.",
  "Podemos actualizar esta Política de Privacidad cuando sea necesario. Los cambios se publicarán en esta página y, cuando corresponda conforme a la ley, se notificarán a los usuarios registrados por correo electrónico con anticipación razonable.",
  "Para consultas sobre privacidad o el tratamiento de tus datos personales, escribinos a contacto@fwdcostarica.com o al +506 7202 5228. FWD Costa Rica, San José, Costa Rica.",
];

/* ── Componente de sección ──────────────────────── */
function Seccion({ id, titulo, color, children }: { id: string; titulo: string; color: string; children: ReactNode }) {
  return (
    <div id={id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 scroll-mt-28">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <h2 className="font-heading font-black text-[#1a0a40] text-xl leading-snug">{titulo}</h2>
      </div>
      <p className="text-gray-600 text-base leading-relaxed">{children}</p>
    </div>
  );
}
