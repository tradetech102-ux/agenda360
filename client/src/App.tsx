import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import Calendar from "./pages/Calendar";
import Teams from "./pages/Teams";
import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Tasks from "./pages/Tasks";
import Products from "./pages/Products";
import Financial from "./pages/Financial";
import Loans from "./pages/Loans";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CashBox from "./pages/CashBox";
import ModernLayout from "./components/ModernLayout";

function Router() {
  const [, setLocation] = useLocation();
  const handleClose = () => setLocation("/dashboard");
  
  return (
    <Switch>
      <Route path={"/"}>
        {() => (
          <ModernLayout>
            <Home />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/clientes"}>
        {() => (
          <ModernLayout>
            <Clients />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/calendario"}>
        {() => (
          <ModernLayout>
            <Calendar />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/times"}>
        {() => (
          <ModernLayout>
            <Teams />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/dashboard"}>
        {() => (
          <ModernLayout>
            <Home />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/fornecedores"}>
        {() => (
          <ModernLayout>
            <Suppliers onClose={handleClose} />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/tarefas"}>
        {() => (
          <ModernLayout>
            <Tasks onClose={handleClose} />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/produtos"}>
        {() => (
          <ModernLayout>
            <Products onClose={handleClose} />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/financeiro"}>
        {() => (
          <ModernLayout>
            <Financial onClose={handleClose} />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/caixa"}>
        {() => (
          <ModernLayout>
            <CashBox />
          </ModernLayout>
        )}
      </Route>
      <Route path={"\emprestimos"}>
        {() => (
          <ModernLayout>
            <Loans onClose={handleClose} />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/vendas"}>
        {() => (
          <ModernLayout>
            <Sales onClose={handleClose} />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/relatorios"}>
        {() => (
          <ModernLayout>
            <Reports />
          </ModernLayout>
        )}
      </Route>

      <Route path={"/configuracoes"}>
        {() => (
          <ModernLayout>
            <Settings />
          </ModernLayout>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
