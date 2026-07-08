"use client";

export default function DescargaPDFButton() {
  const handleDownload = () => {
    window.print();
  };

  return (
    <button
      onClick={handleDownload}
      className="group relative inline-flex items-center gap-2 font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)] active:scale-95 border border-white/30 text-white/80 hover:text-white hover:border-white/60"
    >
      <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span className="relative z-10">Descargar PDF</span>
      <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-white/10 skew-x-[-20deg] transition-transform duration-700" />
    </button>
  );
}
