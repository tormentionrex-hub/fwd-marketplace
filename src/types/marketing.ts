export type MarketingMetricKind =
  | "penetration"
  | "audience"
  | "growth"
  | "employment"
  | "trend";

export interface MarketingSource {
  name: string;
  url: string;
  publishedAt: string;
  updatedAt: string;
}

export interface MarketingMetric {
  id: string;
  label: string;
  value: number;
  unit: "%" | "M" | "K" | "B";
  displayValue: string;
  context: string;
  kind: MarketingMetricKind;
  region: "Costa Rica" | "Latinoamerica" | "Global";
  source: MarketingSource;
}

export interface MarketingPlatformReach {
  platform: "YouTube" | "Facebook" | "Instagram" | "TikTok" | "LinkedIn";
  audienceMillions: number;
  audienceLabel: string;
  populationReachPercent: number;
  internetReachPercent?: number;
  adultReachPercent?: number;
  annualGrowthPercent?: number;
  note: string;
  source: MarketingSource;
}

export interface MarketingTrend {
  id: string;
  title: string;
  value: string;
  description: string;
  source: MarketingSource;
}

export interface MarketingInsightsPayload {
  updatedAt: string;
  summary: string;
  metrics: MarketingMetric[];
  platformReach: MarketingPlatformReach[];
  trends: MarketingTrend[];
}
