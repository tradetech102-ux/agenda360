import { useState } from "react";
import { trpc } from "../lib/trpc";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  Calendar,
} from "lucide-react";

interface SupplierForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cnpj: string;
  paymentTerms: string;
  notes: string;
}

interface PurchaseForm {
  supplierId: number;
  description: string;
  amount: string;
  purchaseDate: string;
  dueDate: string;
  notes: string;
}

interface PaymentForm {
  purchaseId: number;
  supplierId: number;
  amount: string;
  paymentDate: string;
  paymentMethod: "cash" | "pix" | "debit" | "credit" | "transfer";
  accountId: number | null;
  notes: string;
}

const initialSupplierForm: SupplierForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  cnpj: "",
  paymentTerms: "",
  notes: "",
};

const initialPurchaseForm: PurchaseForm = {
  supplierId: 0,
  description: "",
  amount: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  dueDate: new Date().toISOString().split("T")[0],
  notes: "",
};

const initialPaymentForm: PaymentForm = {
  purchaseId: 0,
  supplierId: 0,
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMethod: "transfer",
  accountId: null,
  notes: "",
};

const COLORS = {
  bgPrimary: "#0a0a0a",
  bgCard: "#1a1a1a",
  bgHover: "#2a2a2a",
  border: "#2d2d2d",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
};

