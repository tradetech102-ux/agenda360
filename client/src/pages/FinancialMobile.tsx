import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Plus, CreditCard, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";

// Cores exatas do design
const COLORS = {
  bg: "#1A1A1A",
  bgCard: "#252525",
  border: "#333333",
  textPrimary: "#E5E7EB",
  textSecondary: "#9CA3AF",
  blue: "#3B82F6",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#F59E0B",
};

export default function FinancialMobile({ onClose }: { onClose: () => void }) {
  const [transactionType, setTransactionType] = useState<"income" | "expense" | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const utils = trpc.useUtils();
  const { data: totalBalance = 0 } = trpc.financial.totalBalance.useQuery();
  const { data: bankAccounts = [] } = trpc.financial.bankAccounts.list.useQuery();
  const { data: transactions = [] } = trpc.financial.transactions.list.useQuery();
  const { data: rawChartData = [] } = trpc.financial.getCashFlowData.useQuery();
  
  const chartData = rawChartData.map((item: any) => ({
    ...item,
    entradas: typeof item.entradas === "number" ? item.entradas : 0,
    saidas: typeof item.saidas === "number" ? item.saidas : 0,
    tendencia: typeof item.tendencia === "number" ? item.tendencia : 0,
  }));
  
  const maxValue = Math.max(
    ...chartData.map((d: any) => Math.max(d.entradas || 0, d.saidas || 0, d.tendencia || 0)),
    1
  );
  const yAxisMax = maxValue <= 10 ? maxValue + 2 : Math.ceil(maxValue * 1.2);

  // Calcular entradas e saídas do mês
  const monthTransactions = transactions.filter((t: any) => {
    const transDate = new Date(t.transactionDate);
    const now = new Date();
    return transDate.getMonth() === now.getMonth() && transDate.getFullYear() === now.getFullYear();
  });

  const entradas = monthTransactions
    .filter((t: any) => t.transactionType === "income")
    .reduce((sum: number, t: any) => sum + (typeof t.amount === "number" ? t.amount : parseFloat(t.amount)), 0);

  const saidas = monthTransactions
    .filter((t: any) => t.transactionType === "expense")
    .reduce((sum: number, t: any) => sum + (typeof t.amount === "number" ? t.amount : parseFloat(t.amount)), 0);

  const saldoMes = entradas - saidas;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: COLORS.bg,
      overflow: "hidden",
    }}>
      {/* HEADER COMPACTO */}
      <div style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.bgCard,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <h1 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "700", margin: 0 }}>
          Financeiro
        </h1>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: COLORS.textSecondary,
            cursor: "pointer",
            fontSize: "20px",
            padding: "4px 8px",
          }}
        >
          ✕
        </button>
      </div>

      {/* CONTEÚDO SCROLLÁVEL - OTIMIZADO */}
      <div style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "12px",
        paddingBottom: "80px", // Espaço para botões fixos
      }}>
        
        {/* SALDO PRINCIPAL - DESTAQUE */}
        <div style={{
          backgroundColor: COLORS.green,
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          color: "white",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "12px", fontWeight: "500", opacity: 0.9 }}>Saldo Atual</span>
          <div style={{ fontSize: "28px", fontWeight: "700" }}>
            R$ {typeof totalBalance === "number" ? totalBalance.toFixed(2) : "0.00"}
          </div>
          <span style={{ fontSize: "12px", opacity: 0.8 }}>
            + R$ {saldoMes.toFixed(2)} no mês
          </span>
        </div>

        {/* CARDS RESUMO - SCROLL HORIZONTAL COMPACTO */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", flexShrink: 0, paddingBottom: "4px" }}>
          {/* Entradas */}
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `2px solid ${COLORS.green}`,
            borderRadius: "10px",
            padding: "14px",
            minWidth: "140px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flexShrink: 0,
            justifyContent: "center",
          }}>
            <span style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "500" }}>Entradas</span>
            <div style={{ color: COLORS.green, fontSize: "20px", fontWeight: "700" }}>
              R$ {entradas.toFixed(2)}
            </div>
          </div>

          {/* Saídas */}
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `2px solid ${COLORS.red}`,
            borderRadius: "10px",
            padding: "14px",
            minWidth: "140px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flexShrink: 0,
            justifyContent: "center",
          }}>
            <span style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "500" }}>Saídas</span>
            <div style={{ color: COLORS.red, fontSize: "20px", fontWeight: "700" }}>
              R$ {saidas.toFixed(2)}
            </div>
          </div>

          {/* Saldo do Mês */}
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `2px solid ${COLORS.yellow}`,
            borderRadius: "10px",
            padding: "14px",
            minWidth: "140px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flexShrink: 0,
            justifyContent: "center",
          }}>
            <span style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "500" }}>Saldo</span>
            <div style={{ color: COLORS.yellow, fontSize: "20px", fontWeight: "700" }}>
              R$ {saldoMes.toFixed(2)}
            </div>
          </div>
        </div>

        {/* GRÁFICO - ALTURA REDUZIDA */}
        <div style={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "10px",
          padding: "10px",
          flexShrink: 0,
        }}>
          <h3 style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", margin: "0 0 8px 0" }}>
            Fluxo de Caixa
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="mes" stroke={COLORS.textSecondary} style={{ fontSize: "10px" }} />
              <YAxis stroke={COLORS.textSecondary} style={{ fontSize: "10px" }} domain={[0, yAxisMax]} />
              <Tooltip contentStyle={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}` }} />
              <Line type="monotone" dataKey="tendencia" stroke={COLORS.blue} strokeWidth={2} dot={false} />
              <Bar dataKey="entradas" fill={COLORS.green} />
              <Bar dataKey="saidas" fill={COLORS.red} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* CONTAS BANCÁRIAS - MÁXIMO 2 VISÍVEIS */}
        <div style={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "10px",
          padding: "10px",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <h3 style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", margin: 0 }}>
              Contas
            </h3>
            <button style={{
              background: "none",
              border: "none",
              color: COLORS.blue,
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "600",
              padding: "2px 6px",
            }}>
              + Cadastrar
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {bankAccounts.slice(0, 2).map((account: any, idx: number) => (
              <div key={idx} style={{
                backgroundColor: COLORS.bg,
                border: `2px solid ${
                  account.accountType === "cash" ? COLORS.green :
                  account.accountType === "checking" ? COLORS.blue :
                  account.accountType === "savings" ? "#A78BFA" :
                  COLORS.yellow
                }`,
                borderRadius: "8px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ color: COLORS.textPrimary, fontSize: "12px", fontWeight: "600" }}>
                    {account.accountName || account.bankName}
                  </div>
                  <div style={{ color: COLORS.textSecondary, fontSize: "10px", marginTop: "2px" }}>
                    {account.accountNumber || "Dinheiro"}
                  </div>
                </div>
                <div style={{ color: COLORS.textPrimary, fontSize: "12px", fontWeight: "700" }}>
                  R$ {(typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0).toFixed(2)}
                </div>
              </div>
            ))}
            {bankAccounts.length > 2 && (
              <button style={{
                background: "none",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.blue,
                cursor: "pointer",
                padding: "8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
              }}>
                Ver todas as contas
              </button>
            )}
          </div>
        </div>

        {/* ÚLTIMOS LANÇAMENTOS - APENAS 3 ITENS */}
        <div style={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "10px",
          padding: "10px",
          flexShrink: 0,
        }}>
          <h3 style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", margin: "0 0 8px 0" }}>
            Últimos Lançamentos
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {transactions.slice(0, 3).map((transaction: any, idx: number) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                backgroundColor: COLORS.bg,
                borderRadius: "6px",
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "4px",
                    backgroundColor: transaction.transactionType === "income" ? COLORS.green : COLORS.red,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {transaction.transactionType === "income" ? (
                      <ArrowUpRight size={14} style={{ color: "white" }} />
                    ) : (
                      <ArrowDownLeft size={14} style={{ color: "white" }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: COLORS.textPrimary, fontSize: "12px", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {transaction.description}
                    </div>
                    <div style={{ color: COLORS.textSecondary, fontSize: "10px", marginTop: "1px" }}>
                      {new Date(transaction.transactionDate).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div style={{
                  color: transaction.transactionType === "income" ? COLORS.green : COLORS.red,
                  fontSize: "12px",
                  fontWeight: "700",
                  flexShrink: 0,
                  marginLeft: "8px",
                }}>
                  {transaction.transactionType === "income" ? "+" : "-"} R$ {Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
            {transactions.length > 3 && (
              <button style={{
                background: "none",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.blue,
                cursor: "pointer",
                padding: "8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
                marginTop: "4px",
              }}>
                Ver todos os lançamentos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BOTÕES FIXOS NO RODAPÉ */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.bg,
        borderTop: `1px solid ${COLORS.border}`,
        padding: "10px",
        display: "flex",
        gap: "10px",
        zIndex: 40,
      }}>
        <button style={{
          flex: 1,
          padding: "12px",
          backgroundColor: COLORS.green,
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}>
          <Plus size={16} /> Entrada
        </button>
        <button style={{
          flex: 1,
          padding: "12px",
          backgroundColor: COLORS.red,
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}>
          <Plus size={16} /> Saída
        </button>
      </div>
    </div>
  );
}
