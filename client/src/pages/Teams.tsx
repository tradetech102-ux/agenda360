import { useState } from "react";
import { trpc } from "../lib/trpc";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Users,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

// Cores do design
const COLORS = {
  bgPrimary: "#0a0a0a",
  bgSidebar: "#0d0d0d",
  bgCard: "#1a1a1a",
  bgHover: "#2a2a2a",
  border: "#2d2d2d",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  green: "#10b981",
  blue: "#3b82f6",
  yellow: "#f59e0b",
};

interface TeamForm {
  name: string;
  description: string;
}

const initialTeamForm: TeamForm = {
  name: "",
  description: "",
};

interface TaskForm {
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
}

const initialTaskForm: TaskForm = {
  title: "",
  description: "",
  dueDate: "",
  assignedTo: "",
};

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamFormData, setTeamFormData] = useState<TeamForm>(initialTeamForm);
  const [taskFormData, setTaskFormData] = useState<TaskForm>(initialTaskForm);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "chat" | "members">("tasks");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [taskSearchTerm, setTaskSearchTerm] = useState("");

  // Utils
  const utils = trpc.useUtils();

  // Queries
  const { data: teams = [], isLoading: teamsLoading } = trpc.teams.list.useQuery();
  const { data: tasks = [], isLoading: tasksLoading } = trpc.teamTasks.getTasks.useQuery(
    { teamId: selectedTeamId || 0 },
    { enabled: !!selectedTeamId }
  );

  // Mutations
  const createTeamMutation = trpc.teams.create.useMutation({
    onSuccess: () => {
      setTeamFormData(initialTeamForm);
      setShowTeamModal(false);
      utils.teams.list.invalidate();
    },
  });

  const updateTeamMutation = trpc.teams.update.useMutation({
    onSuccess: () => {
      setTeamFormData(initialTeamForm);
      setShowTeamModal(false);
      setEditingTeamId(null);
      utils.teams.list.invalidate();
    },
  });

  const deleteTeamMutation = trpc.teams.delete.useMutation({
    onSuccess: () => {
      setSelectedTeamId(null);
      utils.teams.list.invalidate();
    },
  });

  const createTaskMutation = trpc.teamTasks.createTask.useMutation({
    onSuccess: () => {
      setTaskFormData(initialTaskForm);
      setShowTaskModal(false);
      if (selectedTeamId) {
        utils.teamTasks.getTasks.invalidate({ teamId: selectedTeamId });
      }
    },
  });

  const updateTaskStatusMutation = trpc.teamTasks.updateTaskStatus.useMutation({
    onSuccess: () => {
      if (selectedTeamId) {
        utils.teamTasks.getTasks.invalidate({ teamId: selectedTeamId });
      }
    },
  });

  const deleteTaskMutation = trpc.teamTasks.deleteTask.useMutation({
    onSuccess: () => {
      if (selectedTeamId) {
        utils.teamTasks.getTasks.invalidate({ teamId: selectedTeamId });
      }
    },
  });

  // Handlers
  const handleOpenTeamModal = (team?: typeof teams[0]) => {
    if (team) {
      setEditingTeamId(team.id);
      setTeamFormData({
        name: team.name,
        description: team.description || "",
      });
    } else {
      setEditingTeamId(null);
      setTeamFormData(initialTeamForm);
    }
    setShowTeamModal(true);
  };

  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFormData.name.trim()) return;

    try {
      if (editingTeamId) {
        await updateTeamMutation.mutateAsync({
          id: editingTeamId,
          name: teamFormData.name,
          description: teamFormData.description,
        });
      } else {
        await createTeamMutation.mutateAsync({
          name: teamFormData.name,
          description: teamFormData.description,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar time:", error);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (confirm("Tem certeza que deseja deletar este time?")) {
      await deleteTeamMutation.mutateAsync({ id: teamId });
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title.trim() || !selectedTeamId) return;

    try {
      await createTaskMutation.mutateAsync({
        teamId: selectedTeamId,
        title: taskFormData.title,
        description: taskFormData.description || "",
        dueDate: taskFormData.dueDate ? new Date(taskFormData.dueDate) : new Date(),
        assignedTo: taskFormData.assignedTo ? parseInt(taskFormData.assignedTo) : 0,
      });
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    await updateTaskStatusMutation.mutateAsync({
      taskId,
      status: newStatus as "pending" | "in_progress" | "completed",
    });
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      await deleteTaskMutation.mutateAsync({ taskId });
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(taskSearchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter((t: any) => t.status === "pending"),
    in_progress: filteredTasks.filter((t: any) => t.status === "in_progress"),
    completed: filteredTasks.filter((t: any) => t.status === "completed"),
  };

  const selectedTeam = teams.find((t: any) => t.id === selectedTeamId);

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: COLORS.bgPrimary }}>
      {/* SIDEBAR - Times List */}
      <div
        style={{
          width: "280px",
          backgroundColor: COLORS.bgSidebar,
          borderRight: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{ color: COLORS.textPrimary, fontSize: "16px", fontWeight: "600", margin: 0 }}>Times</h2>
          <button
            onClick={() => handleOpenTeamModal()}
            style={{
              backgroundColor: COLORS.purple,
              border: "none",
              color: COLORS.textPrimary,
              padding: "6px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {teamsLoading ? (
            <div style={{ color: COLORS.textSecondary, fontSize: "12px", padding: "8px" }}>Carregando...</div>
          ) : teams.length === 0 ? (
            <div style={{ color: COLORS.textSecondary, fontSize: "12px", padding: "8px" }}>Nenhum time criado</div>
          ) : (
            teams.map((team: any) => (
              <div
                key={team.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  backgroundColor: selectedTeamId === team.id ? COLORS.purple : "transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedTeamId !== team.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTeamId !== team.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <div
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => setSelectedTeamId(team.id)}
                >
                  <div style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "500" }}>{team.name}</div>
                  <div style={{ color: COLORS.textSecondary, fontSize: "11px", marginTop: "2px" }}>{team.description}</div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTeamModal(team);
                    }}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: COLORS.textSecondary,
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = COLORS.blue;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = COLORS.textSecondary;
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTeam(team.id);
                    }}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: COLORS.textSecondary,
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = COLORS.textSecondary;
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedTeamId && selectedTeam ? (
          <>
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px 32px",
                borderBottom: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.bgPrimary,
              }}
            >
              <h1 style={{ color: COLORS.textPrimary, fontSize: "24px", fontWeight: "600", margin: 0 }}>
                {selectedTeam.name}
              </h1>
              <button
                onClick={() => setShowTaskModal(true)}
                style={{
                  backgroundColor: COLORS.purple,
                  border: "none",
                  color: COLORS.textPrimary,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 16px rgba(139, 92, 246, 0.3)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <Plus size={18} />
                Nova Tarefa
              </button>
            </div>

            {/* TABS */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                padding: "16px 32px",
                borderBottom: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.bgPrimary,
              }}
            >
              {["tasks", "chat", "members"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: activeTab === tab ? COLORS.purple : COLORS.textSecondary,
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    paddingBottom: "8px",
                    borderBottom: activeTab === tab ? `2px solid ${COLORS.purple}` : "none",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      (e.currentTarget as HTMLElement).style.color = COLORS.textPrimary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      (e.currentTarget as HTMLElement).style.color = COLORS.textSecondary;
                    }
                  }}
                >
                  {tab === "tasks" && "Tarefas"}
                  {tab === "chat" && <><MessageSquare size={16} /> Chat</>}
                  {tab === "members" && <><Users size={16} /> Membros</>}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
              {activeTab === "tasks" && (
                <>
                  {/* Filters */}
                  <div style={{ marginBottom: "24px", display: "flex", gap: "16px" }}>
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
                        placeholder="Buscar tarefas..."
                        value={taskSearchTerm}
                        onChange={(e) => setTaskSearchTerm(e.target.value)}
                        style={{
                          width: "100%",
                          backgroundColor: COLORS.bgCard,
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: "8px",
                          padding: "10px 12px 10px 40px",
                          color: COLORS.textPrimary,
                          fontSize: "14px",
                          outline: "none",
                          transition: "all 0.2s",
                        }}
                        onFocus={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.1)`;
                        }}
                        onBlur={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                          (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        }}
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      style={{
                        backgroundColor: COLORS.bgCard,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "8px",
                        padding: "10px 12px",
                        color: COLORS.textPrimary,
                        fontSize: "14px",
                        cursor: "pointer",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = COLORS.purple;
                      }}
                      onBlur={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = COLORS.border;
                      }}
                    >
                      <option value="all">Todos os Status</option>
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluído</option>
                    </select>
                  </div>

                  {/* Kanban Board */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                    {/* Pendente */}
                    <div
                      style={{
                        backgroundColor: COLORS.bgCard,
                        borderRadius: "12px",
                        border: `1px solid ${COLORS.border}`,
                        padding: "16px",
                        minHeight: "400px",
                      }}
                    >
                      <h3 style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS.yellow }} />
                        Pendente ({tasksByStatus.pending.length})
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {tasksByStatus.pending.map((task: any) => (
                          <TaskCard key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
                        ))}
                      </div>
                    </div>

                    {/* Em Andamento */}
                    <div
                      style={{
                        backgroundColor: COLORS.bgCard,
                        borderRadius: "12px",
                        border: `1px solid ${COLORS.border}`,
                        padding: "16px",
                        minHeight: "400px",
                      }}
                    >
                      <h3 style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS.blue }} />
                        Em Andamento ({tasksByStatus.in_progress.length})
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {tasksByStatus.in_progress.map((task: any) => (
                          <TaskCard key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
                        ))}
                      </div>
                    </div>

                    {/* Concluído */}
                    <div
                      style={{
                        backgroundColor: COLORS.bgCard,
                        borderRadius: "12px",
                        border: `1px solid ${COLORS.border}`,
                        padding: "16px",
                        minHeight: "400px",
                      }}
                    >
                      <h3 style={{ color: COLORS.textPrimary, fontSize: "14px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <CheckCircle2 size={14} style={{ color: COLORS.green }} />
                        Concluído ({tasksByStatus.completed.length})
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {tasksByStatus.completed.map((task: any) => (
                          <TaskCard key={task.id} task={task} onStatusChange={handleUpdateTaskStatus} onDelete={handleDeleteTask} />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "chat" && (
                <div style={{ color: COLORS.textSecondary, textAlign: "center", padding: "40px" }}>
                  Chat do time (em desenvolvimento)
                </div>
              )}

              {activeTab === "members" && (
                <div style={{ color: COLORS.textSecondary, textAlign: "center", padding: "40px" }}>
                  Membros do time (em desenvolvimento)
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.textSecondary,
              fontSize: "16px",
            }}
          >
            Selecione um time para começar
          </div>
        )}
      </div>

      {/* Team Modal */}
      {showTeamModal && (
        <Modal onClose={() => setShowTeamModal(false)}>
          <h2 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
            {editingTeamId ? "Editar Time" : "Novo Time"}
          </h2>
          <form onSubmit={handleSubmitTeam}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Nome do Time
              </label>
              <input
                type="text"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                style={{
                  width: "100%",
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: COLORS.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Descrição (opcional)
              </label>
              <textarea
                value={teamFormData.description}
                onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                style={{
                  width: "100%",
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: COLORS.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  minHeight: "80px",
                  resize: "none",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: COLORS.purple,
                border: "none",
                color: COLORS.textPrimary,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {editingTeamId ? "Atualizar" : "Criar"}
            </button>
          </form>
        </Modal>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <Modal onClose={() => setShowTaskModal(false)}>
          <h2 style={{ color: COLORS.textPrimary, fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
            Nova Tarefa
          </h2>
          <form onSubmit={handleSubmitTask}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Título
              </label>
              <input
                type="text"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                style={{
                  width: "100%",
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: COLORS.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Descrição (opcional)
              </label>
              <textarea
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                style={{
                  width: "100%",
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: COLORS.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  minHeight: "80px",
                  resize: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: COLORS.textSecondary, fontSize: "12px", display: "block", marginBottom: "6px" }}>
                Data de Vencimento (opcional)
              </label>
              <input
                type="date"
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                style={{
                  width: "100%",
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: COLORS.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: COLORS.purple,
                border: "none",
                color: COLORS.textPrimary,
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Criar Tarefa
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: any;
  onStatusChange: (taskId: number, status: string) => void;
  onDelete: (taskId: number) => void;
}) {
  return (
    <div
      style={{
        backgroundColor: COLORS.bgHover,
        borderRadius: "8px",
        padding: "12px",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
        <h4 style={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: "500", margin: 0, flex: 1 }}>
          {task.title}
        </h4>
        <button
          onClick={() => onDelete(task.id)}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: COLORS.textSecondary,
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = COLORS.textSecondary;
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      {task.description && (
        <p style={{ color: COLORS.textSecondary, fontSize: "12px", margin: "0 0 8px 0" }}>
          {task.description}
        </p>
      )}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {task.dueDate && (
          <span style={{ color: COLORS.textSecondary, fontSize: "11px", backgroundColor: COLORS.bgPrimary, padding: "2px 6px", borderRadius: "4px" }}>
            {new Date(task.dueDate).toLocaleDateString("pt-BR")}
          </span>
        )}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          style={{
            backgroundColor: COLORS.bgPrimary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "4px",
            padding: "4px 6px",
            color: COLORS.textSecondary,
            fontSize: "11px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="pending">Pendente</option>
          <option value="in_progress">Em Andamento</option>
          <option value="completed">Concluído</option>
        </select>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
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
          borderRadius: "12px",
          border: `1px solid ${COLORS.border}`,
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div />
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: COLORS.textSecondary,
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
