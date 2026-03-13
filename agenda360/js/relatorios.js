function gerarRelatorioGeral() {
  const vendas = JSON.parse(localStorage.getItem("vendas") || "[]");
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  
  let totalVendas = 0;
  vendas.forEach(v => totalVendas += parseFloat(v.valorTotal));

  const container = document.getElementById("relatorios");
  container.innerHTML = `
    <h1>Relatórios Gerais</h1>
    <div class="dashboard-cards">
      <div class="card">
        <h3>Total em Vendas</h3>
        <p>R$ ${totalVendas.toFixed(2)}</p>
      </div>
      <div class="card">
        <h3>Qtd. Vendas</h3>
        <p>${vendas.length}</p>
      </div>
      <div class="card">
        <h3>Total Clientes</h3>
        <p>${clientes.length}</p>
      </div>
      <div class="card">
        <h3>Total Produtos</h3>
        <p>${produtos.length}</p>
      </div>
    </div>
    
    <div class="charts-container">
      <canvas id="vendasChart"></canvas>
    </div>
  `;

  renderizarGraficoVendas(vendas);
}

function renderizarGraficoVendas(vendas) {
  const canvas = document.getElementById("vendasChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  // Agrupar vendas por data
  const vendasPorData = {};
  vendas.forEach(v => {
    vendasPorData[v.data] = (vendasPorData[v.data] || 0) + parseFloat(v.valorTotal);
  });

  const labels = Object.keys(vendasPorData).sort();
  const data = labels.map(l => vendasPorData[l]);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Vendas por Dia (R$)",
        data: data,
        borderColor: "#7a42f4",
        backgroundColor: "rgba(122, 66, 244, 0.2)",
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("relatorios")) {
    gerarRelatorioGeral();
  }
});
