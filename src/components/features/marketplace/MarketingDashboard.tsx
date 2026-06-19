"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
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
} from "recharts";
import {
  AlertCircle,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Globe2,
  Loader2,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import type { MarketingInsightsPayload, MarketingMetric, MarketingPlatformReach } from "@/types/marketing";

const iconByMetric: Record<string, ComponentType<{ className?: string }>> = {
  "cr-internet-users": Globe2,
  "cr-social-users": Share2,
  "cr-mobile-connections": Users,
  "global-social-users": TrendingUp,
};

const platformColors: Record<string, string> = {
  YouTube: "#ef4444",
  Facebook: "#008FD4",
  Instagram: "#ED008C",
  TikTok: "#111827",
  LinkedIn: "#662D91",
};

function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function MetricCard({ metric }: { metric: MarketingMetric }) {
  const Icon = iconByMetric[metric.id] ?? BarChart3;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-[0_18px_50px_rgba(4,19,48,0.22)] backdrop-blur-xl">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#20BEC6]/15" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/12 text-[#20BEC6]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
          {metric.region}
        </span>
      </div>

      <div className="relative mt-5">
        <p className="text-sm font-semibold text-white/70">{metric.label}</p>
        <p className="mt-2 font-heading text-4xl font-black text-white">{metric.displayValue}</p>
        <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-white/68">{metric.context}</p>
      </div>

      <a
        href={metric.source.url}
        target="_blank"
        rel="noreferrer"
        className="relative mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#20BEC6] transition hover:text-white"
      >
        {metric.source.name}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <p className="relative mt-2 text-xs text-white/45">
        Actualizado: {formatSourceDate(metric.source.updatedAt)}
      </p>
    </article>
  );
}

function PlatformRow({ item }: { item: MarketingPlatformReach }) {
  const color = platformColors[item.platform] ?? "#20BEC6";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-heading text-lg font-black text-slate-950">{item.platform}</p>
          <p className="text-sm text-slate-500">{item.note}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-sm font-black text-white" style={{ background: color }}>
          {item.audienceLabel}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(item.populationReachPercent, 100)}%`, background: color }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-slate-500">Poblacion</p>
          <p className="font-black text-slate-950">{item.populationReachPercent}%</p>
        </div>
        <div>
          <p className="text-slate-500">Internet</p>
          <p className="font-black text-slate-950">
            {item.internetReachPercent != null ? `${item.internetReachPercent}%` : "N/D"}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Cambio anual</p>
          <p className={`font-black ${Number(item.annualGrowthPercent) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {item.annualGrowthPercent != null && item.annualGrowthPercent > 0 ? "+" : ""}
            {item.annualGrowthPercent != null ? `${item.annualGrowthPercent}%` : "N/D"}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-6 text-slate-900 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-lg font-black">No se pudieron cargar los datos de Marketing</p>
            <p className="mt-1 text-sm text-slate-600">
              Intenta de nuevo. Si el problema continua, el dashboard mantiene los datos versionados en el servidor.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#662D91] px-4 py-3 text-sm font-black text-white transition hover:bg-[#4f2374]"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    </div>
  );
}

export default function MarketingDashboard() {
  const [data, setData] = useState<MarketingInsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/marketing/insights", {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as MarketingInsightsPayload;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInsights();
  }, []);

  const reachData = useMemo(
    () =>
      data?.platformReach.map((platform) => ({
        name: platform.platform,
        audiencia: platform.audienceMillions,
        poblacion: platform.populationReachPercent,
        crecimiento: platform.annualGrowthPercent ?? 0,
        fill: platformColors[platform.platform],
      })) ?? [],
    [data],
  );

  const trendCurve = useMemo(
    () =>
      data?.platformReach.map((platform, index) => ({
        name: platform.platform,
        crecimiento: platform.annualGrowthPercent ?? 0,
        orden: index + 1,
      })) ?? [],
    [data],
  );

  return (
    <section className="relative overflow-hidden bg-[#071528] py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,190,198,0.24),transparent_34%),linear-gradient(135deg,rgba(102,45,145,0.55),rgba(0,143,212,0.22)_48%,rgba(237,0,140,0.18))]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/8 to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#20BEC6]">
              <BarChart3 className="h-4 w-4" />
              Marketing Intelligence
            </p>
            <h2 className="mt-5 font-heading text-3xl font-black leading-tight sm:text-5xl">
              Dashboard de marketing digital para Costa Rica y Latinoamerica
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              Datos publicos verificados para tomar decisiones de pauta, contenido, talento y transformacion digital en FWD.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-[#20BEC6]" /> : <CalendarDays className="h-5 w-5 text-[#20BEC6]" />}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Corte del dashboard</p>
                <p className="font-heading text-lg font-black">{data ? formatSourceDate(data.updatedAt) : "Cargando"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {loading && <LoadingState />}
          {!loading && error && <ErrorState onRetry={loadInsights} />}
          {!loading && !error && data && data.metrics.length === 0 && (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-8 text-center">
              <p className="font-heading text-xl font-black">No hay datos disponibles</p>
              <p className="mt-2 text-white/65">Cuando se publique una nueva fuente, el dashboard podra mostrarla aqui.</p>
            </div>
          )}
          {!loading && !error && data && data.metrics.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {data.metrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          )}
        </div>

        {!loading && !error && data && data.platformReach.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-2xl border border-white/15 bg-white p-5 text-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#662D91]">Alcance por plataforma</p>
                  <h3 className="font-heading text-2xl font-black">Audiencias publicitarias en Costa Rica</h3>
                </div>
                <p className="text-sm text-slate-500">Millones de personas o miembros reportados</p>
              </div>

              <div className="mt-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reachData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "audiencia" ? `${Number(value ?? 0).toFixed(2)} M` : `${value}%`,
                        name === "audiencia" ? "Audiencia" : "Alcance poblacion",
                      ]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="audiencia" radius={[8, 8, 0, 0]} fill="#008FD4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-4">
              {data.platformReach.map((platform) => (
                <PlatformRow key={platform.platform} item={platform} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && data && data.trends.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ED008C]/20 text-[#ED008C]">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/50">IA y empleo</p>
                  <h3 className="font-heading text-2xl font-black">Tendencias para proyectos FWD</h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {data.trends.map((trend) => (
                  <article key={trend.id} className="rounded-2xl border border-white/12 bg-white/10 p-4">
                    <p className="text-3xl font-black text-[#20BEC6]">{trend.value}</p>
                    <p className="mt-2 font-heading text-lg font-black">{trend.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">{trend.description}</p>
                    <a
                      href={trend.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#20BEC6] transition hover:text-white"
                    >
                      Fuente
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white p-5 text-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#662D91]/10 text-[#662D91]">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#662D91]">Crecimiento anual</p>
                  <h3 className="font-heading text-2xl font-black">Senales para priorizar canales</h3>
                </div>
              </div>

              <div className="mt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendCurve} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="marketingGrowth" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#662D91" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#20BEC6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Cambio anual"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="crecimiento"
                      stroke="#662D91"
                      strokeWidth={3}
                      fill="url(#marketingGrowth)"
                      dot={{ r: 5, fill: "#20BEC6", stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
