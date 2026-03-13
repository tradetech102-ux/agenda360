import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trpc } from '@/lib/trpc';

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState('geral');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const utils = trpc.useUtils();

  // Buscar dados reais do banco via tRPC
  const { data: tasks = [] } = trpc.tasks.list.useQuery();
  const { data: financialData = [] } = trpc.financial.transactions.list.useQuery();
  const { data: sales = [] } = trpc.sales.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  
  // Dados são buscados uma vez ao carregar a página

  // Calcular dados agregados a partir dos dados reais
  const calculateMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    
    const totalIncome = financialData
      .filter((f: any) => f.transactionType === 'income')
      .reduce((sum: number, f: any) => sum + (typeof f.amount === 'number' ? f.amount : parseFloat(f.amount)), 0);
    
    const totalExpenses = financialData
      .filter((f: any) => f.transactionType === 'expense')
      .reduce((sum: number, f: any) => sum + (typeof f.amount === 'number' ? f.amount : parseFloat(f.amount)), 0);
    
    const totalSales = sales.reduce((sum: number, s: any) => sum + (typeof s.totalPrice === 'number' ? s.totalPrice : parseFloat(s.totalPrice || 0)), 0);
    const totalClients = clients.length;

    return {
      totalTasks,
      completedTasks,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      totalSales,
      totalClients,
    };
  };

  const metrics = calculateMetrics();

  const tabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'vendas', label: 'Vendas' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'tarefas', label: 'Tarefas' },
  ];

  // Preparar dados para gráficos baseado em dados reais
  const prepareFinancialChart = () => {
    const monthlyData: { [key: string]: { entrada: number; saida: number } } = {};
    
    financialData.forEach((item: any) => {
      const date = new Date(item.transactionDate);
      const monthKey = date.toLocaleString('pt-BR', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { entrada: 0, saida: 0 };
      }
      
      if (item.transactionType === 'income') {
        monthlyData[monthKey].entrada += typeof item.amount === 'number' ? item.amount : parseFloat(item.amount);
      } else {
        monthlyData[monthKey].saida += typeof item.amount === 'number' ? item.amount : parseFloat(item.amount);
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const financialChartData = prepareFinancialChart();

  return (
    <div style={{ backgroundColor: '#0B0B0C' }} className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Relatórios</h1>
          <p className="text-gray-400">Análise completa do desempenho empresarial</p>
        </div>

        {/* Filtros de Período */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { value: 'today', label: 'Hoje' },
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'year', label: 'Ano' },
            { value: 'custom', label: 'Personalizado' },
          ].map((period) => (
            <Button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`${
                selectedPeriod === period.value
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              } border border-gray-700`}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Abas Minimalistas */}
        <div className="flex gap-8 mb-8 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'text-gray-100 border-b-2 border-gray-300'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div>
          {/* Aba Geral */}
          {selectedTab === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-300 text-sm font-medium">Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">R$ {metrics.totalIncome.toFixed(2)}</div>
                  <p className="text-gray-500 text-xs mt-1">Todas as entradas</p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-300 text-sm font-medium">Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">R$ {metrics.totalExpenses.toFixed(2)}</div>
                  <p className="text-gray-500 text-xs mt-1">Todas as saídas</p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-300 text-sm font-medium">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${metrics.profit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    R$ {metrics.profit.toFixed(2)}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Resultado final</p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-300 text-sm font-medium">Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500">
                    {metrics.completedTasks}/{metrics.totalTasks}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}% de conclusão
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Aba Financeiro */}
          {selectedTab === 'financeiro' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-300 text-sm font-medium">Total Entradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">R$ {metrics.totalIncome.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-300 text-sm font-medium">Total Saídas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">R$ {metrics.totalExpenses.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-300 text-sm font-medium">Lucro/Prejuízo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${metrics.profit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      R$ {(metrics.profit / 100).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {financialChartData.length > 0 ? (
                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader>
                    <CardTitle className="text-white text-base font-semibold">Fluxo de Caixa</CardTitle>
                    <CardDescription className="text-gray-500">Últimos meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={financialChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="month" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }} />
                        <Legend />
                        <Bar dataKey="entrada" fill="#10b981" name="Entradas" />
                        <Bar dataKey="saida" fill="#ef4444" name="Saídas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardContent className="pt-6">
                    <p className="text-gray-400 text-center">Nenhum dado financeiro registrado</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Aba Vendas */}
          {selectedTab === 'vendas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-300 text-sm font-medium">Total Vendido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-500">R$ {(metrics.totalSales / 100).toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-300 text-sm font-medium">Quantidade de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{sales.length}</div>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-300 text-sm font-medium">Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-500">
                      R$ {sales.length > 0 ? ((metrics.totalSales / sales.length) / 100).toFixed(2) : '0.00'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {sales.length > 0 ? (
                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardHeader>
                    <CardTitle className="text-white text-base font-semibold">Vendas Registradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-center">Total de {sales.length} vendas registradas</p>
                  </CardContent>
                </Card>
              ) : (
                <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                  <CardContent className="pt-6">
                    <p className="text-gray-400 text-center">Nenhuma venda registrada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Aba Clientes */}
          {selectedTab === 'clientes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader>
                  <CardTitle className="text-white text-base font-semibold">Clientes Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-500">{metrics.totalClients}</div>
                  <p className="text-gray-400 text-sm mt-2">Clientes cadastrados no sistema</p>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader>
                  <CardTitle className="text-white text-base font-semibold">Taxa de Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-500">100%</div>
                  <p className="text-gray-400 text-sm mt-2">Todos os clientes ativos</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Aba Tarefas */}
          {selectedTab === 'tarefas' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader>
                  <CardTitle className="text-white text-base font-semibold">Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-500">{metrics.completedTasks}</div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader>
                  <CardTitle className="text-white text-base font-semibold">Total de Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-500">{metrics.totalTasks}</div>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }} className="border">
                <CardHeader>
                  <CardTitle className="text-white text-base font-semibold">Taxa de Conclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-500">
                    {metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
