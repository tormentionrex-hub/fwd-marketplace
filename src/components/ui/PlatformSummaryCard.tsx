import React from 'react';
import Card from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface PlatformSummaryProps {
  item: {
    platform: string;
    audienceMillions?: number;
    annualGrowthPercent?: number;
    populationReachPercent?: number;
  };
}

export default function PlatformSummaryCard({ item }: PlatformSummaryProps) {
  const { platform, audienceMillions, annualGrowthPercent, populationReachPercent } = item;
  return (
    <Card className="p-4 bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-[1.02] transition-transform">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="h-5 w-5 text-[#00AEEF]" />
        <h3 className="text-sm font-medium text-white">{platform}</h3>
      </div>
      {audienceMillions !== undefined && (
        <p className="text-xs text-white/70">Audiencia: {audienceMillions} M</p>
      )}
      {annualGrowthPercent !== undefined && (
        <p className="text-xs text-white/70">Crecimiento: +{annualGrowthPercent}%</p>
      )}
      {populationReachPercent !== undefined && (
        <p className="text-xs text-white/70">Penetración: {populationReachPercent}%</p>
      )}
    </Card>
  );
}
