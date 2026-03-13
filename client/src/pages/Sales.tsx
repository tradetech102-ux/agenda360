import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { Pdv } from "./Pdv";

interface SaleForm {
  clientId: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  discount: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "cancelled";
  bankAccountId?: number;
  notes: string;
}

const initialForm: SaleForm = {
  clientId: 0,
  productId: 0,
  quantity: "1",
  unitPrice: "",
  discount: "0",
  paymentMethod: "cash",
  paymentStatus: "pending",
  bankAccountId: undefined,
  notes: "",
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

interface SalesProps {
  onClose: () => void;
}

export default function Sales({ onClose }: SalesProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SaleForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPdvMode, setShowPdvMode] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [finalizeForm, setFinalizeForm] = useState({ accountId: "", notes: "" });

  const { data: sales = [] } = trpc.sales.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: bankAccounts = [] } = trpc.financial.bankAccounts.list.useQuery();

  const utils = trpc.useUtils();
  
  const createMutation = trpc.sales.create.useMutation({
    onSuccess: () => {
      utils.sales.list.invalidate();
      utils.products.list.invalidate();
      utils.financial.totalBalance.invalidate();
    },
  });
  
  const updateMutation = trpc.sales.update.useMutation({
    onSuccess: () => {
      utils.sales.list.invalidate();
    },
  });
  
  const deleteMutation = trpc.sales.delete.useMutation({
    onSuccess: () => {
      utils.sales.list.invalidate();
      utils.products.list.invalidate();
      utils.financial.totalBalance.invalidate();
    },
  });
  
  const createTransactionMutation = trpc.financial.transactions.create.useMutation({
    onSuccess: () => {
      utils.financial.transactions.list.invalidate();
      utils.financial.totalBalance.invalidate();
      utils.financial.bankAccounts.list.invalidate();
      utils.sales.list.invalidate();
    },
  });

  // Debug: Log bank accounts
  useEffect(() => {
    console.log('Bank accounts loaded:', bankAccounts);
  }, [bankAccounts]);

  const filteredSales = sales.filter(
    (sale) =>
      sale.id.toString().includes(searchTerm) ||
      clients.find((c) => c.id === sale.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (sale?: typeof sales[0]) => {
    if (sale) {
      setEditingId(sale.id);
      setForm({
        clientId: sale.clientId,
        productId: (sale.productId as number) || 0,
        quantity: sale.quantity.toString(),
        unitPrice: (sale.unitPrice as any).toString(),
        discount: ((sale.discount as any) || 0).toString(),
        paymentMethod: sale.paymentMethod || "cash",
        paymentStatus: (sale.paymentStatus as any) || "pending",
        notes: sale.notes || "",
      });
    } else {
      setEditingId(null);
      setForm(initialForm);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalPrice = (parseFloat(form.unitPrice) * parseFloat(form.quantity) - parseFloat(form.discount)).toFixed(2);

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          clientId: form.clientId,
          productId: form.productId > 0 ? form.productId : undefined,
          quantity: parseInt(form.quantity),
          unitPrice: parseFloat(form.unitPrice).toString(),
          totalPrice: parseFloat(totalPrice).toString(),
          discount: parseFloat(form.discount).toString(),
          paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus,
          notes: form.notes,
        });
      } else {
        await createMutation.mutateAsync({
          clientId: form.clientId,
          productId: form.productId > 0 ? form.productId : (0 as any),
          quantity: parseInt(form.quantity),
          unitPrice: parseFloat(form.unitPrice).toString(),
          totalPrice: parseFloat(totalPrice).toString(),
          discount: parseFloat(form.discount).toString(),
          paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus,
          accountId: form.bankAccountId,
          notes: form.notes,
        });
      }
      // Will be auto-refetched via invalidate
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta venda?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        // Will be auto-refetched via invalidate
      } catch (error) {
        console.error("Erro ao deletar venda:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return COLORS.success;
      case "pending":
        return COLORS.warning;
      case "cancelled":
        return COLORS.danger;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  // PDV mode disabled - using only Nova Venda form
  // if (showPdvMode) {
  //   return <Pdv />;
  // }

  return (
    <>
      {/* SALES MODAL */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 30,
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: COLORS.bgCard,
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            width: "90%",
            maxWidth: "900px",
            maxHeight: "85vh",
            overflow: "auto",
            padding: "24px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ color: COLORS.textPrimary, fontSize: "20px", fontWeight: "600", margin: 0 }}>Vendas</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: COLORS.textSecondary,
                cursor: "pointer",
                fontSize: "24px",
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Search and Add Button */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "12px", top: "12px", color: COLORS.textSecondary }} />
              <input
                type="text"
                placeholder="Buscar por ID ou cliente..."
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
                color: COLORS.textPrimary,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Plus size={18} />
              Nova Venda
            </button>
            {/* PDV button disabled - using only Nova Venda form */}
            {/* <button
              onClick={() => setShowPdvMode(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: COLORS.success,
                border: "none",
                borderRadius: "8px",
                color: COLORS.textPrimary,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <ShoppingCart size={18} />
              Abrir PDV
            </button> */}
          </div>

          {/* Sales Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontWeight: "500", fontSize: "12px" }}>ID</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontWeight: "500", fontSize: "12px" }}>Cliente</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontWeight: "500", fontSize: "12px" }}>Quantidade</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontWeight: "500", fontSize: "12px" }}>Total</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontWeight: "500", fontSize: "12px" }}>Pagamento</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontWeight: "500", fontSize: "12px" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "center", color: COLORS.textSecondary, fontWeight: "500", fontSize: "12px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{sale.id}</td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>
                      {clients.find((c) => c.id === sale.clientId)?.name}
                    </td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{sale.quantity}</td>
                    <td style={{ padding: "12px", color: COLORS.accent, fontSize: "14px", fontWeight: "500" }}>
                      R$ {parseFloat(sale.totalPrice as any).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{sale.paymentMethod}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: getStatusColor(sale.paymentStatus || "pending"),
                          color: "#000",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {getStatusLabel(sale.paymentStatus || "pending")}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => {
                          if (sale.paymentStatus === "pending") {
                            setSelectedSaleId(sale.id);
                            setShowFinalizeModal(true);
                          } else {
                            handleOpenModal(sale);
                          }
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: sale.paymentStatus === "pending" ? COLORS.success : COLORS.accent,
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                      >
                        {sale.paymentStatus === "pending" ? "✓" : <Edit2 size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: COLORS.danger,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FINALIZE MODAL */}
      {showFinalizeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowFinalizeModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              width: "90%",
              maxWidth: "500px",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "600", marginBottom: "20px", margin: 0 }}>
              Finalizar Venda
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Selecione a Conta *</label>
                <select
                  value={finalizeForm.accountId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Select changed, value:', value, 'type:', typeof value);
                    setFinalizeForm({ ...finalizeForm, accountId: value });
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    console.log('Select blurred, value:', value);
                    if (value && value !== finalizeForm.accountId) {
                      setFinalizeForm({ ...finalizeForm, accountId: value });
                    }
                  }}
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
                  <option value="">Selecione uma conta</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id.toString()}>
                      {account.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Observações (opcional)</label>
                <textarea
                  value={finalizeForm.notes}
                  onChange={(e) => setFinalizeForm({ ...finalizeForm, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    minHeight: "80px",
                    fontFamily: "inherit",
                  }}
                  placeholder="Adicione observações sobre a venda..."
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  onClick={() => setShowFinalizeModal(false)}
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
                  onClick={async () => {
                    console.log('Confirmar clicked, accountId:', finalizeForm.accountId);
                    if (!finalizeForm.accountId || !selectedSaleId) {
                      alert('Por favor, selecione uma conta bancária para finalizar a venda.');
                      return;
                    }
                    
                    const sale = sales.find(s => s.id === selectedSaleId);
                    if (!sale) return;

                    try {
                      console.log('Starting finalize process for sale:', selectedSaleId);
                      // Create financial transaction
                      const paymentMethodMap: Record<string, "cash" | "pix" | "debit" | "credit" | "transfer"> = {
                        "cash": "cash",
                        "pix": "pix",
                        "debit": "debit",
                        "credit": "credit",
                        "transfer": "transfer"
                      } as const;
                      const mappedPaymentMethod = paymentMethodMap[sale.paymentMethod as keyof typeof paymentMethodMap] || "cash";
                      
                      console.log('Creating transaction with:', {
                        transactionType: "income",
                        amount: (sale.totalPrice as any).toString(),
                        description: `Venda #${sale.id}`,
                        accountId: parseInt(finalizeForm.accountId),
                        paymentMethod: mappedPaymentMethod,
                        transactionDate: new Date().toISOString(),
                      });
                      
                      const txResult = await createTransactionMutation.mutateAsync({
                        transactionType: "income",
                        amount: (sale.totalPrice as any).toString(),
                        description: `Venda #${sale.id}`,
                        accountId: parseInt(finalizeForm.accountId),
                        paymentMethod: mappedPaymentMethod,
                        transactionDate: new Date().toISOString(),
                      });
                      
                      console.log('Transaction created successfully:', txResult);

                      console.log('Updating sale status to paid');
                      // Update sale status
                      await updateMutation.mutateAsync({
                        id: selectedSaleId,
                        clientId: sale.clientId,
                        quantity: parseInt(sale.quantity.toString()),
                        unitPrice: (sale.unitPrice as any).toString(),
                        totalPrice: (sale.totalPrice as any).toString(),
                        discount: ((sale.discount as any) || 0).toString(),
                        paymentMethod: (sale.paymentMethod as "cash" | "pix" | "debit" | "credit" | "transfer") || "cash",
                        paymentStatus: "paid",
                        notes: finalizeForm.notes,
                      });

                      // Refresh data
                      await utils.sales.list.invalidate();
                      await utils.financial.transactions.list.invalidate();
                      await utils.financial.totalBalance.invalidate();

                      setShowFinalizeModal(false);
                      setFinalizeForm({ accountId: "", notes: "" });
                      setSelectedSaleId(null);
                    } catch (error) {
                      console.error("Erro ao finalizar venda:", error);
                      alert(`Erro ao finalizar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: COLORS.success,
                    border: "none",
                    borderRadius: "8px",
                    color: "#000",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Confirmar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              width: "90%",
              maxWidth: "500px",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "600", marginBottom: "20px", margin: 0 }}>
              {editingId ? "Editar Venda" : "Nova Venda"}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Client Select */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Cliente *</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: parseInt(e.target.value) })}
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

              {/* Product Select */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Produto</label>
                <select
                  value={form.productId}
                  onChange={(e) => {
                    const productId = parseInt(e.target.value);
                    const selectedProduct = products.find(p => p.id === productId);
                    if (selectedProduct && selectedProduct.price) {
                      setForm({ ...form, productId, unitPrice: selectedProduct.price.toString() });
                    } else {
                      setForm({ ...form, productId });
                    }
                  }}
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
                  <option value={0}>Selecione um produto (opcional)</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Quantidade *</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  min="1"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Unit Price */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Preço Unitário *</label>
                <input
                  type="number"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  required
                  step="0.01"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Discount */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Desconto</label>
                <input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  step="0.01"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Método de Pagamento</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
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
                  <option value="cash">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>

              {/* Bank Account Selection */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Selecione a Conta</label>
                <select
                  value={form.bankAccountId || 0}
                  onChange={(e) => setForm({ ...form, bankAccountId: parseInt(e.target.value) })}
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
                  <option value={0}>Selecione uma conta</option>
                  {bankAccounts.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName || account.accountNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Status de Pagamento</label>
                <select
                  value={form.paymentStatus}
                  onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as any })}
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
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "8px" }}>Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: COLORS.bgHover,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    minHeight: "80px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

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
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: COLORS.accent,
                    border: "none",
                    borderRadius: "8px",
                    color: COLORS.textPrimary,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {editingId ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
