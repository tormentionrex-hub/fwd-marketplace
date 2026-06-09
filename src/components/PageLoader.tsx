"use client";

import { useEffect, useState } from "react";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    const hide = () => {
      setFading(true);
      setTimeout(() => setVisible(false), 500);
    };

    if (document.readyState === "complete") {
      setTimeout(hide, 400);
    } else {
      window.addEventListener("load", () => setTimeout(hide, 400));
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{
        background: "#0e1628",
        transition: "opacity 0.5s ease",
        opacity: fading ? 0 : 1,
      }}
    >
      {/* Logo FWD pequeño arriba */}
      <div className="fwd-spin mb-12" style={{ filter: "drop-shadow(0 0 20px #20BEC688)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/imagenes/logo-removebg-preview.png" alt="FWD" width={72} height={72} />
      </div>

      {/* Animación de círculos */}
      <div style={{ width: 200, height: 60, position: "relative", zIndex: 1 }}>

        {/* Círculo 1 — teal */}
        <span style={{
          width: 20, height: 20, position: "absolute", borderRadius: "50%",
          backgroundColor: "#20BEC7", left: "15%", transformOrigin: "50%",
          animation: "fwdBounce .5s alternate infinite ease",
        }} />

        {/* Círculo 2 — amarillo */}
        <span style={{
          width: 20, height: 20, position: "absolute", borderRadius: "50%",
          backgroundColor: "#FFCB05", left: "45%", transformOrigin: "50%",
          animation: "fwdBounce .5s alternate infinite ease",
          animationDelay: ".2s",
        }} />

        {/* Círculo 3 — magenta */}
        <span style={{
          width: 20, height: 20, position: "absolute", borderRadius: "50%",
          backgroundColor: "#ED008C", left: "auto", right: "15%", transformOrigin: "50%",
          animation: "fwdBounce .5s alternate infinite ease",
          animationDelay: ".3s",
        }} />

        {/* Sombras */}
        <span style={{
          width: 20, height: 4, borderRadius: "50%", backgroundColor: "rgba(32,190,199,0.35)",
          position: "absolute", top: 62, transformOrigin: "50%", zIndex: -1,
          left: "15%", filter: "blur(1px)",
          animation: "fwdShadow .5s alternate infinite ease",
        }} />
        <span style={{
          width: 20, height: 4, borderRadius: "50%", backgroundColor: "rgba(255,203,5,0.35)",
          position: "absolute", top: 62, transformOrigin: "50%", zIndex: -1,
          left: "45%", filter: "blur(1px)",
          animation: "fwdShadow .5s alternate infinite ease",
          animationDelay: ".2s",
        }} />
        <span style={{
          width: 20, height: 4, borderRadius: "50%", backgroundColor: "rgba(237,0,140,0.35)",
          position: "absolute", top: 62, transformOrigin: "50%", zIndex: -1,
          left: "auto", right: "15%", filter: "blur(1px)",
          animation: "fwdShadow .5s alternate infinite ease",
          animationDelay: ".3s",
        }} />
      </div>

      {/* Texto */}
      <p className="mt-10 text-white/40 text-xs uppercase tracking-[0.3em] font-medium">
        Cargando FWD Costa Rica
      </p>

      <style>{`
        @keyframes fwdBounce {
          0%   { top: 60px; height: 5px; border-radius: 50px 50px 25px 25px; transform: scaleX(1.7); }
          40%  { height: 20px; border-radius: 50%; transform: scaleX(1); }
          100% { top: 0%; }
        }
        @keyframes fwdShadow {
          0%   { transform: scaleX(1.5); }
          40%  { transform: scaleX(1); opacity: .7; }
          100% { transform: scaleX(.2); opacity: .4; }
        }
      `}</style>
    </div>
  );
}
