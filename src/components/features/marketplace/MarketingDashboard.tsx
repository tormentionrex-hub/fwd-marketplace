"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  AlertCircle,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Users,
  Download,
  Filter,
  FileText,
  FileImage,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Globe2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Target,
  ChevronDown,
} from "lucide-react";
import PlatformSummaryCard from "@/components/ui/PlatformSummaryCard";
import TrendCard from "@/components/ui/TrendCard";
import KpiCard from "@/components/ui/KpiCard";
import FilterBar from "@/components/ui/FilterBar";
import {
  MarketingInsightsPayload,
  MarketingPlatformReach,
  MarketingTrend,
} from "@/types/marketing";

// Colores FWD
const FWD = {
  navy: "#0B1F3A",
  cyan: "#00AEEF",
  magenta: "#EC008C",
  purple: "#6A35FF",
  white: "#FFFFFF",
};

const platformColors: Record<string, string> = {
  YouTube: FWD.magenta,
  Facebook: FWD.cyan,
  Instagram: "#D4A5FF",
  TikTok: FWD.white,
  LinkedIn: FWD.purple,
};

// --- Hooks & Utilities ---

function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function useAutoRefresh(fetchData: () => Promise<void>) {
  const [countdown, setCountdown] = useState(180);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("syncing");
  const [showToast, setShowToast] = useState(false);

  const performSync = useCallback(async () => {
    setSyncStatus("syncing");
    try {
      await fetchData();
      setLastUpdated(new Date());
      setSyncStatus("synced");
      setCountdown(180);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setSyncStatus("error");
    }
  }, [fetchData]);

  useEffect(() => {
    void performSync();
  }, [performSync]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void performSync();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [performSync]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "--:--:--";
    return date.toLocaleTimeString("es-CR", { hour12: false });
  };

  return { countdown, lastUpdated, syncStatus, showToast, formatCountdown, formatTime };
}

// --- Componentes Reutilizables ---

