import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import CategorySettings from "../components/CategorySettings";
import {
  User,
  Palette,
  Globe,
  Bell,
  DollarSign,
  Lock,
  Zap,
  HardDrive,
  AlertTriangle,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";

// Cores do design
const COLORS = {
  bg: "#0B0B0C",
  bgCard: "#121212",
  hover: "#1A1A1A",
  blue: "#2563EB",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#F59E0B",
  textPrimary: "#E5E7EB",
  textSecondary: "#9CA3AF",
};

type SettingSection = "profile" | "appearance" | "language" | "notifications" | "financial" | "categories" | "security" | "integrations" | "backup" | "danger";

const Settings = () => {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<SettingSection>("profile");
  const [profileData, setProfileData] = useState({
    name: "Trade Tech",
    email: "tradetech102@gmail.com",
    avatar: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [confirmDelete, setConfirmDelete] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState<"delete" | "account" | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAllDataMutation = trpc.account.deleteAllData.useMutation();
  const deleteAccountMutation = trpc.account.deleteAccount.useMutation();

  const menuItems = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "language", label: "Idioma", icon: Globe },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "financial", label: "Financeiro", icon: DollarSign },
    { id: "categories", label: "Categorias", icon: DollarSign },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "integrations", label: "Integrações", icon: Zap },
    { id: "backup", label: "Backup & Exportação", icon: HardDrive },
  ];

  const dangerItems = [
    { id: "danger", label: "Zona de Risco", icon: AlertTriangle },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.textPrimary }}>
                Perfil
              </h2>
              
              {/* Avatar Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>
                  Foto do Perfil
                </label>
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors"
                  style={{
                    backgroundColor: COLORS.bgCard,
                    borderColor: COLORS.blue,
                  }}
                >
                  <Upload size={32} style={{ color: COLORS.blue }} />
                </div>
              </div>

              {/* Nome */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                  Nome
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: COLORS.bgCard,
                    borderColor: COLORS.hover,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: COLORS.bgCard,
                    borderColor: COLORS.hover,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Botão Salvar */}
              <button
                className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.blue, color: "white" }}
              >
                Salvar alterações
              </button>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Aparência
            </h2>

            {/* Tema */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: COLORS.bgCard }}
            >
              <label className="flex items-center justify-between cursor-pointer">
                <span style={{ color: COLORS.textPrimary }}>Modo Escuro</span>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </label>
            </div>

            {/* Cor Principal */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: COLORS.textSecondary }}>
                Cor Principal
              </label>
              <div className="flex gap-3">
                {["#2563EB", "#3B82F6", "#1E40AF"].map((color) => (
                  <div
                    key={color}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: COLORS.blue,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Idioma
            </h2>

            <div className="space-y-3">
              {["Português (Brasil)", "English", "Español"].map((lang) => (
                <label
                  key={lang}
                  className="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: COLORS.bgCard,
                  }}
                >
                  <input
                    type="radio"
                    name="language"
                    defaultChecked={lang === "Português (Brasil)"}
                    className="w-4 h-4"
                  />
                  <span className="ml-3" style={{ color: COLORS.textPrimary }}>
                    {lang}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Notificações
            </h2>

            <div className="space-y-3">
              {[
                { label: "Ativar notificações", id: "general" },
                { label: "Lembretes de tarefas", id: "tasks" },
                { label: "Vencimentos financeiros", id: "financial" },
                { label: "Alertas importantes", id: "alerts" },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: COLORS.bgCard }}
                >
                  <span style={{ color: COLORS.textPrimary }}>{item.label}</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        );

      case "financial":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Financeiro
            </h2>

            {/* Moeda */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                Moeda
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderColor: COLORS.hover,
                  color: COLORS.textPrimary,
                }}
              >
                <option>BRL (R$)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>

            {/* Formato de Data */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                Formato de Data
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderColor: COLORS.hover,
                  color: COLORS.textPrimary,
                }}
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>

            {/* Conta Padrão */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                Conta Padrão
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderColor: COLORS.hover,
                  color: COLORS.textPrimary,
                }}
              >
                <option>Conta B1</option>
                <option>Conta B2</option>
                <option>Conta B3</option>
              </select>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Segurança
            </h2>

            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: COLORS.bgCard }}
            >
              <h3 className="font-medium mb-4" style={{ color: COLORS.textPrimary }}>
                Alterar Senha
              </h3>

              {/* Senha Atual */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border pr-10"
                    style={{
                      backgroundColor: COLORS.bgCard,
                      borderColor: COLORS.hover,
                      color: COLORS.textPrimary,
                    }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff size={18} style={{ color: COLORS.textSecondary }} />
                    ) : (
                      <Eye size={18} style={{ color: COLORS.textSecondary }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: COLORS.bgCard,
                    borderColor: COLORS.hover,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              {/* Confirmar Senha */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.textSecondary }}>
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: COLORS.bgCard,
                    borderColor: COLORS.hover,
                    color: COLORS.textPrimary,
                  }}
                />
              </div>

              <button
                className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.blue, color: "white" }}
              >
                Atualizar Senha
              </button>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Integrações
            </h2>

            <div className="space-y-3">
              {[
                { name: "Google Calendar", status: "Conectar", color: COLORS.blue },
                { name: "WhatsApp", status: "Em breve", color: COLORS.textSecondary },
                { name: "Email", status: "Ativo", color: COLORS.green },
              ].map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: COLORS.bgCard }}
                >
                  <span style={{ color: COLORS.textPrimary }}>{integration.name}</span>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                    style={{
                      backgroundColor: integration.color,
                      color: "white",
                      opacity: integration.status === "Em breve" ? 0.5 : 1,
                    }}
                    disabled={integration.status === "Em breve"}
                  >
                    {integration.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "categories":
        return <CategorySettings />;

      case "backup":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Backup & Exportação
            </h2>

            <p style={{ color: COLORS.textSecondary }}>
              Faça backup dos seus dados ou exporte em diferentes formatos.
            </p>

            <div className="space-y-3">
              <button
                className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.blue, color: "white" }}
              >
                Fazer Backup (JSON)
              </button>
              <button
                className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.blue, color: "white" }}
              >
                Exportar CSV
              </button>
            </div>
          </div>
        );

      case "danger":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.red }}>
              Zona de Risco
            </h2>

            {/* Apagar Dados */}
            <div
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: COLORS.bgCard,
                borderColor: COLORS.red,
              }}
            >
              <h3 className="font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                Apagar Todos os Dados
              </h3>
              <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
                Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
              </p>
              <button
                onClick={() => setShowDeleteModal("delete")}
                className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.red, color: "white" }}
              >
                Apagar Dados
              </button>
            </div>

            {/* Excluir Conta */}
            <div
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: COLORS.bgCard,
                borderColor: COLORS.red,
              }}
            >
              <h3 className="font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                Excluir Conta
              </h3>
              <p className="text-sm mb-4" style={{ color: COLORS.textSecondary }}>
                Sua conta será permanentemente deletada. Esta ação não pode ser revertida.
              </p>
              <button
                onClick={() => setShowDeleteModal("account")}
                className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.red, color: "white" }}
              >
                Excluir Conta
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleDeleteAllData = async () => {
    if (confirmationText !== "APAGAR TODOS OS DADOS") {
      alert("Confirmacao incorreta");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAllDataMutation.mutateAsync({ confirmation: confirmationText });
      alert("Todos os dados foram apagados com sucesso");
      setShowDeleteModal(null);
      setConfirmationText("");
    } catch (error) {
      alert("Erro ao apagar dados: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== "EXCLUIR MINHA CONTA") {
      alert("Confirmacao incorreta");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccountMutation.mutateAsync({ confirmation: confirmationText });
      alert("Conta deletada com sucesso");
      navigate("/");
    } catch (error) {
      alert("Erro ao deletar conta: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Sidebar */}
      <div
        className="w-64 border-r overflow-y-auto"
        style={{
          backgroundColor: COLORS.bg,
          borderColor: COLORS.hover,
        }}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold mb-8" style={{ color: COLORS.textPrimary }}>
            Configurações
          </h1>

          {/* Menu Items */}
          <div className="space-y-1 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === (item.id as SettingSection);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingSection)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative"
                  style={{
                    backgroundColor: isActive ? COLORS.hover : "transparent",
                    color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-lg"
                      style={{ backgroundColor: COLORS.blue }}
                    />
                  )}
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div
            className="h-px my-6"
            style={{ backgroundColor: COLORS.hover }}
          />

          {/* Danger Items */}
          <div className="space-y-1">
            {dangerItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === (item.id as SettingSection);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingSection)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative"
                  style={{
                    backgroundColor: isActive ? COLORS.hover : "transparent",
                    color: isActive ? COLORS.red : COLORS.red,
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-lg"
                      style={{ backgroundColor: COLORS.blue }}
                    />
                  )}
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: COLORS.bg }}
      >
        {/* Header com botão de voltar */}
        <div
          className="flex items-center gap-4 p-6 border-b sticky top-0"
          style={{
            backgroundColor: COLORS.bg,
            borderColor: COLORS.hover,
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{
              backgroundColor: COLORS.hover,
              color: COLORS.textPrimary,
            }}
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
        </div>

        <div className="p-8 max-w-4xl">
          {renderContent()}
        </div>
      </div>

      {/* Modal de Confirmacao */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(null)}
        >
          <div
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.red }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.red }}>
              {showDeleteModal === "delete" ? "Apagar Todos os Dados" : "Excluir Conta"}
            </h3>
            <p className="mb-4" style={{ color: COLORS.textSecondary }}>
              {showDeleteModal === "delete"
                ? "Digite 'APAGAR TODOS OS DADOS' para confirmar"
                : "Digite 'EXCLUIR MINHA CONTA' para confirmar"}
            </p>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Digite a confirmacao"
              className="w-full px-4 py-2 rounded-lg border mb-4"
              style={{
                backgroundColor: COLORS.bg,
                borderColor: COLORS.hover,
                color: COLORS.textPrimary,
              }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{ backgroundColor: COLORS.hover, color: COLORS.textPrimary }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={showDeleteModal === "delete" ? handleDeleteAllData : handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: COLORS.red, color: "white" }}
              >
                {isDeleting ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
