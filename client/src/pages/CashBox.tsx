import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, History } from "lucide-react";

export default function CashBox() {
  const [showHistory, setShowHistory] = useState(false);
  
  const { data: cashBoxData, isLoading: isLoadingBalance } = trpc.financial.cashBox.getBalance.useQuery();
  const { data: historyData, isLoading: isLoadingHistory } = trpc.financial.cashBox.getHistory.useQuery();

  const balance = cashBoxData?.balance ? parseFloat(String(cashBoxData.balance)) : 0;
  
  // Calculate total income and expenses from cash transactions
  const cashStats = historyData?.reduce((acc, tx: any) => {
    const amount = parseFloat(tx.amount) || 0;
    if (tx.transactionType === 'income') {
      acc.income += amount;
    } else {
      acc.expenses += amount;
    }
    return acc;
  }, { income: 0, expenses: 0 }) || { income: 0, expenses: 0 };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Caixa (Dinheiro)</h1>
          <p className="text-muted-foreground mt-1">Controle de dinheiro em espécie</p>
        </div>
        <DollarSign className="w-12 h-12 text-green-600" />
      </div>

      {/* Main Balance Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">Saldo Atual</span>
            {isLoadingBalance && <div className="animate-pulse h-4 w-24 bg-gray-300 rounded" />}
          </div>
          <div className="text-5xl font-bold text-green-700">
            {!isLoadingBalance ? formatCurrency(balance) : "Carregando..."}
          </div>
          <div className="text-sm text-muted-foreground">
            Última atualização: {cashBoxData?.lastUpdated ? formatDate(cashBoxData.lastUpdated) : "Nunca"}
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Entradas</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {isLoadingHistory ? "Carregando..." : formatCurrency(cashStats.income)}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        {/* Expenses Card */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Saídas</p>
              <p className="text-2xl font-bold text-red-700 mt-2">
                {isLoadingHistory ? "Carregando..." : formatCurrency(cashStats.expenses)}
              </p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* History Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Histórico de Transações</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Ocultar" : "Mostrar"}
          </Button>
        </div>

        {showHistory && (
          <div className="space-y-3">
            {isLoadingHistory ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando transações...
              </div>
            ) : historyData && historyData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Descrição</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Tipo</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((tx: any, idx: number) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(tx.transactionDate)}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {tx.description || "Transação em dinheiro"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.transactionType === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.transactionType === 'income' ? 'Entrada' : 'Saída'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          tx.transactionType === 'income'
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          {tx.transactionType === 'income' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação em dinheiro registrada
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Dica:</strong> O saldo de dinheiro é atualizado automaticamente quando você cria uma venda com pagamento em dinheiro (CASH) no módulo de Vendas.
        </p>
      </Card>
    </div>
  );
}