function FloatingParticles({ contained = false }: { contained?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    const getSize = () => ({
      w: contained ? (canvas.parentElement?.offsetWidth ?? window.innerWidth) : window.innerWidth,
      h: contained ? (canvas.parentElement?.offsetHeight ?? window.innerHeight) : window.innerHeight,
    });

    const resize = () => {
      const { w, h } = getSize();
      canvas.width = w;
      canvas.height = h;
      init();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        const { w, h } = getSize();
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = contained ? Math.random() * 2 + 2 : Math.random() * 3 + 3;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas!.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.speedY *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = "rgba(0, 174, 239, 0.5)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(0, 174, 239, 0.8)";
      }
    }

    const init = () => {
      particlesArray = [];
      const { w, h } = getSize();
      const density = contained ? 8000 : 12000;
      const count = Math.min((w * h) / density, contained ? 40 : 100);
      for (let i = 0; i < count; i++) {
        particlesArray.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        const pi = particlesArray[i];
        if (!pi) continue;
        pi.update();
        pi.draw();
        for (let j = i; j < particlesArray.length; j++) {
          const pj = particlesArray[j];
          if (!pj) continue;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const linkDist = contained ? 100 : 140;
          if (distance < linkDist) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 174, 239, ${(contained ? 0.18 : 0.2) - distance / (linkDist * 5)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [contained]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 rounded-3xl" />;
}

// --- Main Dashboard ---

export default function MarketingDashboard() {
  const [data, setData] = useState<MarketingInsightsPayload | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchInsights = useCallback(async () => {
    // Build query string from filters
    const params = new URLSearchParams(filters);
    const url = `/api/marketing/insights${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const payload = await res.json();
    setData(payload);
  }, [filters]);

  const { countdown, lastUpdated, syncStatus, showToast, formatCountdown, formatTime } = useAutoRefresh(fetchInsights);

  const reachData = useMemo(() => {
    return data?.platformReach.map((platform) => ({
      name: platform.platform,
      audiencia: platform.audienceMillions,
      color: platformColors[platform.platform] ?? FWD.cyan,
    })) ?? [];
  }, [data]);

  const trendCurve = useMemo(() => {
    return data?.platformReach.map((platform) => ({
      name: platform.platform,
      crecimiento: platform.annualGrowthPercent ?? 0,
    })) ?? [];
  }, [data]);

  const kpis = useMemo(() => {
    if (!data) return null;
    const maxGrowth = [...data.platformReach].sort((a, b) => (b.annualGrowthPercent ?? 0) - (a.annualGrowthPercent ?? 0))[0];
    const maxPenetration = [...data.platformReach].sort((a, b) => b.populationReachPercent - a.populationReachPercent)[0];
    const topTrend = data.trends[0];
    const employmentMetric = data.metrics.find(m => m.kind === "employment");
    const audienceMetric = data.metrics.find(m => m.kind === "audience");
    const totalReach = audienceMetric?.displayValue ?? `${data.metrics.find(m => m.id === "cr-social-users")?.value ?? 0} M`;
    return {
      totalReach,
      maxGrowth: maxGrowth ? `${maxGrowth.platform} (+${maxGrowth.annualGrowthPercent}%)` : "N/D",
      maxPenetration: maxPenetration ? `${maxPenetration.platform} (${maxPenetration.populationReachPercent}%)` : "N/D",
      topTrend: topTrend ? topTrend.value : "N/D",
      employment: employmentMetric ? employmentMetric.displayValue : "N/D",
      audience: audienceMetric ? audienceMetric.displayValue : "N/D",
    };
  }, [data]);

  const handleExport = (type: string) => {
    if (type === "pdf") window.print();
    else alert(`La exportación a ${type} requeriría una integración backend para generar el archivo.`);
  };

  return (
    <section className="relative min-h-screen overflow-hidden py-10 text-white selection:bg-[#EC008C] selection:text-white" style={{ background: "linear-gradient(135deg, #0B1F3A 0%, #1a1050 25%, #2d0a4e 45%, #0d2d4a 65%, #0a1f3d 85%, #0B1F3A 100%)" }}>
      {/* Fondos */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at top right, rgba(0,174,239,0.2) 0%, transparent 45%), radial-gradient(ellipse at bottom left, rgba(236,0,140,0.18) 0%, transparent 45%), radial-gradient(ellipse at center, rgba(106,53,255,0.15) 0%, transparent 60%)" }} />

      {/* Toast Sincronización */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1F3A]/90 p-4 shadow-2xl backdrop-blur-xl transition-all duration-500 ${showToast ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}`}>
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-sm font-bold text-white">Datos sincronizados</p>
          <p className="text-xs text-white/60">Actualizado a las {formatTime(lastUpdated)}</p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-[#00AEEF]">
                <Activity className="h-3.5 w-3.5" /> FWD Intelligence
              </span>
              
              {/* Sync Status Badge */}
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold">
                {syncStatus === "syncing" && <RefreshCw className="h-3.5 w-3.5 animate-spin text-yellow-400" />}
                {syncStatus === "synced" && <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                {syncStatus === "error" && <div className="h-2 w-2 rounded-full bg-rose-500" />}
                <span className="text-white/70">
                  {syncStatus === "syncing" ? "Actualizando..." : syncStatus === "error" ? "Error conexión" : `Actualizado: ${formatTime(lastUpdated)}`}
                </span>
                {syncStatus === "synced" && (
                  <span className="ml-2 border-l border-white/20 pl-2 text-white/50">
                    Próxima en {formatCountdown(countdown)}
                  </span>
                )}
              </div>
            </div>

            <h1 className="mt-6 font-heading text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Dashboard de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#6A35FF]">Inteligencia Digital</span><br/> y Audiencias en Costa Rica
            </h1>
          </div>

          <div className="flex flex-col items-end gap-4 print-only:hidden">
            {/* FilterBar component for dynamic filters */}
            <FilterBar onChange={setFilters} />

            {/* Botones de Exportación */}
            <div className="flex items-center gap-2">
              <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition">
                <FileText className="h-4 w-4" /> PDF
              </button>
              <button onClick={() => handleExport('png')} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition">
                <FileImage className="h-4 w-4" /> PNG
              </button>
              <button onClick={() => handleExport('excel')} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition">
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </button>
            </div>
          </div>
        </div>

        {/* KPIs Superiores */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard title="Alcance Total Digital" value={kpis?.totalReach || "..."} subtitle="Usuarios únicos aprox." icon={Globe2} color={FWD.cyan} />
          <KpiCard title="Mayor Crecimiento" value={kpis?.maxGrowth || "..."} subtitle="Variación interanual" icon={TrendingUp} color={FWD.magenta} />
          <KpiCard title="Mayor Penetración" value={kpis?.maxPenetration || "..."} subtitle="Porcentaje de la población" icon={Target} color={FWD.purple} />
          <KpiCard title="Tendencia IA" value={kpis?.topTrend || "..."} subtitle="Productividad global" icon={Bot} color={FWD.white} />
          <KpiCard title="Empleo" value={kpis?.employment || "..."} subtitle="Indicador de empleo" icon={Users} color={FWD.purple} />
        </div>

        {/* Layout Principal Grid */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
          
          {/* Columna Izquierda: Gráfico principal de audiencias */}
          <div className="flex flex-col">
            <div className="group flex-1 rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,174,239,0.15)] hover:border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-2xl font-black text-white">Audiencias Publicitarias en Costa Rica</h3>
                  <p className="text-sm text-white/50">Millones de personas alcanzables por plataforma</p>
                </div>
              </div>

              <div className="mt-8 h-[400px] w-full">
                <style dangerouslySetInnerHTML={{ __html: `
                  .recharts-bar-rectangle {
                    transition: all 0.3s ease;
                    transform-box: fill-box;
                    transform-origin: bottom;
                  }
                  .recharts-bar-rectangle:hover {
                    transform: scaleY(1.03) translateY(-8px);
                    filter: brightness(1.2) drop-shadow(0 10px 15px rgba(0, 174, 239, 0.4));
                  }
                `}} />
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reachData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={{ backgroundColor: "#0B1F3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                      itemStyle={{ fontWeight: "bold" }}
                      formatter={(value: unknown) => [`${value} Millones`, "Audiencia"]}
                    />
                    <Bar dataKey="audiencia" radius={[12, 12, 0, 0]} animationDuration={1500} animationEasing="ease-out">
                      {reachData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas de Plataforma */}
          <div className="flex flex-col gap-4">
            {data?.platformReach.map((platform) => (
              <PlatformSummaryCard key={platform.platform} item={platform} />
            ))}
          </div>

        </div>

        {/* Bottom Section: IA & Empleo + Crecimiento Anual */}
        <div className="relative mt-6 overflow-hidden rounded-3xl">
          <FloatingParticles contained />
          <div className="relative z-10 grid gap-6 xl:grid-cols-2">
          
          {/* IA y Empleo */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(236,0,140,0.15)] hover:border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EC008C]/10 text-[#EC008C]">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#EC008C]">Insights Estratégicos</p>
                <h3 className="font-heading text-2xl font-black text-white">IA y Empleo – Tendencias para FWD</h3>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {data?.trends.map(trend => (
                <TrendCard key={trend.id} trend={trend} />
              ))}
            </div>
          </div>

          {/* Crecimiento Anual Area Chart */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(106,53,255,0.15)] hover:border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6A35FF]/10 text-[#6A35FF]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#6A35FF]">Crecimiento Anual</p>
                <h3 className="font-heading text-2xl font-black text-white">Señales para priorizar canales</h3>
              </div>
            </div>

            <div className="mt-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendCurve} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCrecimiento" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={FWD.cyan} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={FWD.purple} stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="fillCrecimiento" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={FWD.purple} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={FWD.cyan} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0B1F3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                    itemStyle={{ color: "#fff", fontWeight: "bold" }}
                    formatter={(value: unknown) => [`${value}%`, "Crecimiento Anual"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="crecimiento"
                    stroke="url(#colorCrecimiento)"
                    strokeWidth={4}
                    fill="url(#fillCrecimiento)"
                    animationDuration={2000}
                    dot={{ r: 6, fill: "#0B1F3A", stroke: FWD.cyan, strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: "#fff", stroke: FWD.purple, strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          </div>{/* end z-10 grid */}
        </div>{/* end relative wrapper */}

        {/* Footer info */}
        <div className="mt-12 flex items-center justify-center border-t border-white/10 pt-6">
          <p className="flex items-center gap-2 text-sm text-white/40">
            <Clock className="h-4 w-4" />
            Datos sincronizados automáticamente cada 3 minutos para garantizar información actualizada y relevante.
          </p>
        </div>

      </div>
    </section>
  );
}
