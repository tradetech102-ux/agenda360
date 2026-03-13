import { useState } from "react";
import { trpc } from "../lib/trpc";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface TaskForm {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: "low" | "medium" | "high";
}

const initialForm: TaskForm = {
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
};

// Cores extraídas da imagem
const COLORS = {
  bgPrimary: "#0a0a0a",
  bgSidebar: "#0d0d0d",
  bgCard: "#1a1a1a",
  border: "#2d2d2d",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  bgHover: "#2a2a2a",
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
};

export default function Tasks({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TaskForm>(initialForm);

  // Tasks queries
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = trpc.tasks.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation();
  const updateMutation = trpc.tasks.update.useMutation();
  const deleteMutation = trpc.tasks.delete.useMutation();

  const getTaskStatus = (dueDate: Date, completed: boolean | null) => {
    if (completed) return { status: "completed", color: COLORS.green, label: "Concluído" };
    
    const now = new Date();
    const taskDate = new Date(dueDate);
    const diffMs = taskDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { status: "overdue", color: COLORS.red, label: "Atrasado" };
    } else if (diffHours < 3) {
      return { status: "pending", color: COLORS.yellow, label: "Pendente" };
    } else {
      return { status: "pending", color: COLORS.yellow, label: "Pendente" };
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenTaskModal = (task?: typeof tasks[0]) => {
    if (task) {
      setEditingId(task.id);
      const dueDate = new Date(task.dueDate);
      setFormData({
        title: task.title,
        description: task.description || "",
        dueDate: dueDate.toISOString().split("T")[0],
        dueTime: dueDate.toTimeString().slice(0, 5),
        priority: task.priority as "low" | "medium" | "high",
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
          dueDate: dueDateTime,
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          dueDate: dueDateTime,
        });
      }
      refetchTasks();
      handleCloseTaskModal();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleToggleComplete = async (task: typeof tasks[0]) => {
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        completed: !task.completed,
      });
      refetchTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      refetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      {/* TASKS MODAL */}
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
              Tarefas
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
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.bgPrimary,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    padding: "8px 12px 8px 36px",
                    color: COLORS.textPrimary,
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => handleOpenTaskModal()}
              style={{
                backgroundColor: COLORS.purple,
                border: `1px solid ${COLORS.purple}`,
                color: COLORS.textPrimary,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purpleLight;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.purple;
              }}
            >
              <Plus size={16} />
              Nova Tarefa
            </button>

            {/* Tasks List */}
            {tasksLoading ? (
              <div style={{ color: COLORS.textSecondary, textAlign: "center", padding: "20px" }}>
                Carregando tarefas...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div style={{ color: COLORS.textSecondary, textAlign: "center", padding: "20px" }}>
                Nenhuma tarefa encontrada
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredTasks.map((task) => {
                  const taskStatus = getTaskStatus(new Date(task.dueDate), task.completed);
                  const dueDate = new Date(task.dueDate);
                  const formattedDate = dueDate.toLocaleDateString("pt-BR");
                  const formattedTime = dueDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: COLORS.bgPrimary,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "8px",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
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
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(task)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: taskStatus.color,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                        }}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>

                      {/* Task Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            color: COLORS.textPrimary,
                            fontSize: "14px",
                            fontWeight: "600",
                            textDecoration: task.completed ? "line-through" : "none",
                            textDecorationColor: taskStatus.color,
                            marginBottom: "4px",
                          }}
                        >
                          {task.title}
                        </div>
                        <div style={{ color: COLORS.textSecondary, fontSize: "12px", marginBottom: "4px" }}>
                          {formattedDate} às {formattedTime}
                        </div>
                        <div
                          style={{
                            display: "inline-block",
                            backgroundColor: taskStatus.color,
                            color: "#000",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          {taskStatus.label}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenTaskModal(task)}
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
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
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
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.red)}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = COLORS.textSecondary)}
                        >
                          <Trash2 size={16} />
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

      {/* TASK FORM MODAL */}
      {showTaskModal && (
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
          onClick={handleCloseTaskModal}
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
                {editingId ? "Editar Tarefa" : "Nova Tarefa"}
              </h2>
              <button
                onClick={handleCloseTaskModal}
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

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              {/* Title */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título da tarefa"
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

              {/* Description */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Digite a descrição da tarefa"
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

              {/* Date and Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                <div>
                  <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
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
              </div>

              {/* Priority */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
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
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCloseTaskModal}
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
    </>
  );
}
