import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExportReportButtonProps {
  teamId?: number;
  startDate?: Date;
  endDate?: Date;
}

export function ExportReportButton({
  teamId,
  startDate,
  endDate,
}: ExportReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: reportData } = trpc.reports.getReportData.useQuery({
    teamId,
    startDate,
    endDate,
  });

  const handleExport = async () => {
    if (!reportData) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    setIsLoading(true);
    try {
      // Criar HTML para o PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Produtividade</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #8b5cf6;
              border-bottom: 2px solid #8b5cf6;
              padding-bottom: 10px;
            }
            h2 {
              color: #6d28d9;
              margin-top: 20px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .kpi-card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              background: #f9fafb;
            }
            .kpi-label {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .kpi-value {
              font-size: 24px;
              font-weight: bold;
              color: #8b5cf6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
            }
            th {
              background: #f3f4f6;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>📊 Relatório de Produtividade</h1>
          <p>Gerado em: ${new Date().toLocaleDateString("pt-BR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>

          <div class="section">
            <h2>📈 Resumo Executivo</h2>
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-label">Total de Tarefas</div>
                <div class="kpi-value">${reportData.stats.total}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Concluídas</div>
                <div class="kpi-value" style="color: #10b981;">${reportData.stats.completed}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Em Andamento</div>
                <div class="kpi-value" style="color: #3b82f6;">${reportData.stats.inProgress}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Pendentes</div>
                <div class="kpi-value" style="color: #f59e0b;">${reportData.stats.pending}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>💰 Resumo Financeiro</h2>
            <table>
              <tr>
                <th>Categoria</th>
                <th>Valor</th>
              </tr>
              <tr>
                <td>Receitas</td>
                <td style="color: #10b981; font-weight: bold;">R$ ${reportData.financialSummary.income.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Despesas</td>
                <td style="color: #ef4444; font-weight: bold;">R$ ${reportData.financialSummary.expense.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Saldo Líquido</strong></td>
                <td style="color: #8b5cf6; font-weight: bold;">R$ ${reportData.financialSummary.balance.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${
            reportData.memberProductivity.length > 0
              ? `
            <div class="section">
              <h2>👥 Produtividade por Membro</h2>
              <table>
                <tr>
                  <th>Membro</th>
                  <th>Concluídas</th>
                  <th>Em Andamento</th>
                  <th>Pendentes</th>
                </tr>
                ${reportData.memberProductivity
                  .map(
                    (member) => `
                  <tr>
                    <td>Membro ${member.userId}</td>
                    <td>${member.completed}</td>
                    <td>${member.inProgress}</td>
                    <td>${member.pending}</td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
            </div>
          `
              : ""
          }

          <div class="footer">
            <p>Este relatório foi gerado automaticamente pelo sistema Agenda 360°</p>
          </div>
        </body>
        </html>
      `;

      // Usar manus-md-to-pdf para converter HTML para PDF
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading || !reportData}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Exportar PDF
    </Button>
  );
}
