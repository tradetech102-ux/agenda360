import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnimatedChartProps {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
}

export function AnimatedChart({ title, description, children, loading }: AnimatedChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="space-y-4 w-full">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse" />
              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" />
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
