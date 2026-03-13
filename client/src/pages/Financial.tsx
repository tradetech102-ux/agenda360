import { useState } from "react";
import { trpc } from "../lib/trpc";
import { useWindowSize } from "../hooks/useWindowSize";
import FinancialMobile from "./FinancialMobile";
import { Plus, X, CreditCard, Wallet, DollarSign, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, TrendingUp, Bell, MessageSquare } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { CategoryCombobox } from "../components/CategoryCombobox";

// Cores exatas do design
const COLORS = {
  bg: "#1A1A1A",
  bgCard: "#252525",
  border: "#333333",
  textPrimary: "#E5E7EB",
  textSecondary: "#9CA3AF",
  blue: "#3B82F6", // Azul apenas para elementos de ação
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#F59E0B",
  purple: "#A78BFA",
  blueSecondary: "#3B82F6",
  hover: "#2A2A2A", // Hover color
};

// Dados simulados para o gráfico
// Dados de fluxo de caixa serão carregados do backend

export default function Financial({ onClose }: { onClose: () => void }) {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankFormData, setBankFormData] = useState({ bankName: "", accountName: "", accountNumber: "", accountType: "checking", balance: "" });
  const [transactionType, setTransactionType] = useState<"income" | "expense" | null>(null);
  const [transactionForm, setTransactionForm] = useState({ amount: "", accountId: "", categoryId: null as number | null, description: "", isRecurring: false, recurringName: "" });
  const createBankAccount = trpc.financial.bankAccounts.create.useMutation();
  const [filterPeriod, setFilterPeriod] = useState<"today" | "week" | "month" | "custom">("month");

  const utils = trpc.useUtils();
  const { data: totalBalance = 0 } = trpc.financial.totalBalance.useQuery();
  const { data: bankAccounts = [] } = trpc.financial.bankAccounts.list.useQuery();
  const { data: transactions = [] } = trpc.financial.transactions.list.useQuery();
  const { data: rawChartData = [] } = trpc.financial.getCashFlowData.useQuery();
  
  // Normalizar dados: converter null/undefined para 0 e calcular escala dinâmica
  const chartData = rawChartData.map((item: any) => ({
    ...item,
    entradas: typeof item.entradas === "number" ? item.entradas : 0,
    saidas: typeof item.saidas === "number" ? item.saidas : 0,
    tendencia: typeof item.tendencia === "number" ? item.tendencia : 0,
  }));
  
  // Calcular escala real baseada nos dados
  const maxValue = Math.max(
    ...chartData.map((d: any) => Math.max(d.entradas || 0, d.saidas || 0, d.tendencia || 0)),
    1 // Mínimo de 1 para evitar divisão por zero
  );
  // Escala inteligente: se valor for pequeno, expande; se grande, aplica margem de 20%
  const yAxisMax = maxValue <= 10 ? maxValue + 2 : Math.ceil(maxValue * 1.2);
  const createTransaction = trpc.financial.transactions.create.useMutation();

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

  // Se for mobile, renderizar versão mobile
  if (isMobile) {
    return <FinancialMobile onClose={onClose} />;
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 30,
          backdropFilter: "blur(5px)",
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            width: "95%",
            maxWidth: "1400px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              padding: "20px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: COLORS.bgCard,
            }}
          >
            <h1 style={{ color: COLORS.textPrimary, fontSize: "24px", fontWeight: "700", margin: 0 }}>
              Financeiro
            </h1>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.border;
                  (e.currentTarget as HTMLElement).style.color = COLORS.textPrimary;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = COLORS.textSecondary;
                }}
              >
                <Bell size={20} />
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.border;
                  (e.currentTarget as HTMLElement).style.color = COLORS.textPrimary;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = COLORS.textSecondary;
                }}
              >
                <MessageSquare size={20} />
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.border;
                  (e.currentTarget as HTMLElement).style.color = COLORS.textPrimary;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = COLORS.textSecondary;
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div style={{ flex: 1, padding: "24px 32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* CARDS DE RESUMO - FIXOS NO TOPO */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", flexShrink: 0 }}>
                {/* Card Saldo Atual */}
                <div
                  style={{
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                    minHeight: "140px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: COLORS.green }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: COLORS.textSecondary, fontSize: "13px", fontWeight: "500" }}>Saldo Atual</span>
                    <DollarSign size={18} style={{ color: COLORS.green }} />
                  </div>
                  <div style={{ color: COLORS.textPrimary, fontSize: "28px", fontWeight: "700" }}>
                    R$ {typeof totalBalance === "number" ? totalBalance.toFixed(2) : "0.00"}
                  </div>
                </div>

                {/* Card Entradas */}
                <div
                  style={{
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                    minHeight: "140px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: COLORS.green }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: COLORS.textSecondary, fontSize: "13px", fontWeight: "500" }}>Entradas no Mês</span>
                    <ArrowUpRight size={18} style={{ color: COLORS.green }} />
                  </div>
                  <div style={{ color: COLORS.green, fontSize: "28px", fontWeight: "700" }}>
                    R$ {entradas.toFixed(2)}
                  </div>
                </div>

                {/* Card Saídas */}
                <div
                  style={{
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                    minHeight: "140px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: COLORS.red }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: COLORS.textSecondary, fontSize: "13px", fontWeight: "500" }}>Saídas no Mês</span>
                    <ArrowDownLeft size={18} style={{ color: COLORS.red }} />
                  </div>
                  <div style={{ color: COLORS.red, fontSize: "28px", fontWeight: "700" }}>
                    R$ {saidas.toFixed(2)}
                  </div>
                </div>

                {/* Card Saldo do Mês */}
                <div
                  style={{
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                    minHeight: "140px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: COLORS.yellow }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: COLORS.textSecondary, fontSize: "13px", fontWeight: "500" }}>Saldo do Mês</span>
                    <TrendingUp size={18} style={{ color: COLORS.yellow }} />
                  </div>
                  <div style={{ color: saldoMes >= 0 ? COLORS.green : COLORS.red, fontSize: "28px", fontWeight: "700" }}>
                    R$ {saldoMes.toFixed(2)}
                  </div>
                </div>
            </div>

            {/* LAYOUT 2 COLUNAS */}


            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", flex: 1, minHeight: 0 }}>


              {/* COLUNA ESQUERDA */}


              <div style={{ display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
              {/* GRÁFICO */}
              <div
                style={{
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h3 style={{ color: COLORS.textPrimary, fontSize: "16px", fontWeight: "600", marginBottom: "16px", margin: 0 }}>
                  Fluxo de Caixa
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="mes" stroke={COLORS.textSecondary} />
                    <YAxis
                      type="number"
                      stroke={COLORS.textSecondary}
                      domain={[0, yAxisMax]}
                      allowDataOverflow={true}
                      tickCount={6}
                      padding={{ top: 10, bottom: 0 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.bgCard,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "8px",
                        color: COLORS.textPrimary,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="entradas" fill={COLORS.green} name="Entradas" isAnimationActive={false} />
                    <Bar dataKey="saidas" fill={COLORS.red} name="Saídas" isAnimationActive={false} />
                    <Line type="monotone" dataKey="tendencia" stroke={COLORS.blue} name="Tendência" strokeWidth={2} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* LISTA DE TRANSAÇÕES */}
              <div
                style={{
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ color: COLORS.textPrimary, fontSize: "16px", fontWeight: "600", margin: 0 }}>
                    Últimos Lançamentos
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["Hoje", "Esta Semana", "Este Mês", "Personalizado"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setFilterPeriod(period.toLowerCase().replace(" ", "") as any)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: `1px solid ${filterPeriod === period.toLowerCase().replace(" ", "") ? COLORS.blue : COLORS.border}`,
                          backgroundColor: filterPeriod === period.toLowerCase().replace(" ", "") ? COLORS.blue : "transparent",
                          color: filterPeriod === period.toLowerCase().replace(" ", "") ? "white" : COLORS.textSecondary,
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "500",
                          transition: "all 0.2s",
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {transactions.slice(0, 5).map((transaction: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        backgroundColor: COLORS.bg,
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: transaction.transactionType === "income" ? COLORS.green : COLORS.red,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {transaction.transactionType === "income" ? (
                            <ArrowUpRight size={20} style={{ color: "white" }} />
                          ) : (
                            <ArrowDownLeft size={20} style={{ color: "white" }} />
                          )}
                        </div>
                        <div>
                          <div style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "500" }}>
                            {transaction.description}
                          </div>
                          <div style={{ color: COLORS.textSecondary, fontSize: "12px" }}>
                            {transaction.category && (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  backgroundColor: COLORS.border,
                                  marginRight: "8px",
                                }}
                              >
                                {transaction.category}
                              </span>
                            )}
                            {new Date(transaction.transactionDate).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          color: transaction.transactionType === "income" ? COLORS.green : COLORS.red,
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        {transaction.transactionType === "income" ? "+" : "-"} R$ {(typeof transaction.amount === "number" ? transaction.amount : parseFloat(transaction.amount)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* COLUNA DIREITA - SIDEBAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", minHeight: 0 }}>
              {/* CONTAS BANCÁRIAS */}
              <div
                style={{
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "600", margin: 0 }}>
                    Contas Bancárias
                  </h3>
                  <button
                    onClick={() => setShowBankModal(true)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.blue}`,
                      backgroundColor: "transparent",
                      color: COLORS.blue,
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.blue;
                      (e.currentTarget as HTMLElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.color = COLORS.blue;
                    }}
                  >
                    <Plus size={14} />
                    Cadastrar
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {bankAccounts.slice(0, 3).map((account: any, idx: number) => {
                    const colors = [COLORS.blue, COLORS.green, COLORS.purple];
                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: COLORS.bg,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: "8px",
                          padding: "12px",
                          borderLeft: `4px solid ${colors[idx % colors.length]}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <CreditCard size={16} style={{ color: colors[idx % colors.length] }} />
                          <span style={{ color: COLORS.textSecondary, fontSize: "12px" }}>
                            {account.bankName}
                          </span>
                        </div>
                        <div style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "600" }}>
                          {account.accountName}
                        </div>
                        <div style={{ color: colors[idx % colors.length], fontSize: "16px", fontWeight: "700", marginTop: "8px" }}>
                          R$ {(typeof account.balance === "number" ? account.balance : parseFloat(account.balance)).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    setTransactionType("income");
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: COLORS.green,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "0.9";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <Plus size={18} />
                  Nova Entrada
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    setTransactionType("expense");
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: COLORS.red,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "0.9";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <Plus size={18} />
                  Nova Saída
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* MODAL DE CADASTRO DE CONTA BANCÁRIA */}
      {showBankModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowBankModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "700", margin: 0 }}>
                Cadastrar Conta Bancária
              </h2>
              <button
                onClick={() => setShowBankModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {bankFormData.accountType !== "cash" && (
                <div>
                  <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Nome do Banco
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Itaú, Bradesco, Banco do Brasil"
                    value={bankFormData.bankName}
                    onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg,
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Nome da Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Conta Corrente, Poupança"
                  value={bankFormData.accountName}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.bg,
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {bankFormData.accountType !== "cash" && (
                <div>
                  <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Número da Conta
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 123456-7"
                    value={bankFormData.accountNumber}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg,
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Tipo de Conta
                </label>
                <select
                  value={bankFormData.accountType}
                  onChange={(e) => setBankFormData({ ...bankFormData, accountType: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.bg,
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="investment">Investimento</option>
                  <option value="cash">Dinheiro Físico</option>
                </select>
              </div>

              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Saldo Inicial
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={bankFormData.balance}
                  onChange={(e) => setBankFormData({ ...bankFormData, balance: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.bg,
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  onClick={() => setShowBankModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: "transparent",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.border;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (bankFormData.accountType !== "cash" && (!bankFormData.bankName || !bankFormData.accountNumber)) {
                      alert("Preencha todos os campos obrigatórios");
                      return;
                    }
                    if (!bankFormData.accountName) {
                      alert("Preencha o nome da conta");
                      return;
                    }
                    createBankAccount.mutate({
                      bankName: bankFormData.accountType === "cash" ? undefined : bankFormData.bankName,
                      accountName: bankFormData.accountName,
                      accountNumber: bankFormData.accountType === "cash" ? undefined : bankFormData.accountNumber,
                      accountType: bankFormData.accountType as "checking" | "savings" | "investment" | "cash",
                      balance: bankFormData.balance || "0",
                    }, {
                      onSuccess: () => {
                        setShowBankModal(false);
                        setBankFormData({ bankName: "", accountName: "", accountNumber: "", accountType: "checking", balance: "" });
                        // Invalidar queries para atualizar dados em tempo real
                        utils.financial.bankAccounts.list.invalidate();
                        utils.financial.totalBalance.invalidate();
                        // Invalidar Reports se necessario
                        utils.financial.transactions.list.invalidate();
                      },
                      onError: (error) => {
                        alert("Erro ao criar conta: " + (error as any).message);
                      },
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: COLORS.blue,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = "1";
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADIÇÃO DE TRANSAÇÃO */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            overflowY: "auto",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "450px",
              width: "90%",
              margin: "20px auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "700", margin: 0 }}>
                {transactionType === null ? "Tipo de Transação" : transactionType === "income" ? "Nova Entrada" : "Nova Saída"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setTransactionType(null);
                  setTransactionForm({ amount: "", accountId: "", categoryId: null, description: "", isRecurring: false, recurringName: "" });
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Seleção de Tipo */}
            {transactionType === null ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setTransactionType("income")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: COLORS.green,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Entrada
                </button>
                <button
                  onClick={() => setTransactionType("expense")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: COLORS.red,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Saída
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Valor */}
                <div>
                  <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg,
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Conta Destino */}
                <div>
                  <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Conta Destino
                  </label>
                  <select
                    value={transactionForm.accountId}
                    onChange={(e) => setTransactionForm({ ...transactionForm, accountId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg,
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Selecione uma conta</option>
                    <option value="cash">Dinheiro Físico</option>
                    {bankAccounts.map((account: any) => (
                      <option key={account.id} value={account.id}>
                        {account.accountName} ({account.bankName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoria */}
                {transactionType === "expense" && (
                  <div>
                    <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                      Categoria
                    </label>
                    <CategoryCombobox
                      value={transactionForm.categoryId}
                      onChange={(categoryId) => setTransactionForm({ ...transactionForm, categoryId })}
                      placeholder="Selecione ou crie uma categoria"
                    />
                  </div>
                )}

                {/* Descrição */}
                <div>
                  <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Descrição
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Venda de produtos"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg,
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Conta Fixa */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", color: COLORS.textSecondary, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={transactionForm.isRecurring}
                      onChange={(e) => setTransactionForm({ ...transactionForm, isRecurring: e.target.checked })}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "14px" }}>Conta Fixa (Aluguel, Mensalidade, etc)</span>
                  </label>
                </div>

                {/* Nome da Conta Fixa */}
                {transactionForm.isRecurring && (
                  <div>
                    <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                      Nome da Conta Fixa
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Aluguel, Mensalidade Agenda 360"
                      value={transactionForm.recurringName}
                      onChange={(e) => setTransactionForm({ ...transactionForm, recurringName: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${COLORS.border}`,
                        backgroundColor: COLORS.bg,
                        color: COLORS.textPrimary,
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}

                {/* Botões */}
                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setTransactionType(null);
                      setTransactionForm({ amount: "", accountId: "", categoryId: null, description: "", isRecurring: false, recurringName: "" });
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: "transparent",
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      if (!transactionForm.amount || !transactionForm.accountId) {
                        alert("Preencha todos os campos obrigatórios");
                        return;
                      }
                      createTransaction.mutate({
                        transactionType: transactionType === "income" ? "income" : "expense",
                        paymentMethod: transactionForm.accountId === "cash" ? "cash" : "transfer",
                        accountId: transactionForm.accountId === "cash" ? bankAccounts.find((acc) => acc.accountType === "cash")?.id : parseInt(transactionForm.accountId),
                        amount: transactionForm.amount,
                        description: transactionForm.description,
                        category: transactionForm.isRecurring ? transactionForm.recurringName : undefined,
                        transactionDate: new Date().toISOString(),
                      }, {
                        onSuccess: () => {
                          alert(`Transação de ${transactionType === "income" ? "entrada" : "saída"} de R$ ${transactionForm.amount} registrada!`);
                          setShowAddModal(false);
                          setTransactionType(null);
                          setTransactionForm({ amount: "", accountId: "", categoryId: null, description: "", isRecurring: false, recurringName: "" });
                          utils.financial.transactions.list.invalidate();
                          utils.financial.totalBalance.invalidate();
                          utils.financial.bankAccounts.list.invalidate();
                        },
                        onError: (error) => {
                          alert("Erro ao registrar transação: " + (error as any).message);
                        },
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: transactionType === "income" ? COLORS.green : COLORS.red,
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
