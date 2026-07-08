/* eslint-disable @next/next/no-img-element */
// Fondo decorativo animado del dashboard de estudiante: glows suaves (aurora),
// estrellitas que parpadean, y los personajes Fordy flotando como astronautas
// en el espacio. Capa fija detrás del contenido (-z-10), sin interacción
// (pointer-events-none), adaptada a modo claro/oscuro. Respeta
// prefers-reduced-motion (las animaciones se apagan por CSS).

// Fordys recortados con fondo transparente (public/imagenes/fordy/).
// El giro/flip va en el <span> contenedor y la animación en la <img>, para que
// los transforms (rotate/scale vs. translate de la animación) no se pisen.
// 5 Fordys como stickers sutiles en zonas vacías del centro/márgenes.
// (Los otros 2 van DENTRO del sidebar → total 7). Semi-transparentes para que
// "se adapten al entorno" sin llamar la atención.
// Posiciones DENTRO de la zona de contenido (a la derecha del sidebar, que es
// opaco): todas con left ≥ ~26% para que no queden tapadas por el sidebar.
const FORDYS = [
  { src: "fordy-telescopio", pos: "left-[26%] top-[26%]", giro: "-rotate-6", alto: "h-20", anim: "animate-float", delay: "0s" },
  { src: "fordy-bandera", pos: "left-[29%] top-[82%]", giro: "rotate-3", alto: "h-16", anim: "animate-drift", delay: "2.2s" },
  { src: "fordy-lentes", pos: "left-[90%] top-[22%]", giro: "-scale-x-100 rotate-6", alto: "h-16", anim: "animate-drift", delay: "1.4s" },
  { src: "fordy-fuego", pos: "left-[91%] top-[62%]", giro: "-scale-x-100", alto: "h-14", anim: "animate-float", delay: "0.8s" },
  { src: "fordy-audifonos", pos: "left-[53%] top-[90%]", giro: "rotate-6", alto: "h-16", anim: "animate-float", delay: "3.4s" },
];

export default function FondoEstudiante() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden">
      {/* Glows grandes y difusos (aurora) — más visibles */}
      <div className="animate-aurora absolute -left-32 -top-24 h-96 w-96 rounded-full bg-[#662D91]/25 blur-3xl dark:bg-[#662D91]/35" />
      <div className="animate-aurora absolute right-[-6%] top-24 h-80 w-80 rounded-full bg-[#008FD4]/20 blur-3xl [animation-delay:5s] dark:bg-[#008FD4]/30" />
      <div className="animate-aurora absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-[#EC008C]/18 blur-3xl [animation-delay:3s] dark:bg-[#EC008C]/28" />
      <div className="animate-aurora absolute bottom-[-12%] left-1/3 h-96 w-96 rounded-full bg-[#20BEC6]/20 blur-3xl [animation-delay:9s] dark:bg-[#20BEC6]/30" />

      {/* Un par de orbes suaves para dar profundidad */}
      <span className="animate-float absolute left-[70%] top-[16%] h-10 w-10 rounded-full bg-[#20BEC6]/20 blur-[2px] [animation-delay:1.5s] dark:bg-[#20BEC6]/30" />
      <span className="animate-drift absolute left-[24%] top-[68%] h-14 w-14 rounded-full bg-[#EC008C]/15 blur-[2px] [animation-delay:4s] dark:bg-[#EC008C]/25" />
      <span className="animate-float absolute left-[58%] top-[80%] h-12 w-12 rounded-full bg-[#662D91]/18 blur-sm [animation-delay:3.2s] dark:bg-[#8B5CF6]/28" />

      {/* Estrellitas que parpadean (nítidas) — más visibles */}
      <span className="animate-twinkle absolute left-[20%] top-[38%] h-2 w-2 rounded-full bg-[#662D91]/55 dark:bg-white/60" />
      <span className="animate-twinkle absolute left-[80%] top-[28%] h-1.5 w-1.5 rounded-full bg-[#008FD4]/60 [animation-delay:1s] dark:bg-white/50" />
      <span className="animate-twinkle absolute left-[35%] top-[85%] h-2 w-2 rounded-full bg-[#EC008C]/55 [animation-delay:2s] dark:bg-white/60" />
      <span className="animate-twinkle absolute left-[64%] top-[24%] h-1.5 w-1.5 rounded-full bg-[#20BEC6]/60 [animation-delay:2.6s] dark:bg-white/50" />
      <span className="animate-twinkle absolute left-[52%] top-[58%] h-2 w-2 rounded-full bg-[#662D91]/50 [animation-delay:3.4s] dark:bg-white/55" />
      <span className="animate-twinkle absolute left-[8%] top-[62%] h-1.5 w-1.5 rounded-full bg-[#20BEC6]/55 [animation-delay:0.5s] dark:bg-white/50" />

      {/* Fordys flotando como astronautas */}
      {FORDYS.map((f) => (
        <span key={f.src} className={`absolute ${f.pos} ${f.giro}`}>
          <img
            src={`/imagenes/fordy/${f.src}.png`}
            alt=""
            className={`${f.alto} w-auto ${f.anim} opacity-[0.55] drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)] dark:opacity-50`}
            style={{ animationDelay: f.delay }}
          />
        </span>
      ))}
    </div>
  );
}
