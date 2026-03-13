import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { Loader2, Users, Package, ShoppingCart, TrendingUp, DollarSign, AlertCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getLoginUrl } from "@/const";

const COLORS = {
  bgPrimary: "#0b0b0b",
  bgCard: "#141414",
  border: "#262626",
  hover: "#1f1f1f",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  
  // Métrica cards
  tasksBg: "#1f2937",
  completedBg: "#052e1f",
  inProgressBg: "#1e3a8a",
  pendingBg: "#3b1d12",
  
  // Gráficos
  chartGreen: "#22c55e",
  chartBlue: "#3b82f6",
  chartOrange: "#f59e0b",
  
  // Financeiro
  incomeBg: "#052e1f",
  incomeText: "#22c55e",
  expenseBg: "#3f1d1d",
  expenseText: "#ef4444",
  balanceBg: "#2e1065",
  balanceText: "#a855f7",
};

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: COLORS.bgPrimary,
        color: COLORS.textPrimary,
        padding: "16px",
      }}>
        <div style={{ maxWidth: "448px", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>Agenda 360°</h1>
          <p style={{ fontSize: "18px", color: COLORS.textSecondary, marginBottom: "32px" }}>
            Plataforma completa de gestão empresarial. Gerencie clientes, produtos, vendas e financeiro em um único lugar.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" style={{ width: "100%" }}>
              Fazer Login com Manus
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "30px", fontWeight: "bold", margin: 0, color: COLORS.textPrimary }}>
          Bem-vindo, {user?.name}!
        </h1>
        <p style={{ color: COLORS.textSecondary, marginTop: "8px", margin: 0 }}>
          Dashboard de gestão empresarial
        </p>
      </div>

      {/* Metrics Cards */}
      {metricsLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : metrics ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}>
          {/* Total de Tarefas */}
          <div style={{
            backgroundColor: COLORS.tasksBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: COLORS.textSecondary, margin: 0 }}>Total de Tarefas</p>
              </div>
              <AlertTriangle size={16} color={COLORS.textSecondary} />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: COLORS.textPrimary, marginBottom: "4px" }}>
              {metrics.totalTasks || 0}
            </div>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, margin: 0 }}>Tarefas criadas</p>
          </div>

          {/* Concluídas */}
          <div style={{
            backgroundColor: COLORS.completedBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: COLORS.textSecondary, margin: 0 }}>Concluídas</p>
              </div>
              <CheckCircle2 size={16} color="#22c55e" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#22c55e", marginBottom: "4px" }}>
              {metrics.completedTasks || 0}
            </div>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, margin: 0 }}>0% de conclusão</p>
          </div>

          {/* Em Andamento */}
          <div style={{
            backgroundColor: COLORS.inProgressBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: COLORS.textSecondary, margin: 0 }}>Em Andamento</p>
              </div>
              <Clock size={16} color="#3b82f6" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#3b82f6", marginBottom: "4px" }}>
              {metrics.inProgressTasks || 0}
            </div>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, margin: 0 }}>Tarefas ativas</p>
          </div>

          {/* Pendentes */}
          <div style={{
            backgroundColor: COLORS.pendingBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: COLORS.textSecondary, margin: 0 }}>Pendentes</p>
              </div>
              <AlertCircle size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b", marginBottom: "4px" }}>
              {metrics.pendingTasks || 0}
            </div>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, margin: 0 }}>Aguardando início</p>
          </div>
        </div>
      ) : null}

      {/* Charts Section */}
      {metrics && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "16px",
        }}>
          {/* Tarefas Concluídas por Semana */}
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: COLORS.textPrimary, marginTop: 0, marginBottom: "16px" }}>
              Tarefas Concluídas por Semana
            </h3>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, marginBottom: "16px", margin: 0 }}>
              Últimas 8 semanas
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[
                { week: "Sem 1", completed: 0 },
                { week: "Sem 2", completed: 0 },
                { week: "Sem 3", completed: 0 },
                { week: "Sem 4", completed: 0 },
                { week: "Sem 5", completed: 0 },
                { week: "Sem 6", completed: 0 },
                { week: "Sem 7", completed: 0 },
                { week: "Sem 8", completed: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="week" stroke={COLORS.textSecondary} style={{ fontSize: "12px" }} />
                <YAxis stroke={COLORS.textSecondary} style={{ fontSize: "12px" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: COLORS.bgPrimary, border: `1px solid ${COLORS.border}`, borderRadius: "4px" }}
                  labelStyle={{ color: COLORS.textPrimary }}
                />
                <Line type="monotone" dataKey="completed" stroke={COLORS.chartGreen} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição de Status */}
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: COLORS.textPrimary, marginTop: 0, marginBottom: "16px" }}>
              Distribuição de Status
            </h3>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, marginBottom: "16px", margin: 0 }}>
              Estado atual das tarefas
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Concluídas", value: metrics.completedTasks || 0 },
                    { name: "Em Andamento", value: metrics.inProgressTasks || 0 },
                    { name: "Pendentes", value: metrics.pendingTasks || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill={COLORS.chartGreen} />
                  <Cell fill={COLORS.chartBlue} />
                  <Cell fill={COLORS.chartOrange} />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: COLORS.bgPrimary, border: `1px solid ${COLORS.border}`, borderRadius: "4px" }}
                  labelStyle={{ color: COLORS.textPrimary }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {metrics && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: COLORS.textPrimary, marginTop: 0, marginBottom: "16px" }}>
              Resumo Financeiro
            </h3>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, marginBottom: "16px", margin: 0 }}>
              Entradas, saídas e saldo
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Receitas */}
              <div style={{
                backgroundColor: COLORS.incomeBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: COLORS.textSecondary }}>Receitas</span>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: COLORS.incomeText }}>
                  R$ {(metrics.totalIncome || 0).toFixed(2)}
                </span>
              </div>

              {/* Despesas */}
              <div style={{
                backgroundColor: COLORS.expenseBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: COLORS.textSecondary }}>Despesas</span>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: COLORS.expenseText }}>
                  R$ {(metrics.totalExpenses || 0).toFixed(2)}
                </span>
              </div>

              {/* Saldo Líquido */}
              <div style={{
                backgroundColor: COLORS.balanceBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "6px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: COLORS.textSecondary }}>Saldo Líquido</span>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: COLORS.balanceText }}>
                  R$ {(metrics.netProfit || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Distribuição de Receitas */}
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: COLORS.textPrimary, marginTop: 0, marginBottom: "16px" }}>
              Distribuição de Receitas
            </h3>
            <p style={{ fontSize: "12px", color: COLORS.textSecondary, marginBottom: "16px", margin: 0 }}>
              Vendas vs Outras Receitas
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Vendas", value: metrics.totalRevenue || 0 },
                    { name: "Outras Receitas", value: Math.max((metrics.totalIncome || 0) - (metrics.totalRevenue || 0), 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                >
                  <Cell fill={COLORS.chartBlue} />
                  <Cell fill={COLORS.chartGreen} />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: COLORS.bgPrimary, border: `1px solid ${COLORS.border}`, borderRadius: "4px" }}
                  labelStyle={{ color: COLORS.textPrimary }}
                  formatter={(value) => `R$ ${(value as number).toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
