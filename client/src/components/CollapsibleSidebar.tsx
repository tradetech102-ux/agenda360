import React, { useState, useRef, useEffect } from "react";
import { Bell, LogOut, Settings, LayoutDashboard, Calendar, Users, Building2, CheckSquare, Package, DollarSign, CreditCard, Users2, ShoppingCart, BarChart3 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

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
];

export default function CollapsibleSidebar() {
  const { logout, user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentMenuItem = MENU_ITEMS.find((item) => item.path === location);;

  // Fechar sidebar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isExpanded]);

  const handleMenuItemClick = (path: string) => {
    setLocation(path);
    // Ocultar sidebar completamente após selecionar
    setIsExpanded(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleToggleSidebar() {
      setIsExpanded(prev => !prev);
    }

    window.addEventListener("toggleSidebar", handleToggleSidebar);
    return () => {
      window.removeEventListener("toggleSidebar", handleToggleSidebar);
    };
  }, []);

  return (
    <div
      ref={sidebarRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        zIndex: isExpanded ? 1000 : -1,
      }}
    >
      {/* SIDEBAR COLAPSÁVEL */}
      <div
        style={{
          width: isExpanded ? "280px" : "0px",
          backgroundColor: COLORS.bgSecondary,
          borderRight: isExpanded ? `1px solid ${COLORS.border}` : "none",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* LOGO / TOGGLE */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: "16px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: isExpanded ? "space-between" : "center",
            gap: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgCard;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          <img
            src="/logo-agenda360.png"
            alt="Agenda 360°"
            style={{
              height: "40px",
              flexShrink: 0,
            }}
          />
          {isExpanded && (
            <span style={{ fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap" }}>
              {user?.name || "Usuário"}
            </span>
          )}
        </div>

        {/* MENU ITEMS */}
        <nav
          style={{
            flex: 1,
            overflow: "auto",
            padding: isExpanded ? "12px" : "4px",
            display: "flex",
            flexDirection: "column",
            gap: isExpanded ? "4px" : "2px",
          }}
        >
          {MENU_ITEMS.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleMenuItemClick(item.path)}
                title={!isExpanded ? item.label : ""}
                style={{
                  width: "100%",
                  padding: isExpanded ? "10px 12px" : "8px",
                  backgroundColor: isActive ? COLORS.purple : "transparent",
                  color: isActive ? COLORS.textPrimary : COLORS.textSecondary,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isExpanded ? "flex-start" : "center",
                  gap: "10px",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  minHeight: "40px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgCard;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                {React.createElement(item.icon, {
                  size: 20,
                  color: isActive ? COLORS.purple : COLORS.textSecondary,
                })}
                {isExpanded && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* USER PROFILE / LOGOUT */}
        <div
          style={{
            padding: isExpanded ? "12px" : "8px",
            borderTop: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <button
            onClick={logout}
            title="Sair"
            style={{
              width: "100%",
              padding: isExpanded ? "10px 12px" : "10px",
              backgroundColor: "transparent",
              color: COLORS.textSecondary,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: isExpanded ? "flex-start" : "center",
              gap: "12px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              minHeight: "44px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.bgCard;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            <LogOut size={20} />
            {isExpanded && <span style={{ whiteSpace: "nowrap" }}>Sair</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
