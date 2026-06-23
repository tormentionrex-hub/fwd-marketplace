import React from 'react';
import Card from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';
import type { MarketingTrend } from '@/types/marketing';

interface TrendCardProps {
  trend: MarketingTrend;
}

export default function TrendCard({ trend }: TrendCardProps) {
  const { title, value, description } = trend;
  return (
    <Card className="p-4 bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-[1.02] transition-transform">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-[#EC008C]" />
        <h4 className="text-sm font-medium text-white">{title}</h4>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      {description && <p className="text-xs text-white/70 mt-1">{description}</p>}
    </Card>
  );
}
