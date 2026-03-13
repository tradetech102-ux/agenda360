import React, { useState, useMemo } from "react";
import { Trash2, X, DollarSign } from "lucide-react";
import { trpc } from "../lib/trpc";

interface LoanPaymentModalProps {
  loan: any;
  installments: any[];
  bankAccounts: any[];
  onClose: () => void;
  onPaymentSuccess: () => void;
}

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

export const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({
  loan,
  installments,
  bankAccounts,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    bankAccounts.length > 0 ? bankAccounts[0].id : null
  );
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("full");
  const [customAmount, setCustomAmount] = useState<string>("");

  React.useEffect(() => {
    // Não fazer nada - deixar o usuário selecionar as parcelas
  }, [installments]);

  const utils = trpc.useUtils();
  
  const createPaymentMutation = trpc.loans.recordPayment.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches para evitar sobrescrever a atualização otimista
      await utils.loans.getInstallments.cancel({ loanId: loan.id });
      await utils.loans.list.cancel();
      
      // Snapshot dos dados anteriores para rollback em caso de erro
      const previousInstallments = utils.loans.getInstallments.getData({ loanId: loan.id });
      const previousLoans = utils.loans.list.getData();
      
      // Atualização otimista das parcelas
      if (previousInstallments) {
        const updatedInstallments = previousInstallments.map((inst: any) => {
          if (variables.installmentIds?.includes(inst.id) || variables.installmentId === inst.id) {
            return { ...inst, status: 'paid' };
          }
          return inst;
        });
        utils.loans.getInstallments.setData({ loanId: loan.id }, updatedInstallments);
      }
      
      // Atualização otimista da lista de empréstimos
      if (previousLoans) {
        const updatedLoans = previousLoans.map((l: any) => {
          if (l.id === loan.id) {
            const selectedInstallments = previousInstallments?.filter((inst: any) => 
              variables.installmentIds?.includes(inst.id) || variables.installmentId === inst.id
            ) || [];
            const paymentAmount = selectedInstallments.reduce((sum: number, inst: any) => sum + parseFloat(inst.amount || 0), 0);
            const newRemainingBalance = Math.max(0, parseFloat(l.remainingBalance || 0) - paymentAmount);
            return {
              ...l,
              totalPaid: (parseFloat(l.totalPaid || 0) + paymentAmount).toString(),
              remainingBalance: newRemainingBalance.toString(),
              status: newRemainingBalance <= 0 ? 'Quitado' : l.status,
            };
          }
          return l;
        });
        utils.loans.list.setData(undefined, updatedLoans);
      }
      
      return { previousInstallments, previousLoans };
    },
    onError: (err, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousInstallments) {
        utils.loans.getInstallments.setData({ loanId: loan.id }, context.previousInstallments);
      }
      if (context?.previousLoans) {
        utils.loans.list.setData(undefined, context.previousLoans);
      }
    },
    onSuccess: () => {
      // Invalidar queries para sincronizar com servidor
      utils.loans.getInstallments.invalidate({ loanId: loan.id });
      utils.loans.list.invalidate();
      utils.financial.totalBalance.invalidate();
      utils.financial.bankAccounts.list.invalidate();
      utils.financial.transactions.list.invalidate();
    },
  });

  const selectedInstallmentData = useMemo(() => {
    return installments.filter((_, idx) => selectedInstallments.includes(idx));
  }, [installments, selectedInstallments]);

  const totalPayment = useMemo(() => {
    return selectedInstallmentData.reduce((sum, inst) => {
      const amount = typeof inst.amount === 'string' ? parseFloat(inst.amount) : parseFloat(String(inst.amount || 0));
      return sum + amount;
    }, 0);
  }, [selectedInstallmentData]);

  const handleToggleInstallment = (index: number) => {
    setSelectedInstallments((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleRemoveInstallment = (index: number) => {
    setSelectedInstallments((prev) => prev.filter((i) => i !== index));
  };

  const handleSelectAll = () => {
    if (selectedInstallments.length === installments.length) {
      setSelectedInstallments([]);
    } else {
      setSelectedInstallments(installments.map((_, idx) => idx));
    }
  };

  const getPaymentAmount = () => {
    if (paymentMode === "partial" && customAmount) {
      return parseFloat(customAmount);
    }
    return totalPayment;
  };

  const handlePayment = async () => {
    if (!selectedAccountId || selectedInstallmentData.length === 0) {
      alert("Selecione uma conta e pelo menos uma parcela");
      return;
    }

    if (paymentMode === "partial" && !customAmount) {
      alert("Digite o valor do pagamento parcial");
      return;
    }

    try {
      const paymentAmount = getPaymentAmount();
      const selectedIds = selectedInstallments
        .map((idx) => installments[idx]?.id)
        .filter((id) => id !== undefined);

      // For partial payment, use only the first selected installment
      const paymentData: any = {
        loanId: loan.id,
        accountId: selectedAccountId,
        amount: paymentAmount.toFixed(2),
        paymentType: paymentMode,
        notes,
      };

      if (paymentMode === "partial" && selectedIds.length > 0) {
        paymentData.installmentId = selectedIds[0];
      } else if (paymentMode === "full") {
        paymentData.installmentIds = selectedIds;
      }

      await createPaymentMutation.mutateAsync(paymentData);

      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      alert("Erro ao registrar pagamento");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: COLORS.bgCard,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: COLORS.textPrimary,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            borderBottom: `1px solid ${COLORS.border}`,
            paddingBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={20} color={COLORS.accent} />
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              Registrar Pagamento
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: COLORS.textSecondary,
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Loan Info */}
        <div
          style={{
            backgroundColor: COLORS.bgHover,
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ color: COLORS.textSecondary }}>Empréstimo:</span>
            <span style={{ fontWeight: "500" }}>
              R$ {parseFloat(loan.initialAmount as any).toFixed(2)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.textSecondary }}>Saldo Pendente:</span>
            <span style={{ color: COLORS.danger, fontWeight: "500" }}>
              R$ {parseFloat(loan.remainingBalance as any).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Mode Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
            Tipo de Pagamento
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="paymentMode"
                value="full"
                checked={paymentMode === "full"}
                onChange={(e) => {
                  setPaymentMode(e.target.value as "full" | "partial");
                  setCustomAmount("");
                }}
              />
              <span style={{ fontSize: "14px" }}>Pagamento Completo</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="paymentMode"
                value="partial"
                checked={paymentMode === "partial"}
                onChange={(e) => setPaymentMode(e.target.value as "full" | "partial")}
              />
              <span style={{ fontSize: "14px" }}>Pagamento Parcial</span>
            </label>
          </div>
        </div>

        {/* Account Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
            Conta Bancária
          </label>
          <select
            value={selectedAccountId || ""}
            onChange={(e) => setSelectedAccountId(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: COLORS.bgHover,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              color: COLORS.textPrimary,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="">Selecione uma conta</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountName} - {account.accountType}
              </option>
            ))}
          </select>
        </div>

        {/* Installments Selection */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500" }}>
              Parcelas ({selectedInstallments.length}/{installments.length})
            </label>
            <button
              onClick={handleSelectAll}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                backgroundColor: COLORS.bgHover,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "4px",
                color: COLORS.accent,
                cursor: "pointer",
              }}
            >
              {selectedInstallments.length === installments.length ? "Desselecionar Tudo" : "Selecionar Tudo"}
            </button>
          </div>

          <div
            style={{
              maxHeight: "250px",
              overflowY: "auto",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            {installments.length === 0 ? (
              <div style={{ color: COLORS.textSecondary, fontSize: "14px", padding: "12px", textAlign: "center" }}>
                Nenhuma parcela disponível
              </div>
            ) : (
              installments.map((installment, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    backgroundColor: selectedInstallments.includes(idx) ? COLORS.bgHover : "transparent",
                    borderRadius: "4px",
                    marginBottom: "4px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedInstallments.includes(idx)}
                    onChange={() => handleToggleInstallment(idx)}
                    style={{ cursor: "pointer", pointerEvents: "auto" }}
                  />
                  <div style={{ flex: 1, fontSize: "13px" }}>
                    <div style={{ fontWeight: "500" }}>
                      Parcela {idx + 1} - R$ {parseFloat(installment.amount || 0).toFixed(2)}
                    </div>
                    <div style={{ color: COLORS.textSecondary, fontSize: "12px" }}>
                      Vencimento: {new Date(installment.dueDate).toLocaleDateString("pt-BR")}
                      {installment.status === "partially_paid" && (
                        <span style={{ color: COLORS.warning, marginLeft: "8px" }}>
                          (Parcialmente Paga)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveInstallment(idx);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.danger,
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Custom Amount for Partial Payment */}
        {paymentMode === "partial" && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
              Valor do Pagamento Parcial
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: COLORS.textSecondary }}>R$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Digite o valor"
                step="0.01"
                min="0"
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: COLORS.bgHover,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  color: COLORS.textPrimary,
                  fontSize: "14px",
                }}
              />
            </div>
            {customAmount && (
              <div style={{ marginTop: "8px", fontSize: "12px", color: COLORS.textSecondary }}>
                Saldo pendente após pagamento: R$ {(totalPayment - parseFloat(customAmount)).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre o pagamento..."
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: COLORS.bgHover,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              color: COLORS.textPrimary,
              fontSize: "14px",
              fontFamily: "inherit",
              minHeight: "60px",
              resize: "vertical",
            }}
          />
        </div>

        {/* Total */}
        <div
          style={{
            backgroundColor: COLORS.bgHover,
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          <span>Total a Pagar:</span>
          <span style={{ color: COLORS.accent }}>R$ {getPaymentAmount().toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handlePayment}
            disabled={createPaymentMutation.isPending}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: COLORS.accent,
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: createPaymentMutation.isPending ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: createPaymentMutation.isPending ? 0.6 : 1,
            }}
          >
            {createPaymentMutation.isPending ? "Processando..." : "Confirmar Pagamento"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: COLORS.bgHover,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              color: COLORS.textPrimary,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
