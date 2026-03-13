import { useEffect, useState, useMemo } from "react";
import { AlertCircle, Clock, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Alert {
  id: string;
  type: "overdue" | "anomaly" | "warning";
  title: string;
  description: string;
  severity: "info" | "warning" | "error";
  iconType: "clock" | "trending-down";
}

export function DashboardAlerts({ teamId }: { teamId?: number }) {
  // Queries
  const { data: overdueTasks } = trpc.reports.getOverdueTasks.useQuery({
    teamId,
  });
  const { data: anomalies } = trpc.reports.getFinancialAnomalies.useQuery();

  // Usar useMemo para calcular alertas sem criar novos objetos a cada render
  const alerts = useMemo(() => {
    const newAlerts: Alert[] = [];

    // Adicionar alertas de tarefas vencidas
    if (overdueTasks && overdueTasks.length > 0) {
      newAlerts.push({
        id: "overdue-tasks",
        type: "overdue",
        title: `${overdueTasks.length} Tarefa${overdueTasks.length > 1 ? "s" : ""} Vencida${overdueTasks.length > 1 ? "s" : ""}`,
        description: `Você tem ${overdueTasks.length} tarefa${overdueTasks.length > 1 ? "s" : ""} que passou da data de vencimento`,
        severity: "error",
        iconType: "clock",
      });
    }

    // Adicionar alertas de anomalias financeiras
    if (anomalies && anomalies.length > 0) {
      anomalies.forEach((anomaly, index) => {
        newAlerts.push({
          id: `anomaly-${index}`,
          type: "anomaly",
          title: anomaly.message,
          description: `Detectada uma anomalia no seu fluxo financeiro`,
          severity: anomaly.severity as "info" | "warning" | "error",
          iconType: "trending-down",
        });
      });
    }

    return newAlerts;
  }, [overdueTasks, anomalies]);

  if (alerts.length === 0) {
    return null;
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
      case "info":
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-500";
    }
  };

  const getAlertIcon = (iconType: string) => {
    switch (iconType) {
      case "clock":
        return <Clock className="h-4 w-4" />;
      case "trending-down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-base">Alertas Importantes</CardTitle>
        </div>
        <CardDescription>
          {alerts.length} alerta{alerts.length > 1 ? "s" : ""} requer{alerts.length > 1 ? "m" : ""} sua atenção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
          >
            <div className="mt-0.5">{getAlertIcon(alert.iconType)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs opacity-75 mt-1">{alert.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
