import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { getUser } from "@/server/auth/get-user";
import { rutaPorRol } from "@/server/auth/rutas";
import AnimatedProjectsTitle from "@/components/AnimatedProjectsTitle";
import DescargaPDFButton from "@/components/DescargaPDFButton";
import Image from "next/image";
import type { ReactNode } from "react";

const SECCIONES = [
  { id: "seccion1",  titulo: "1. Aceptación de los Términos" },
  { id: "seccion2",  titulo: "2. Descripción del Servicio" },
  { id: "seccion3",  titulo: "3. Registro y Cuentas" },
  { id: "seccion4",  titulo: "4. Roles y Responsabilidades" },
  { id: "seccion5",  titulo: "5. Propiedad Intelectual" },
  { id: "seccion6",  titulo: "6. Protección de Datos" },
  { id: "seccion7",  titulo: "7. Derechos del Consumidor" },
  { id: "seccion8",  titulo: "8. Conducta del Usuario" },
  { id: "seccion9",  titulo: "9. Limitación de Responsabilidad" },
  { id: "seccion10", titulo: "10. Modificaciones y Vigencia" },
];

export default async function TerminosPage() {
  const user = await getUser();
  const dashboardHref = user ? rutaPorRol(user.roles.nombre) : null;
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Encabezado solo para impresión/PDF ─────── */}
      <div className="print-only hidden" style={{ display: "none" }}>
        {/* Franja de colores top */}
        <div className="print-stripe" style={{
          display: "flex", height: "6px", marginBottom: "0",
        }}>
          {["#20BEC6","#008FD5","#FFCB05","#F7901E","#ED008C","#662D91"].map((c) => (
            <div key={c} style={{ flex: 1, backgroundColor: c }} />
          ))}
        </div>

        <div style={{
          background: "linear-gradient(135deg, #0e1628 0%, #2a1060 55%, #7b1fa2 85%, #ED008C 100%)",
          padding: "24px 48px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Image src="/imagenes/fwd-marketplace.png" alt="FWD Marketplace" width={200} height={158} style={{ height: "48px", width: "auto" }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#20BEC6", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Documento Legal</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", margin: "4px 0 0" }}>Última actualización: Junio 2026</p>
          </div>
        </div>
        <div style={{ padding: "0 48px 24px", borderBottom: "3px solid #20BEC6", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1a0a40", margin: 0 }}>Términos y Condiciones</h1>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "6px" }}>
            Al usar la plataforma FWD Costa Rica aceptás estos términos conforme a las leyes de Costa Rica.
          </p>
        </div>
      </div>

      <Navbar dashboardHref={dashboardHref} />

      {/* ── HERO ─────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-16 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #2a1060 55%, #7b1fa2 85%, #ED008C 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(32,190,198,0.15) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-[#20BEC6] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Legal
          </span>
          <AnimatedProjectsTitle
            text="Términos y Condiciones"
            className="text-center mb-4"
          />
          <p className="text-white/50 text-sm mb-3">Última actualización: Junio 2026</p>
          <p className="text-white/70 text-base max-w-xl mx-auto mb-8">
            Al usar la plataforma aceptás estos términos conforme a las leyes de Costa Rica.
          </p>
          <DescargaPDFButton />
        </div>
      </section>

      {/* ── CONTENIDO ────────────────────────────────── */}
      <section className="print-content flex-1" style={{ background: "#f7f6f4" }}>
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
              </div>
            </aside>

            {/* Secciones */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">

              <Seccion id="seccion1" titulo="1. Aceptación de los Términos" color="#008FD5">
                Al registrarse y utilizar la Plataforma de Conexión de Talento Tecnológico FWD Costa Rica
                (en adelante &ldquo;la Plataforma&rdquo;), el usuario acepta en su totalidad los presentes
                Términos y Condiciones, conforme a lo dispuesto en la Ley N° 8454 de Certificados, Firmas
                Digitales y Documentos Electrónicos de Costa Rica, que reconoce la validez jurídica de los
                acuerdos celebrados por medios electrónicos.
              </Seccion>

              <Seccion id="seccion2" titulo="2. Descripción del Servicio" color="#ED008C">
                La Plataforma es un ecosistema digital que conecta a empresarios y emprendedores con
                estudiantes egresados verificados de FWD Costa Rica, mediante la publicación y desarrollo
                de proyectos tecnológicos reales. Los servicios incluyen: publicación de proyectos con
                asistencia de inteligencia artificial, envío de ofertas y prototipos por parte de
                estudiantes, sistema de adjudicación y entrega de proyectos, y sistema de reputación y
                evaluación de talento.
              </Seccion>

              <Seccion id="seccion3" titulo="3. Registro y Cuentas de Usuario" color="#662D91">
                Para utilizar la Plataforma el usuario debe registrarse con información veraz, completa y
                actualizada. Conforme a la Ley N° 8968 de Protección de la Persona frente al Tratamiento
                de sus Datos Personales, el usuario consiente el tratamiento de sus datos para los fines
                propios del servicio. El usuario es responsable de mantener la confidencialidad de sus
                credenciales de acceso. Solo pueden participar como estudiantes las personas debidamente
                verificadas como egresados de FWD Costa Rica.
              </Seccion>

              <Seccion id="seccion4" titulo="4. Roles y Responsabilidades" color="#20BEC6">
                La Plataforma contempla tres roles: Administrador, Estudiante y Empresario. El Empresario
                es responsable de la veracidad de la información publicada en sus proyectos. El Estudiante
                garantiza que los prototipos y entregables son de su autoría original. Conforme a la Ley
                N° 6683 de Derechos de Autor y Derechos Conexos, los derechos sobre los entregables
                finales serán acordados entre las partes al momento de la adjudicación.
              </Seccion>

              <Seccion id="seccion5" titulo="5. Propiedad Intelectual" color="#F7901E">
                Los proyectos, prototipos, propuestas y entregables publicados en la Plataforma están
                protegidos por la Ley N° 6683 de Derechos de Autor de Costa Rica. La Plataforma no reclama
                propiedad sobre el contenido generado por los usuarios. El estudiante retiene los derechos
                de su trabajo hasta que se formalice un acuerdo con el empresario. Queda prohibida la
                reproducción, distribución o uso comercial del contenido sin autorización expresa de su autor.
              </Seccion>

              <Seccion id="seccion6" titulo="6. Protección de Datos Personales" color="#FFCB05">
                En cumplimiento de la Ley N° 8968 y su Reglamento, la Plataforma recopila únicamente los
                datos necesarios para la prestación del servicio. Los datos personales no serán vendidos,
                cedidos ni transferidos a terceros sin consentimiento del usuario. El usuario tiene derecho
                de acceso, rectificación y supresión de sus datos personales mediante solicitud a{" "}
                <a href="mailto:contacto@fwdcostarica.com" className="text-[#008FD5] hover:underline font-semibold">
                  contacto@fwdcostarica.com
                </a>. Los datos se almacenan con medidas de seguridad técnicas adecuadas mediante cifrado
                y protocolos HTTPS.
              </Seccion>

              <Seccion id="seccion7" titulo="7. Derechos del Consumidor" color="#008FD5">
                Conforme a la Ley N° 7472 de Promoción de la Competencia y Defensa Efectiva del Consumidor,
                los usuarios tienen derecho a recibir información clara, veraz y suficiente sobre los
                servicios ofrecidos por la Plataforma. La Plataforma se compromete a mantener la
                transparencia en sus procesos y a responder las consultas y reclamos en un plazo máximo
                de 5 días hábiles.
              </Seccion>

              <Seccion id="seccion8" titulo="8. Conducta del Usuario" color="#ED008C">
                El usuario se compromete a no publicar contenido falso, ofensivo, discriminatorio o ilegal.
                Queda prohibido el uso de la Plataforma para actividades fraudulentas o que infrinjan
                derechos de terceros. La Plataforma se reserva el derecho de suspender o cancelar cuentas
                que incumplan estas normas, conforme al procedimiento descrito en las políticas de
                administración.
              </Seccion>

              <Seccion id="seccion9" titulo="9. Limitación de Responsabilidad" color="#662D91">
                La Plataforma actúa como intermediario tecnológico entre empresarios y estudiantes. No es
                parte en los acuerdos celebrados entre usuarios y no garantiza resultados específicos de
                los proyectos. La responsabilidad de la Plataforma se limita a la correcta prestación del
                servicio tecnológico de conexión, conforme a lo establecido en el Código Civil de Costa
                Rica en materia de obligaciones.
              </Seccion>

              <Seccion id="seccion10" titulo="10. Modificaciones y Vigencia" color="#20BEC6">
                La Plataforma se reserva el derecho de modificar estos Términos y Condiciones en cualquier
                momento, notificando a los usuarios registrados por correo electrónico con al menos 15 días
                de anticipación. El uso continuado de la Plataforma tras la notificación implica la
                aceptación de los nuevos términos. Estos términos se rigen por las leyes de la República
                de Costa Rica y cualquier controversia será resuelta ante los Tribunales de Justicia de
                San José, Costa Rica.
              </Seccion>

            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0e1628 0%, #2a1060 55%, #7b1fa2 85%, #ED008C 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(32,190,198,0.12) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <p className="text-[#20BEC6] text-xs font-bold uppercase tracking-widest mb-4">¿Dudas?</p>
          <AnimatedProjectsTitle
            text="¿Tenés alguna consulta sobre estos términos?"
            className="text-center mb-4"
          />
          <p className="text-white/60 text-base mb-8">
            Nuestro equipo está disponible para aclararte cualquier punto.
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

/* ── Componente sección ────────────────────────── */
function Seccion({
  id, titulo, color, children,
}: {
  id: string; titulo: string; color: string; children: ReactNode;
}) {
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
