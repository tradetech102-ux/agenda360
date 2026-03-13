import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ComparisonData {
  current: number;
  previous: number;
  label: string;
}

interface PeriodComparisonProps {
  data: ComparisonData[];
  title: string;
  description?: string;
}

export function PeriodComparison({ data, title, description }: PeriodComparisonProps) {
  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getVariationColor = (variation: number) => {
    if (variation > 0) return "text-green-600";
    if (variation < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="h-4 w-4" />;
    if (variation < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => {
          const variation = calculateVariation(item.current, item.previous);
          const isPositive = variation >= 0;

          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Anterior: <span className="font-semibold">{item.previous}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-xs font-semibold text-foreground">
                    Atual: {item.current}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getVariationColor(variation)}`}>
                {getVariationIcon(variation)}
                <span className="text-sm font-bold">
                  {isPositive ? "+" : ""}{variation.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
