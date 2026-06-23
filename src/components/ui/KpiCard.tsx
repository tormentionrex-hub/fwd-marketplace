import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  className?: string;
}

export default function KpiCard({ title, value, subtitle, icon: IconComponent, color, className }: KpiCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">{title}</p>
          <p className="mt-2 font-heading text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-sm text-white/60">{subtitle}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5" style={{ color }}>
          <IconComponent className="h-6 w-6" />
        </span>
      </div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: color }} />
    </div>
  );
}
