"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const imagenes = [
  "/imagenes/estudiante%20(1).jpeg",
  "/imagenes/estudiante%20(2).jpeg",
  "/imagenes/estudiante%20(3).jpeg",
  "/imagenes/estudiante%20(4).jpeg",
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
    </div>
  );
}
