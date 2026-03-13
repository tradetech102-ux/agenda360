import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2 } from "lucide-react";

const COLORS = {
  bg: "#0B0B0C",
  bgCard: "#121212",
  hover: "#1A1A1A",
  textPrimary: "#E5E7EB",
  textSecondary: "#9CA3AF",
  red: "#EF4444",
  purple: "#7c3aed",
};

const COLOR_OPTIONS = [
  "#7c3aed",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
];

const ICON_OPTIONS = [
  "shopping-cart",
  "home",
  "users",
  "book",
  "truck",
  "tag",
  "credit-card",
  "utensils",
  "zap",
  "heart",
];

export default function CategorySettings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "tag",
    color: "#7c3aed",
  });

  const utils = trpc.useUtils();
  const { data: categories = [] } = trpc.expenseCategories.list.useQuery();
  const createMutation = trpc.expenseCategories.create.useMutation({
    onSuccess: () => {
      utils.expenseCategories.list.invalidate();
      setFormData({ name: "", icon: "tag", color: "#7c3aed" });
      setShowCreateModal(false);
    },
  });
  const deleteMutation = trpc.expenseCategories.delete.useMutation({
    onSuccess: () => {
      utils.expenseCategories.list.invalidate();
    },
  });

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) return;
    await createMutation.mutateAsync({
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
    });
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta categoria?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary, margin: 0 }}>
          Categorias de Despesas
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: COLORS.purple,
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6d28d9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.purple;
          }}
        >
          <Plus size={16} />
          Nova Categoria
        </button>
      </div>

      {categories.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.hover}` }}>
                <th style={{ textAlign: "left", padding: "12px", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>
                  Nome
                </th>
                <th style={{ textAlign: "left", padding: "12px", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>
                  Cor
                </th>
                <th style={{ textAlign: "left", padding: "12px", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>
                  Uso
                </th>
                <th style={{ textAlign: "left", padding: "12px", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600" }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} style={{ borderBottom: `1px solid ${COLORS.hover}` }}>
                  <td style={{ padding: "12px", color: COLORS.textPrimary, fontSize: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: category.color || COLORS.purple,
                        }}
                      />
                      {category.name}
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: COLORS.textSecondary, fontSize: "14px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        backgroundColor: category.color || COLORS.purple,
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "white",
                      }}
                    >
                      {category.color}
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: COLORS.textSecondary, fontSize: "14px" }}>
                    {category.usageCount || 0} vezes
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        backgroundColor: "transparent",
                        color: COLORS.red,
                        border: `1px solid ${COLORS.red}`,
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.red;
                        (e.currentTarget as HTMLButtonElement).style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = COLORS.red;
                      }}
                    >
                      <Trash2 size={14} />
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "32px", color: COLORS.textSecondary }}>
          <p style={{ fontSize: "14px", margin: 0 }}>Nenhuma categoria criada ainda</p>
          <p style={{ fontSize: "12px", margin: "8px 0 0 0" }}>Clique em "Nova Categoria" para começar</p>
        </div>
      )}

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(5px)",
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.hover}`,
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "700", margin: 0 }}>
                Nova Categoria
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
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
              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Supermercado"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.hover}`,
                    backgroundColor: COLORS.bg,
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Cor
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: "100%",
                        height: "40px",
                        borderRadius: "6px",
                        backgroundColor: color,
                        border: formData.color === color ? "3px solid white" : "none",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Ícone
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.hover}`,
                    backgroundColor: COLORS.bg,
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.hover}`,
                    backgroundColor: "transparent",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.hover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!formData.name.trim() || createMutation.isPending}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: COLORS.purple,
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    opacity: !formData.name.trim() || createMutation.isPending ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!(!formData.name.trim() || createMutation.isPending)) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6d28d9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.purple;
                  }}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Categoria"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
