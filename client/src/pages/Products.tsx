import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { Plus, Search, X, Edit2, Trash2 } from "lucide-react";

const COLORS = {
  bgPrimary: "#0a0a0a",
  bgCard: "#1a1a1a",
  border: "#2d2d2d",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  bgHover: "#2a2a2a",
  green: "#22c55e",
};

export default function Products({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    sku: "",
    supplierId: "",
    measure: "",
    unit: "",
    weight: "",
    cost: "",
    markup: "",
    marginPercentage: "",
    price: "",
    quantity: 0,
    category: "",
  });

  const utils = trpc.useUtils();
  const { data: products = [], isLoading } = trpc.products.list.useQuery();
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery();
  
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
    },
  });
  
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
    },
  });
  
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
    },
  });

  const calculatePrice = (cost: string, markup: string, margin: string): string => {
    const costNum = parseFloat(cost) || 0;
    if (markup) {
      return (costNum * (1 + parseFloat(markup) / 100)).toFixed(2);
    } else if (margin) {
      return (costNum / (1 - parseFloat(margin) / 100)).toFixed(2);
    }
    return cost;
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: typeof products[0]) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        code: product.code || "",
        description: product.description || "",
        sku: product.sku || "",
        supplierId: product.supplierId?.toString() || "",
        measure: product.measure || "",
        unit: product.unit || "",
        weight: product.weight?.toString() || "",
        cost: product.cost?.toString() || "",
        markup: product.markup?.toString() || "",
        marginPercentage: product.marginPercentage?.toString() || "",
        price: product.price?.toString() || "",
        quantity: product.quantity || 0,
        category: product.category || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        sku: "",
        supplierId: "",
        measure: "",
        unit: "",
        weight: "",
        cost: "",
        markup: "",
        marginPercentage: "",
        price: "",
        quantity: 0,
        category: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!formData.name || !formData.cost || !formData.price) {
      alert("Por favor, preencha os campos obrigatórios: Nome, Custo e Preço");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const cleanData = {
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
        sku: formData.sku || undefined,
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
        measure: formData.measure || undefined,
        unit: formData.unit || undefined,
        weight: formData.weight || undefined,
        cost: formData.cost,
        markup: formData.markup || undefined,
        marginPercentage: formData.marginPercentage || undefined,
        price: formData.price,
        quantity: parseInt(formData.quantity.toString()),
        category: formData.category || undefined,
      };
      
      console.log("Creating product:", cleanData);
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...cleanData,
        });
      } else {
        await createMutation.mutateAsync(cleanData);
      }
      setShowModal(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        sku: "",
        supplierId: "",
        measure: "",
        unit: "",
        weight: "",
        cost: "",
        markup: "",
        marginPercentage: "",
        price: "",
        quantity: 0,
        category: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Erro ao salvar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
      try {
        await deleteMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: COLORS.bgPrimary }}>
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "700", margin: 0 }}>Produtos</h1>
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              padding: "8px 12px",
              color: COLORS.textPrimary,
              fontSize: "13px",
              outline: "none",
              width: "200px",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => handleOpenModal()}
            style={{
              backgroundColor: COLORS.purple,
              border: "none",
              borderRadius: "6px",
              color: COLORS.textPrimary,
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purpleLight)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purple)}
          >
            <Plus size={16} />
            Novo Produto
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: COLORS.textSecondary,
              cursor: "pointer",
              padding: "4px",
              transition: "color 0.2s",
              fontSize: "18px",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textPrimary)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
        {isLoading ? (
          <div style={{ color: COLORS.textSecondary, textAlign: "center", padding: "40px" }}>
            Carregando produtos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ color: COLORS.textSecondary, textAlign: "center", padding: "40px" }}>
            Nenhum produto encontrado
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Código</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Nome</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Medida</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Custo</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Preço</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Estoque</th>
                  <th style={{ padding: "12px", textAlign: "left", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{product.code || "-"}</td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{product.name}</td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{product.measure} {product.unit}</td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>R$ {parseFloat(product.cost as any).toFixed(2)}</td>
                    <td style={{ padding: "12px", color: COLORS.green, fontSize: "14px", fontWeight: "600" }}>R$ {parseFloat(product.price as any).toFixed(2)}</td>
                    <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>{product.quantity}</td>
                    <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleOpenModal(product)}
                        style={{
                          background: "none",
                          border: "none",
                          color: COLORS.textSecondary,
                          cursor: "pointer",
                          padding: "4px",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textPrimary)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: COLORS.textSecondary,
                          cursor: "pointer",
                          padding: "4px",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: "16px",
              border: `1px solid ${COLORS.border}`,
              width: "90%",
              maxWidth: "600px",
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
                padding: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ color: COLORS.textPrimary, fontSize: "16px", fontWeight: "600", margin: 0 }}>
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.textSecondary,
                  cursor: "pointer",
                  padding: "4px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textPrimary)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              {/* Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do produto"
                  required
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Code and SKU */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Código único"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do produto"
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                    minHeight: "80px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Supplier */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Fornecedor
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Measure and Unit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Medida
                  </label>
                  <input
                    type="text"
                    value={formData.measure}
                    onChange={(e) => setFormData({ ...formData, measure: e.target.value })}
                    placeholder="kg, L, m..."
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="caixa, pacote..."
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="0.000"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Cost */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Custo *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => {
                    setFormData({ ...formData, cost: e.target.value });
                    if (formData.markup || formData.marginPercentage) {
                      const newPrice = calculatePrice(e.target.value, formData.markup, formData.marginPercentage);
                      setFormData(prev => ({ ...prev, price: newPrice }));
                    }
                  }}
                  placeholder="0.00"
                  required
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Markup and Margin */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Markup (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.markup}
                    onChange={(e) => {
                      setFormData({ ...formData, markup: e.target.value, marginPercentage: "" });
                      const newPrice = calculatePrice(formData.cost, e.target.value, "");
                      setFormData(prev => ({ ...prev, price: newPrice }));
                    }}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Margem (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.marginPercentage}
                    onChange={(e) => {
                      setFormData({ ...formData, marginPercentage: e.target.value, markup: "" });
                      const newPrice = calculatePrice(formData.cost, "", e.target.value);
                      setFormData(prev => ({ ...prev, price: newPrice }));
                    }}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Preço *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: COLORS.textPrimary,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Quantity and Category */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Estoque
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Categoria"
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: COLORS.textPrimary,
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.textPrimary,
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHover)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgPrimary)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? COLORS.bgHover : COLORS.purple,
                    border: "none",
                    color: COLORS.textPrimary,
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purpleLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purple;
                    }
                  }}
                >
                  {isSubmitting ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
