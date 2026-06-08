"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const imagenes = [
  "/imagenes/estudiante1.png",
  "/imagenes/estudiante2.png",
  "/imagenes/estudiante3.png",
  "/imagenes/estudiante4.png",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % imagenes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Imágenes con transición fade */}
      {imagenes.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={src}
            alt={`Estudiante FWD ${i + 1}`}
            fill
            className="object-cover object-center"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Degradado oscuro sobre la imagen — texto legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(14,22,40,0.88) 40%, rgba(14,22,40,0.55) 75%, rgba(14,22,40,0.30) 100%)",
        }}
      />

      {/* Indicadores de posición */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {imagenes.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Ir a imagen ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? "28px" : "8px",
              height: "8px",
              backgroundColor: i === current ? "#FFCB05" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
