import React, { useState, useRef } from "react";
import { Bell, Settings, Menu, LayoutDashboard, Calendar, Users, Building2, CheckSquare, Package, DollarSign, CreditCard, Users2, ShoppingCart, BarChart3 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import CollapsibleSidebar from "./CollapsibleSidebar";

const COLORS = {
  bgPrimary: "#0b0b0b",
  bgSecondary: "#141414",
  bgCard: "#1a1a1a",
  border: "#2a2a2a",
  textPrimary: "#ffffff",
  textSecondary: "#a0a0a0",
  purple: "#7c3aed",
  purpleLight: "#a78bfa",
};

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Calendário", path: "/calendario" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: Building2, label: "Fornecedores", path: "/fornecedores" },
  { icon: CheckSquare, label: "Tarefas", path: "/tarefas" },
  { icon: Package, label: "Produtos", path: "/produtos" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: CreditCard, label: "Empréstimos", path: "/emprestimos" },
  { icon: Users2, label: "Times", path: "/times" },
  { icon: ShoppingCart, label: "Vendas", path: "/vendas" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
]

export default function ModernLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: COLORS.bgPrimary,
          color: COLORS.textPrimary,
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: COLORS.bgPrimary,
          color: COLORS.textPrimary,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ marginBottom: "20px" }}>Agenda 360°</h1>
          <button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            style={{
              padding: "12px 24px",
              backgroundColor: COLORS.purple,
              color: COLORS.textPrimary,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const currentMenuItem = MENU_ITEMS.find((item) => item.path === location);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: COLORS.bgPrimary,
        color: COLORS.textPrimary,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* SIDEBAR COLAPSÁVEL COM ÍCONES */}
      <CollapsibleSidebar />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            height: "60px",
            backgroundColor: COLORS.bgSecondary,
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => {
                const event = new CustomEvent('toggleSidebar');
                window.dispatchEvent(event);
              }}
              style={{
                background: "none",
                border: "none",
                color: COLORS.textSecondary,
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  COLORS.textPrimary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  COLORS.textSecondary;
              }}
              title="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <h1 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
              {currentMenuItem?.label || "Agenda 360°"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              style={{
                background: "none",
                border: "none",
                color: COLORS.textSecondary,
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  COLORS.textPrimary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  COLORS.textSecondary;
              }}
            >
              <Bell size={16} />
            </button>
            <button
              onClick={() => setLocation("/configuracoes")}
              style={{
                background: "none",
                border: "none",
                color: COLORS.textSecondary,
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  COLORS.textPrimary;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  COLORS.textSecondary;
              }}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
