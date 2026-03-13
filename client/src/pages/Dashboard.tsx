import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { DashboardAlerts } from "@/components/DashboardAlerts";
import { ExportReportButton } from "@/components/ExportReportButton";

type PeriodType = "week" | "month" | "quarter" | "year";

export default function Dashboard() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [period, setPeriod] = useState<PeriodType>("month");
  
  // Queries
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: tasksStats } = trpc.dashboard.tasksStatistics.useQuery(
    { teamId: selectedTeamId || undefined },
    { enabled: true }
  );
  const { data: tasksCompletedByWeek } = trpc.dashboard.tasksCompletedByWeek.useQuery(
    { teamId: selectedTeamId || undefined },
    { enabled: true }
  );
  const { data: memberProductivity } = trpc.dashboard.memberProductivity.useQuery(
    { teamId: selectedTeamId || 0 },
    { enabled: selectedTeamId !== null }
  );
  const { data: financialSummary } = trpc.dashboard.financialSummary.useQuery();

  // Set first team as default
  useEffect(() => {
    if (teams && teams.length > 0 && selectedTeamId === null) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const completionPercentage = tasksStats
    ? Math.round((tasksStats.completed / tasksStats.total) * 100) || 0
    : 0;

  const chartColors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard de Relatórios</h1>
        <p className="text-muted-foreground mt-2">Acompanhe a produtividade do seu time e métricas financeiras</p>
      </div>

      {/* Team Selector and Export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
        {teams?.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelectedTeamId(team.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTeamId === team.id
                ? "bg-purple-600 text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {team.name}
          </button>
        ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["week", "month", "quarter", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {p === "week" ? "Semana" : p === "month" ? "Mês" : p === "quarter" ? "Trimestre" : "Ano"}
            </button>
          ))}
        </div>
        <ExportReportButton teamId={selectedTeamId || undefined} />
      </div>

      {/* Alerts */}
      <DashboardAlerts teamId={selectedTeamId || undefined} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Tarefas criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{tasksStats?.completed || 0}</div>
            <p className="text-xs text-muted-foreground">{completionPercentage}% de conclusão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{tasksStats?.inProgress || 0}</div>
            <p className="text-xs text-muted-foreground">Tarefas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{tasksStats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando início</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Completed by Week */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Concluídas por Semana</CardTitle>
            <CardDescription>Últimas 8 semanas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasksCompletedByWeek || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Concluídas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
            <CardDescription>Estado atual das tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Concluídas", value: tasksStats?.completed || 0 },
                    { name: "Em Andamento", value: tasksStats?.inProgress || 0 },
                    { name: "Pendentes", value: tasksStats?.pending || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Produtividade por Membro</CardTitle>
            <CardDescription>Tarefas por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberProductivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="userId" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Concluídas" />
                <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="Em Andamento" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pendentes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Entradas, saídas e saldo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  <p className="text-2xl font-bold text-green-500">
                    R$ {(financialSummary?.income || 0).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="text-2xl font-bold text-red-500">
                    R$ {(financialSummary?.expense || 0).toFixed(2)}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${
                    (financialSummary?.balance || 0) >= 0 ? "text-purple-500" : "text-red-500"
                  }`}>
                    R$ {(financialSummary?.balance || 0).toFixed(2)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
