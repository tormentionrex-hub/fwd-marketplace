import type { MarketingInsightsPayload, MarketingSource } from "@/types/marketing";

const DATAREPORTAL_CR_2025: MarketingSource = {
  name: "DataReportal, Digital 2025: Costa Rica",
  url: "https://datareportal.com/reports/digital-2025-costa-rica",
  publishedAt: "2025-02-01",
  updatedAt: "2025-01-01",
};

const DATAREPORTAL_GLOBAL_2025: MarketingSource = {
  name: "DataReportal, Digital 2025 Global Overview Report",
  url: "https://datareportal.com/reports/digital-2025-global-overview-report",
  publishedAt: "2025-02-01",
  updatedAt: "2025-02-01",
};

const WORLD_BANK_ILO_AI_2024: MarketingSource = {
  name: "Banco Mundial y OIT, exposicion laboral a IA generativa en America Latina",
  url: "https://elpais.com/america/termometro-social/2025-01-23/la-ia-debe-amplificar-las-capacidades-educativas-no-sustituirlas-banco-mundial.html",
  publishedAt: "2025-01-23",
  updatedAt: "2024-12-31",
};

const CAF_DIGITAL_2026: MarketingSource = {
  name: "CAF, agenda de transformacion digital de America Latina y el Caribe",
  url: "https://elpais.com/america-futura/2026-05-07/la-agenda-urgente-de-transformacion-digital-de-america-latina-y-el-caribe.html",
  publishedAt: "2026-05-07",
  updatedAt: "2026-05-07",
};

export const MARKETING_INSIGHTS: MarketingInsightsPayload = {
  updatedAt: "2026-06-18",
  summary:
    "Indicadores seleccionados para planificar marketing digital, captacion de talento y proyectos FWD con datos publicos verificables.",
  metrics: [
    {
      id: "cr-internet-users",
      label: "Usuarios de Internet",
      value: 4.76,
      unit: "M",
      displayValue: "4.76 M",
      context: "92.6% de penetracion en Costa Rica al inicio de 2025.",
      kind: "penetration",
      region: "Costa Rica",
      source: DATAREPORTAL_CR_2025,
    },
    {
      id: "cr-social-users",
      label: "Identidades en redes sociales",
      value: 3.83,
      unit: "M",
      displayValue: "3.83 M",
      context: "74.5% de la poblacion de Costa Rica en enero de 2025.",
      kind: "audience",
      region: "Costa Rica",
      source: DATAREPORTAL_CR_2025,
    },
    {
      id: "cr-mobile-connections",
      label: "Conexiones moviles",
      value: 7.4,
      unit: "M",
      displayValue: "7.40 M",
      context: "Equivalen al 144% de la poblacion; muchas personas usan mas de una linea.",
      kind: "penetration",
      region: "Costa Rica",
      source: DATAREPORTAL_CR_2025,
    },
    {
      id: "global-social-users",
      label: "Identidades sociales globales",
      value: 5.24,
      unit: "B",
      displayValue: "5.24 B",
      context: "63.9% de la poblacion mundial; referencia para comparar madurez regional.",
      kind: "audience",
      region: "Global",
      source: DATAREPORTAL_GLOBAL_2025,
    },
  ],
  platformReach: [
    {
      platform: "YouTube",
      audienceMillions: 3.83,
      audienceLabel: "3.83 M",
      populationReachPercent: 74.5,
      internetReachPercent: 80.5,
      annualGrowthPercent: -0.8,
      note: "Alcance publicitario estimado por recursos de Google.",
      source: DATAREPORTAL_CR_2025,
    },
    {
      platform: "Facebook",
      audienceMillions: 3.45,
      audienceLabel: "3.45 M",
      populationReachPercent: 67.1,
      internetReachPercent: 72.5,
      annualGrowthPercent: 3.0,
      note: "Alcance potencial de anuncios reportado por herramientas de Meta.",
      source: DATAREPORTAL_CR_2025,
    },
    {
      platform: "Instagram",
      audienceMillions: 2.5,
      audienceLabel: "2.50 M",
      populationReachPercent: 48.6,
      internetReachPercent: 52.5,
      annualGrowthPercent: 4.2,
      note: "Alcance potencial de anuncios reportado por herramientas de Meta.",
      source: DATAREPORTAL_CR_2025,
    },
    {
      platform: "TikTok",
      audienceMillions: 3.43,
      audienceLabel: "3.43 M",
      populationReachPercent: 72.1,
      internetReachPercent: 72.1,
      adultReachPercent: 86.2,
      annualGrowthPercent: 10.0,
      note: "Audiencia publicitaria de 18 anos o mas; TikTok no publica el total 13+ en esta fuente.",
      source: DATAREPORTAL_CR_2025,
    },
    {
      platform: "LinkedIn",
      audienceMillions: 2.0,
      audienceLabel: "2.00 M",
      populationReachPercent: 38.9,
      internetReachPercent: 42.0,
      adultReachPercent: 50.2,
      annualGrowthPercent: 17.6,
      note: "LinkedIn reporta miembros registrados, no usuarios activos mensuales.",
      source: DATAREPORTAL_CR_2025,
    },
  ],
  trends: [
    {
      id: "ai-mainstream",
      title: "IA como canal de productividad",
      value: "310 M",
      description:
        "Visitantes unicos mensuales promedio de ChatGPT.com entre septiembre y noviembre de 2024 segun Similarweb.",
      source: DATAREPORTAL_GLOBAL_2025,
    },
    {
      id: "ai-job-exposure",
      title: "Empleos expuestos a IA en America Latina",
      value: "26%-38%",
      description:
        "Rango de empleos expuestos a IA generativa; 8%-14% podria aumentar productividad con adopcion adecuada.",
      source: WORLD_BANK_ILO_AI_2024,
    },
    {
      id: "automation-threshold",
      title: "Riesgo de automatizacion total",
      value: "2%-5%",
      description:
        "Rango regional de empleos en umbral de automatizacion total segun el estudio Banco Mundial-OIT.",
      source: WORLD_BANK_ILO_AI_2024,
    },
    {
      id: "regional-informality",
      title: "Reto de empleabilidad regional",
      value: "55%",
      description:
        "Informalidad laboral estimada en America Latina y el Caribe; clave para disenar capacitacion digital inclusiva.",
      source: CAF_DIGITAL_2026,
    },
  ],
};