export default function Suppliers({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierForm>(initialSupplierForm);
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>(initialPurchaseForm);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(initialPaymentForm);

  // Suppliers queries
  const utils = trpc.useUtils();
  const { data: suppliers = [], refetch: refetchSuppliers } = trpc.suppliers.list.useQuery();
  const { data: purchases = [], refetch: refetchPurchases } = trpc.supplierPurchases.list.useQuery();
  const { data: bankAccounts = [] } = trpc.financial.bankAccounts.list.useQuery();

  const createSupplierMutation = trpc.suppliers.create.useMutation();
  const updateSupplierMutation = trpc.suppliers.update.useMutation();
  const deleteSupplierMutation = trpc.suppliers.delete.useMutation();

  const createPurchaseMutation = trpc.supplierPurchases.create.useMutation();
  const updatePurchaseMutation = trpc.supplierPurchases.update.useMutation();
  const deletePurchaseMutation = trpc.supplierPurchases.delete.useMutation();
  const payPurchaseMutation = trpc.supplierPurchases.pay.useMutation();

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  // Supplier handlers
  const handleOpenSupplierModal = (supplier?: typeof suppliers[0]) => {
    if (supplier) {
      setEditingId(supplier.id);
      setSupplierForm({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        city: supplier.city || "",
        state: supplier.state || "",
        zipCode: supplier.zipCode || "",
        cnpj: supplier.cnpj || "",
        paymentTerms: supplier.paymentTerms || "",
        notes: supplier.notes || "",
      });
    } else {
      setEditingId(null);
      setSupplierForm(initialSupplierForm);
    }
    setShowSupplierModal(true);
  };

  const handleSubmitSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateSupplierMutation.mutateAsync({
          id: editingId,
          ...supplierForm,
        });
      } else {
        await createSupplierMutation.mutateAsync(supplierForm);
      }
      refetchSuppliers();
      setShowSupplierModal(false);
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este fornecedor?")) {
      try {
        await deleteSupplierMutation.mutateAsync({ id });
        refetchSuppliers();
      } catch (error) {
        console.error("Erro ao deletar fornecedor:", error);
      }
    }
  };

  const handleOpenPaymentModal = (purchase: typeof purchases[0]) => {
    setPaymentForm({
      purchaseId: purchase.id,
      supplierId: purchase.supplierId,
      amount: purchase.amount.toString(),
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "transfer",
      accountId: bankAccounts.length > 0 ? bankAccounts[0].id : null,
      notes: `Pagamento de ${purchase.description}`,
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payPurchaseMutation.mutateAsync({
        purchaseId: paymentForm.purchaseId,
        amount: paymentForm.amount,
        paymentDate: new Date(paymentForm.paymentDate),
        paymentMethod: paymentForm.paymentMethod,
        accountId: paymentForm.accountId || undefined,
        notes: paymentForm.notes,
      });
      refetchPurchases();
      // Invalidar cache de transações financeiras para atualizar o card de saídas
      utils.financial.transactions.list.invalidate();
      utils.financial.totalBalance.invalidate();
      utils.financial.getCashFlowData.invalidate();
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
    }
  }

  // Purchase handlers
  const handleOpenPurchaseModal = (supplier?: typeof suppliers[0]) => {
    if (supplier) {
      setPurchaseForm({
        ...initialPurchaseForm,
        supplierId: supplier.id,
      });
    } else {
      setPurchaseForm(initialPurchaseForm);
    }
    setShowPurchaseModal(true);
  };

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse dates correctly to avoid timezone issues
      const [purchaseYear, purchaseMonth, purchaseDay] = purchaseForm.purchaseDate.split('-');
      const purchaseDate = new Date(parseInt(purchaseYear), parseInt(purchaseMonth) - 1, parseInt(purchaseDay));
      
      const [dueYear, dueMonth, dueDay] = purchaseForm.dueDate.split('-');
      const dueDate = new Date(parseInt(dueYear), parseInt(dueMonth) - 1, parseInt(dueDay));
      
      await createPurchaseMutation.mutateAsync({
        supplierId: purchaseForm.supplierId,
        description: purchaseForm.description,
        amount: purchaseForm.amount,
        purchaseDate: purchaseDate,
        dueDate: dueDate,
        notes: purchaseForm.notes,
      });
      refetchPurchases();
      setShowPurchaseModal(false);
    } catch (error) {
      console.error("Erro ao criar compra:", error);
    }
  };

  const getPurchasesForSupplier = (supplierId: number) => {
    return purchases.filter((p) => p.supplierId === supplierId && p.paymentStatus === "pending");
  };

  const getTotalPendingAmount = (supplierId: number) => {
    return getPurchasesForSupplier(supplierId).reduce((sum, p) => sum + parseFloat(p.amount as any), 0);
  };

  return (
    <>
      {/* SUPPLIERS MODAL */}
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
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            animation: "scaleIn 0.3s ease-out",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes scaleIn {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>

          {/* Modal Header */}
          <div
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ color: COLORS.textPrimary, fontSize: "20px", fontWeight: "600", margin: 0 }}>
              Fornecedor
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: COLORS.textSecondary,
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textPrimary)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", padding: "20px 24px" }}>
            {/* Search */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: COLORS.textSecondary }} />
                <input
                  type="text"
                  placeholder="Buscar fornecedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    padding: "8px 12px 8px 36px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => handleOpenSupplierModal()}
              style={{
                background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleLight} 100%)`,
                border: "none",
                color: COLORS.textPrimary,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
                marginBottom: "16px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <Plus size={16} />
              Novo Fornecedor
            </button>

            {/* Suppliers List */}
            {filteredSuppliers.length === 0 ? (
              <div style={{ textAlign: "center", color: COLORS.textSecondary, padding: "40px 20px" }}>
                {searchTerm ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {filteredSuppliers.map((supplier) => {
                  const pendingPurchases = getPurchasesForSupplier(supplier.id);
                  const totalPending = getTotalPendingAmount(supplier.id);

                  return (
                    <div
                      key={supplier.id}
                      style={{
                        backgroundColor: COLORS.bgPrimary,
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.border}`,
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHover;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgPrimary;
                      }}
                    >
                      <div>
                        <p style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "600", margin: "0 0 8px 0" }}>
                          {supplier.name}
                        </p>
                        {supplier.email && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <Mail size={12} style={{ color: COLORS.textSecondary }} />
                            <span style={{ color: COLORS.textSecondary, fontSize: "11px" }}>
                              {supplier.email}
                            </span>
                          </div>
                        )}
                        {supplier.phone && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Phone size={12} style={{ color: COLORS.textSecondary }} />
                            <span style={{ color: COLORS.textSecondary, fontSize: "11px" }}>
                              {supplier.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pending Purchases */}
                      {pendingPurchases.length > 0 && (
                        <div style={{ backgroundColor: COLORS.bgCard, borderRadius: "6px", padding: "8px", borderLeft: `3px solid ${COLORS.purple}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <DollarSign size={12} style={{ color: COLORS.purple }} />
                            <span style={{ color: COLORS.purple, fontSize: "11px", fontWeight: "600" }}>
                              {pendingPurchases.length} compra{pendingPurchases.length !== 1 ? "s" : ""} a vencer
                            </span>
                          </div>
                          <p style={{ color: COLORS.textPrimary, fontSize: "12px", fontWeight: "600", margin: "0 0 8px 0" }}>
                            R$ {totalPending.toFixed(2)}
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {pendingPurchases.map((purchase) => (
                              <div key={purchase.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: COLORS.textSecondary }}>
                                <span>{purchase.description} - R$ {parseFloat(purchase.amount as any).toFixed(2)}</span>
                                <button
                                  onClick={() => handleOpenPaymentModal(purchase)}
                                  style={{
                                    backgroundColor: "#10b981",
                                    border: "none",
                                    color: COLORS.textPrimary,
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = "#059669";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = "#10b981";
                                  }}
                                >
                                  Pagar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button
                          onClick={() => handleOpenPurchaseModal(supplier)}
                          style={{
                            flex: 1,
                            backgroundColor: COLORS.purple,
                            border: "none",
                            color: COLORS.textPrimary,
                            padding: "8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purpleLight;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purple;
                          }}
                        >
                          Nova Compra
                        </button>
                        <button
                          onClick={() => handleOpenSupplierModal(supplier)}
                          style={{
                            background: "none",
                            border: "none",
                            color: COLORS.textSecondary,
                            cursor: "pointer",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.purple)}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: COLORS.textSecondary,
                            cursor: "pointer",
                            padding: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUPPLIER FORM MODAL */}
      {showSupplierModal && (
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
          onClick={() => setShowSupplierModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
                padding: "24px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ color: COLORS.textPrimary, fontSize: "16px", fontWeight: "600", margin: 0 }}>
                {editingId ? "Editar Fornecedor" : "Novo Fornecedor"}
              </h2>
              <button
                onClick={() => setShowSupplierModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textPrimary)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Endereço
                </label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    value={supplierForm.state}
                    onChange={(e) => setSupplierForm({ ...supplierForm, state: e.target.value })}
                    maxLength={2}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    value={supplierForm.zipCode}
                    onChange={(e) => setSupplierForm({ ...supplierForm, zipCode: e.target.value })}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={supplierForm.cnpj}
                    onChange={(e) => setSupplierForm({ ...supplierForm, cnpj: e.target.value })}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Condições de Pagamento
                  </label>
                  <input
                    type="text"
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    placeholder="Ex: 30 dias"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Notas
                </label>
                <textarea
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  rows={2}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "none",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  style={{
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.textPrimary,
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgPrimary;
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: COLORS.purple,
                    border: `1px solid ${COLORS.purple}`,
                    color: COLORS.textPrimary,
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purpleLight;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purple;
                  }}
                >
                  {editingId ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASE FORM MODAL */}
      {showPurchaseModal && (
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
          onClick={() => setShowPurchaseModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
                padding: "24px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ color: COLORS.textPrimary, fontSize: "16px", fontWeight: "600", margin: 0 }}>
                Nova Compra a Prazo
              </h2>
              <button
                onClick={() => setShowPurchaseModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textPrimary)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPurchase} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Descrição *
                </label>
                <input
                  type="text"
                  value={purchaseForm.description}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                  required
                  placeholder="Ex: Compra de matéria-prima"
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseForm.amount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Data da Compra *
                  </label>
                  <input
                    type="date"
                    value={purchaseForm.purchaseDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={purchaseForm.dueDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, dueDate: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Notas
                </label>
                <textarea
                  value={purchaseForm.notes}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                  rows={2}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "none",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  style={{
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.textPrimary,
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgPrimary;
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: COLORS.purple,
                    border: `1px solid ${COLORS.purple}`,
                    color: COLORS.textPrimary,
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purpleLight;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purple;
                  }}
                >
                  Registrar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
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
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
                padding: "24px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ color: COLORS.textPrimary, fontSize: "16px", fontWeight: "600", margin: 0 }}>
                Registrar Pagamento
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textPrimary)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Valor a Pagar *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Data do Pagamento *
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Forma de Pagamento
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                >
                  <option value="transfer">Transferência</option>
                  <option value="pix">PIX</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Conta Bancária
                </label>
                <select
                  value={paymentForm.accountId || ""}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountId: e.target.value ? parseInt(e.target.value) : null })}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Selecionar Conta (opcional)</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ color: COLORS.textPrimary, fontSize: "11px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Observação
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={2}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "none",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.textPrimary,
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgPrimary;
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#10b981",
                    border: "1px solid #10b981",
                    color: COLORS.textPrimary,
                    padding: "10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#10b981";
                  }}
                >
                  Confirmar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
