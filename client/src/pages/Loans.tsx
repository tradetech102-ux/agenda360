import React, { useState, useEffect, useMemo } from "react";
// MODULO DE EMPRESTIMOS - JUROS SIMPLES
// Este modulo utiliza APENAS juros simples (fixo)
// Calculo: valor_total = valor_inicial + (valor_inicial * percentual_juros)
// Os juros sao calculados UMA UNICA VEZ no momento da criacao
// Nao sao recalculados apos pagamentos parciais

import { trpc } from "../lib/trpc";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Eye,
  Copy,
  DollarSign,
} from "lucide-react";
import { LoanPaymentModal } from "../components/LoanPaymentModal";
import { CopyButton } from "../components/CopyButton";

interface LoanForm {
  clientId: number;
  type: "lent" | "borrowed";
  initialAmount: string;
  accountId?: number;
  interestRate: string;
  isInstallment: boolean;
  numberOfInstallments: string;
  frequency: string;
}

const initialForm: LoanForm = {
  clientId: 0,
  type: "lent",
  initialAmount: "",
  accountId: undefined,
  interestRate: "0",
  isInstallment: false,
  numberOfInstallments: "",
  frequency: "monthly",
};

const COLORS = {
  bgPrimary: "#0a0a0a",
  bgCard: "#1a1a1a",
  bgHover: "#2a2a2a",
  border: "#2d2d2d",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  accent: "#8b5cf6",
  accentHover: "#a78bfa",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

interface LoansProps {
  onClose: () => void;
}

export default function Loans({ onClose }: LoansProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<LoanForm>(initialForm);
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: loans = [], refetch: refetchLoans } = trpc.loans.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery(undefined, { enabled: true });
  const { data: bankAccounts = [] } = trpc.financial.bankAccounts.list.useQuery(undefined, { enabled: true });
  const loanId = selectedLoan?.id ?? 0;
  const { data: installmentsData, isLoading: installmentsLoading, refetch: refetchInstallments } = trpc.loans.getInstallments.useQuery(
    { loanId },
    { enabled: !!selectedLoan }
  );
  
  // Refetch installments when summary modal opens
  useEffect(() => {
    if (showSummary && selectedLoan) {
      console.log("[Loans] Loading installments for loan:", selectedLoan.id);
      // Installments will be auto-fetched via query
    }
  }, [showSummary, selectedLoan, refetchInstallments]);
  const installments = Array.isArray(installmentsData) ? installmentsData : [];


  const utils = trpc.useUtils();
  
  const createMutation = trpc.loans.create.useMutation({
    onSuccess: () => {
      utils.loans.list.invalidate();
      utils.financial.totalBalance.invalidate();
      utils.financial.bankAccounts.list.invalidate();
      utils.calendar.events.invalidate();
    },
  });
  
  const updateMutation = trpc.loans.update.useMutation({
    onSuccess: () => {
      utils.loans.list.invalidate();
      if (selectedLoan?.id) {
        utils.loans.getInstallments.invalidate({ loanId: selectedLoan.id });
      }
    },
  });
  
  const deleteMutation = trpc.loans.delete.useMutation({
    onSuccess: () => {
      utils.loans.list.invalidate();
      utils.financial.totalBalance.invalidate();
      utils.financial.bankAccounts.list.invalidate();
      utils.calendar.events.invalidate();
      setSelectedLoan(null);
      setShowSummary(false);
    },
  });
  
  const paymentMutation = trpc.loans.recordPayment.useMutation({
    onSuccess: () => {
      // Invalidar queries específicas com o loanId
      if (selectedLoan?.id) {
        utils.loans.getInstallments.invalidate({ loanId: selectedLoan.id });
      }
      // Invalidar lista geral
      utils.loans.list.invalidate();
      // Invalidar dados financeiros
      utils.financial.totalBalance.invalidate();
      utils.financial.bankAccounts.list.invalidate();
      utils.financial.transactions.list.invalidate();
    },
  });

  const filteredLoans = loans.filter(
    (loan) =>
      loan.id.toString().includes(searchTerm) ||
      clients.find((c) => c.id === loan.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (loan?: typeof loans[0]) => {
    if (loan) {
      setEditingId(loan.id);
      setFormData({
        clientId: loan.clientId,
        type: loan.type as "lent" | "borrowed",
        initialAmount: (loan.initialAmount as any).toString(),
        interestRate: (loan.interestRate as any).toString(),
        isInstallment: loan.isInstallment || false,
        numberOfInstallments: (loan.numberOfInstallments || "").toString(),
        frequency: loan.frequency || "monthly",
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evitar múltiplos submits
    if (isSubmitting) return;
    
    if (!formData.clientId) {
      alert("Selecione um cliente");
      return;
    }
    if (!formData.initialAmount) {
      alert("Informe o valor inicial");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          status: "active",
        });
      } else {
        await createMutation.mutateAsync({
          clientId: formData.clientId,
          type: formData.type,
          initialAmount: formData.initialAmount,
          accountId: formData.accountId,
          interestRate: formData.interestRate,
          isInstallment: formData.isInstallment,
          numberOfInstallments: formData.isInstallment ? parseInt(formData.numberOfInstallments) : undefined,
          frequency: formData.frequency,
        });
      }
      setShowModal(false);
      setFormData(initialForm);
    } catch (error) {
      console.error("Error saving loan:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este empréstimo?")) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error) {
        console.error("Error deleting loan:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return COLORS.success;
      case "overdue":
        return COLORS.danger;
      default:
        return COLORS.warning;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Quitado";
      case "overdue":
        return "Atrasado";
      default:
        return "Ativo";
    }
  };

  const getTypeLabel = (type: string) => {
    return type === "lent" ? "Emprestei" : "Peguei";
  };

  const generateWhatsAppSummary = (loan: any) => {
    const clientName = clients.find((c) => c.id === loan.clientId)?.name || "Cliente";
    const text = `📄 *RESUMO DO EMPRÉSTIMO*

👤 Cliente: ${clientName}
💰 Valor inicial: R$ ${parseFloat(loan.initialAmount as any).toFixed(2)}
📈 Juros: ${loan.interestRate}%

💵 Total com juros: R$ ${parseFloat(loan.totalWithInterest as any).toFixed(2)}

✅ Pago: R$ ${parseFloat(loan.totalPaid as any).toFixed(2)}
⏳ Pendente: R$ ${parseFloat(loan.remainingBalance as any).toFixed(2)}

📅 Atualizado em: ${new Date().toLocaleDateString("pt-BR")}`;

    return text;
  };

  // Função mantida para compatibilidade, mas não é mais usada
  // O CopyButton agora cuida de todo o feedback visual
  const handleCopyToClipboard = async (loan: any, e?: React.MouseEvent) => {
    try {
      const text = generateWhatsAppSummary(loan);
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const handleShareWhatsApp = (loan: any) => {
    const text = generateWhatsAppSummary(loan);
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: COLORS.bgCard,
          borderRadius: "16px",
          width: "90%",
          maxWidth: "900px",
          maxHeight: "90vh",
          overflow: "auto",
          border: `1px solid ${COLORS.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px",
            borderBottom: `1px solid ${COLORS.border}`,
            position: "sticky",
            top: 0,
            backgroundColor: COLORS.bgCard,
            zIndex: 10,
          }}
        >
          <h2 style={{ color: COLORS.textPrimary, margin: 0, fontSize: "20px", fontWeight: "600" }}>
            Empréstimo
          </h2>
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
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Search and Add Button */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: COLORS.textSecondary,
                }}
              />
              <input
                type="text"
                placeholder="Buscar empréstimo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  backgroundColor: COLORS.bgHover,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  color: COLORS.textPrimary,
                  fontSize: "14px",
                }}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: COLORS.accent,
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Plus size={18} />
              Novo Empréstimo
            </button>
          </div>

          {/* Loans Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>ID</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Cliente</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Tipo</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Valor</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Juros</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "center", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{loan.id}</td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>
                      {clients.find((c) => c.id === loan.clientId)?.name || "N/A"}
                    </td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>
                      {getTypeLabel(loan.type)}
                    </td>
                    <td style={{ padding: "12px", color: COLORS.accent, fontSize: "14px", fontWeight: "500" }}>
                      R$ {parseFloat(loan.initialAmount as any).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>
                      {loan.interestRate}%
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: getStatusColor(loan.status || "active"),
                          color: "#000",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {getStatusLabel(loan.status || "active")}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setShowSummary(true);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: COLORS.accent,
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            transition: "opacity 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                          title="Ver resumo"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenModal(loan)}
                          style={{
                            background: "none",
                            border: "none",
                            color: COLORS.accent,
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(loan.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: COLORS.danger,
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          title="Deletar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLoans.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.textSecondary }}>
              Nenhum empréstimo encontrado
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              border: `1px solid ${COLORS.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: COLORS.textPrimary, margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
              {editingId ? "Editar Empréstimo" : "Novo Empréstimo"}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Client */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Cliente *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                >
                  <option value={0}>Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "lent" | "borrowed" })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                >
                  <option value="lent">Emprestei dinheiro</option>
                  <option value="borrowed">Peguei empréstimo</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Valor Inicial *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initialAmount}
                  onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                  placeholder="0.00"
                />
              </div>

              {/* Bank Account */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Conta Bancaria</label>
                <select
                  value={formData.accountId || ""}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value ? parseInt(e.target.value) : undefined })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                >
                  <option value="">Selecione uma conta (opcional)</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName} - {account.bankName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interest Rate */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Taxa de Juros (%) - Juros Simples</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                  placeholder="0.00"
                />
              </div>

              {/* Is Installment */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="checkbox"
                  checked={formData.isInstallment}
                  onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked })}
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                />
                <label style={{ color: COLORS.textPrimary, fontSize: "14px", cursor: "pointer", margin: 0 }}>
                  Parcelado
                </label>
              </div>

              {/* Number of Installments */}
              {formData.isInstallment && (
                <div>
                  <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Número de Parcelas *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfInstallments}
                    onChange={(e) => setFormData({ ...formData, numberOfInstallments: e.target.value })}
                    required={formData.isInstallment}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: COLORS.bgHover,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "8px",
                      color: COLORS.textPrimary,
                      fontSize: "14px",
                    }}
                    placeholder="12"
                  />
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: isSubmitting ? "#6b7280" : COLORS.accent,
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? "Enviando..." : editingId ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && selectedLoan && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
          onClick={() => setShowSummary(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              border: `1px solid ${COLORS.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: COLORS.textPrimary, margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
              Resumo do Empréstimo
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Cliente:</span>
                <span style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "500" }}>
                  {clients.find((c) => c.id === selectedLoan.clientId)?.name || "N/A"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Valor inicial:</span>
                <span style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "500" }}>
                  R$ {parseFloat(selectedLoan.initialAmount as any).toFixed(2)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Juros:</span>
                <span style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "500" }}>
                  {selectedLoan.interestRate}%
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Total com juros:</span>
                <span style={{ color: COLORS.accent, fontSize: "14px", fontWeight: "500" }}>
                  R$ {parseFloat(selectedLoan.totalWithInterest as any).toFixed(2)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Pago:</span>
                <span style={{ color: COLORS.success, fontSize: "14px", fontWeight: "500" }}>
                  R$ {parseFloat(selectedLoan.totalPaid as any).toFixed(2)}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Pendente:</span>
                <span style={{ color: COLORS.danger, fontSize: "14px", fontWeight: "500" }}>
                  R$ {parseFloat(selectedLoan.remainingBalance as any).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Installments Section */}
            {installments && installments.length > 0 && (
              <div style={{ marginBottom: "24px", borderTop: `1px solid ${COLORS.border}`, paddingTop: "16px" }}>
                <h4 style={{ color: COLORS.textPrimary, margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>
                  Parcelas ({installments.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {installments.map((inst: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: "16px",
                        backgroundColor: COLORS.bgHover,
                        borderRadius: "6px",
                        fontSize: "13px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ color: COLORS.textPrimary, fontWeight: "500" }}>
                          Parcela {inst.installmentNumber}
                        </div>
                        <div style={{ color: COLORS.textSecondary, fontSize: "12px", marginTop: "4px" }}>
                          Vencimento: {new Date(inst.dueDate).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: COLORS.textPrimary, fontWeight: "500" }}>
                          R$ {parseFloat(inst.amount || 0).toFixed(2)}
                        </div>
                        <div
                          style={{
                            color: inst.status === "paid" ? COLORS.success : inst.status === "overdue" ? COLORS.danger : COLORS.warning,
                            fontSize: "11px",
                          }}
                        >
                          {inst.status === "paid" ? "Paga" : inst.status === "overdue" ? "Vencida" : "Pendente"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <CopyButton
                text={generateWhatsAppSummary(selectedLoan)}
                label="Copiar"
                variant="outline"
                size="md"
                className="flex-1"
                onCopySuccess={() => console.log("Copiado com sucesso!")}
              />
              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px",
                  backgroundColor: COLORS.accent,
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <DollarSign size={16} />
                Pagamento
              </button>
              <button
                onClick={() => setShowSummary(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: COLORS.bgHover,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  color: COLORS.textPrimary,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
       {showPaymentModal && selectedLoan && (
        <LoanPaymentModal
          loan={selectedLoan}
          installments={installments}
          bankAccounts={bankAccounts}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            // Refetch loans list
            refetchLoans().then((result) => {
              // Update selectedLoan with fresh data from the list
              if (result.data) {
                const updatedLoan = result.data.find((l: any) => l.id === selectedLoan.id);
                if (updatedLoan) {
                  setSelectedLoan(updatedLoan);
                }
              }
            });
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
}
