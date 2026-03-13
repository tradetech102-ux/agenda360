import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { trpc } from "../lib/trpc";

const COLORS = {
  bgPrimary: "#0b0b0b",
  bgCard: "#141414",
  border: "#2a2a2a",
  hover: "#1f1f1f",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  purple: "#7c3aed",
  rocha: "#6C2BD9",
};

interface CalendarEvent {
  id: number;
  title: string;
  time?: string;
  type: "task" | "meeting" | "commitment";
  dueDate?: Date;
}

interface DayEvents {
  [key: number]: CalendarEvent[];
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventClientId, setNewEventClientId] = useState<number | null>(null);
  const [newEventActionType, setNewEventActionType] = useState<"reuniao" | "visita" | "trabalho">("reuniao");
  const [showSupplierEvents, setShowSupplierEvents] = useState(true);
  const [showManualTasks, setShowManualTasks] = useState(true);
  const [showLoanInstallments, setShowLoanInstallments] = useState(true);

  // Fetch clients for selection
  const { data: clients = [] } = trpc.clients.list.useQuery();

  // Fetch tasks from database
  const { data: tasks = [] } = trpc.tasks.list.useQuery();
  const createTaskMutation = trpc.tasks.create.useMutation();
  
  // Fetch loan installments for calendar
  const { data: installments = [] } = trpc.loans.getInstallmentsForCalendar.useQuery();

  // Convert tasks to calendar events
  const [dayEvents, setDayEvents] = useState<DayEvents>({});

  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const currentMonth = useMemo(() => currentDate.getMonth(), [currentDate]);

  useEffect(() => {
    // Convert tasks to day events
    const events: DayEvents = {};
    
    tasks.forEach((task: any) => {
      const dueDate = new Date(task.dueDate);
      const dayKey = dueDate.getDate();
      const month = dueDate.getMonth();
      const year = dueDate.getFullYear();
      
      // Only show tasks from current month and year
      if (month === currentMonth && year === currentYear) {
        // Check if this is a supplier payment event (title starts with "Pagamento -")
        const isSupplierEvent = task.title.startsWith("Pagamento -");
        
        // Apply filters
        if (isSupplierEvent && !showSupplierEvents) return;
        if (!isSupplierEvent && !showManualTasks) return;
        
        if (!events[dayKey]) {
          events[dayKey] = [];
        }
        
        events[dayKey].push({
          id: task.id,
          title: task.title,
          type: isSupplierEvent ? "commitment" : "task",
          dueDate: dueDate,
        });
      }
    });
    
    // Add loan installments to calendar
    if (showLoanInstallments) {
      installments.forEach((installment: any) => {
        const dueDate = new Date(installment.dueDate);
        const dayKey = dueDate.getDate();
        const month = dueDate.getMonth();
        const year = dueDate.getFullYear();
        
        // Only show installments from current month and year
        if (month === currentMonth && year === currentYear) {
          if (!events[dayKey]) {
            events[dayKey] = [];
          }
          
          events[dayKey].push({
            id: installment.id,
            title: `Parcela ${installment.installmentNumber} - ${installment.clientName} (R$ ${parseFloat(installment.amount).toFixed(2)})`,
            type: "commitment",
            dueDate: dueDate,
          });
        }
      });
    }
    
    setDayEvents(events);
  }, [tasks, installments, currentMonth, currentYear, showSupplierEvents, showManualTasks, showLoanInstallments]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDay(date);
      setShowModal(true);
      setShowNewEventForm(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!selectedDay || !newEventTitle) return;

    try {
      // Create task in database
      await createTaskMutation.mutateAsync({
        title: newEventTitle,
        description: newEventDescription,
        dueDate: selectedDay,
        priority: "high",
        clientId: newEventClientId || undefined,
        actionType: newEventActionType,
      });

      // Reset form
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventClientId(null);
      setNewEventActionType("reuniao");
      setShowNewEventForm(false);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDay(null);
    setShowNewEventForm(false);
    setNewEventTitle("");
    setNewEventDescription("");
    setNewEventClientId(null);
    setNewEventActionType("reuniao");
  };

  return (
    <div style={{ backgroundColor: COLORS.bgPrimary, color: COLORS.textPrimary }} className="min-h-screen p-2">
      <div className="w-full h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4 px-6 pt-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={handlePrevMonth}
              style={{ borderColor: COLORS.rocha, backgroundColor: COLORS.rocha, width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0", borderRadius: "8px" }}
              className="border hover:opacity-80 transition flex-shrink-0"
            >
              <ChevronLeft size={17} style={{ color: COLORS.textPrimary }} />
            </button>
            <span className="text-sm sm:text-lg font-semibold capitalize min-w-32 sm:min-w-48 text-center">{monthName}</span>
            <button
              onClick={handleNextMonth}
              style={{ borderColor: COLORS.rocha, backgroundColor: COLORS.rocha, width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0", borderRadius: "8px" }}
              className="border hover:opacity-80 transition flex-shrink-0"
            >
              <ChevronRight size={17} style={{ color: COLORS.textPrimary }} />
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 justify-center flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showManualTasks}
                onChange={(e) => setShowManualTasks(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ color: COLORS.textSecondary }} className="text-sm">Tarefas Manuais</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSupplierEvents}
                onChange={(e) => setShowSupplierEvents(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ color: COLORS.textSecondary }} className="text-sm">Pagamentos de Fornecedores</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLoanInstallments}
                onChange={(e) => setShowLoanInstallments(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span style={{ color: COLORS.textSecondary }} className="text-sm">Parcelas de Empréstimos</span>
            </label>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }} className="border rounded-lg p-3 sm:p-6 flex-1 flex flex-col mx-2 sm:mx-6 mb-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2 mb-3 sm:mb-3">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
              <div key={day} className="text-center font-semibold text-sm sm:text-base" style={{ color: COLORS.textSecondary }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2 flex-1">
            {days.map((date, index) => {
              const dayKey = date ? date.getDate() : null;
              const events = dayKey ? dayEvents[dayKey] || [] : [];
              const isToday = date && date.getTime() === today.getTime();
              const isCurrentMonth = date && date.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(date)}
                  style={{
                    backgroundColor: isToday ? COLORS.purple : COLORS.bgPrimary,
                    borderColor: COLORS.border,
                    minHeight: "120px",
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: "8px",
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isToday) {
                      e.currentTarget.style.backgroundColor = COLORS.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isToday) {
                      e.currentTarget.style.backgroundColor = COLORS.bgPrimary;
                    }
                  }}
                >
                  <div style={{ color: isCurrentMonth ? COLORS.textPrimary : COLORS.textSecondary, fontWeight: "600", fontSize: "12px", marginBottom: "4px" }}>
                    {date?.getDate()}
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {events.map((event, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: event.type === "task" ? "#4f46e5" : "#ef4444",
                          color: COLORS.textPrimary,
                          fontSize: "10px",
                          padding: "2px 4px",
                          borderRadius: "3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedDay && (
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
              zIndex: 50,
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                backgroundColor: COLORS.bgCard,
                borderColor: COLORS.border,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "500px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
                  {selectedDay.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </h2>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.textSecondary,
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Events List */}
              {selectedDay && dayEvents[selectedDay.getDate()] && dayEvents[selectedDay.getDate()].length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: COLORS.textSecondary }}>
                    Eventos do dia
                  </h3>
                  {dayEvents[selectedDay.getDate()].map((event, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: COLORS.bgPrimary,
                        borderColor: COLORS.border,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: "500" }}>{event.title}</div>
                      <div style={{ fontSize: "12px", color: COLORS.textSecondary, marginTop: "4px" }}>
                        Tipo: {event.type === "task" ? "Tarefa" : "Compromisso"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Event Form */}
              {!showNewEventForm && (
                <button
                  onClick={() => setShowNewEventForm(true)}
                  style={{
                    width: "100%",
                    backgroundColor: COLORS.rocha,
                    color: COLORS.textPrimary,
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Adicionar Evento
                </button>
              )}

              {showNewEventForm && (
                <div>
                  <input
                    type="text"
                    placeholder="Título do evento"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      borderColor: COLORS.border,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: COLORS.textPrimary,
                      marginBottom: "12px",
                      boxSizing: "border-box",
                    }}
                  />
                  <textarea
                    placeholder="Descrição"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      borderColor: COLORS.border,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: COLORS.textPrimary,
                      marginBottom: "12px",
                      boxSizing: "border-box",
                      minHeight: "80px",
                    }}
                  />
                  <select
                    value={newEventActionType}
                    onChange={(e) => setNewEventActionType(e.target.value as any)}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      borderColor: COLORS.border,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: COLORS.textPrimary,
                      marginBottom: "12px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="reuniao">Reunião</option>
                    <option value="visita">Visita</option>
                    <option value="trabalho">Trabalho</option>
                  </select>
                  <select
                    value={newEventClientId || ""}
                    onChange={(e) => setNewEventClientId(e.target.value ? parseInt(e.target.value) : null)}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.bgPrimary,
                      borderColor: COLORS.border,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: COLORS.textPrimary,
                      marginBottom: "12px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Sem cliente</option>
                    {clients.map((client: any) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleSaveEvent}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.rocha,
                        color: COLORS.textPrimary,
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setShowNewEventForm(false)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.bgPrimary,
                        color: COLORS.textPrimary,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "8px",
                        padding: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
