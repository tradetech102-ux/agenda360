function saveFinanceiro() {
  const payment = document.getElementById("finance-payment").value;
  const bank = document.getElementById("finance-bank").value;
  const purpose = document.getElementById("finance-purpose").value;
  const type = document.getElementById("finance-type").value;
  const value = parseFloat(document.getElementById("finance-value").value);
  const date = document.getElementById("finance-date").value;
  const time = document.getElementById("finance-time").value;
  const account = document.getElementById("finance-account").value;

  if (isNaN(value) || !date || !time) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const lancamento = { payment, bank, purpose, type, value, date, time, account };
  let lancamentos = JSON.parse(localStorage.getItem("lancamentos") || "[]");
  lancamentos.push(lancamento);
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));

  alert("Lançamento salvo com sucesso!");
  closeModal("finance-modal");
  atualizarTabelaFinanceiro();
}

function atualizarTabelaFinanceiro() {
  const lancamentos = JSON.parse(localStorage.getItem("lancamentos") || "[]");
  const container = document.getElementById("financeiro");
  
  let tabela = document.getElementById("tabelaFinanceiro");
  if (!tabela) {
    tabela = document.createElement("table");
    tabela.id = "tabelaFinanceiro";
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>Data</th>
          <th>Tipo</th>
          <th>Finalidade</th>
          <th>Valor</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="financeiroBody"></tbody>
    `;
    container.appendChild(tabela);
  }

  const tbody = document.getElementById("financeiroBody");
  tbody.innerHTML = "";
  
  lancamentos.forEach((l, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${l.date} ${l.time}</td>
      <td style="color: ${l.type === "Entrada" ? "green" : "red"}">${l.type}</td>
      <td>${l.purpose}</td>
      <td>R$ ${parseFloat(l.value).toFixed(2)}</td>
      <td>
        <button class="delete-btn" onclick="excluirLancamento(${index})">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function excluirLancamento(index) {
  if (confirm("Deseja realmente excluir este lançamento?")) {
    let lancamentos = JSON.parse(localStorage.getItem("lancamentos") || "[]");
    lancamentos.splice(index, 1);
    localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
    atualizarTabelaFinanceiro();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("financeiro")) {
    const btnAdd = document.createElement("button");
    btnAdd.innerHTML = '<i class="fas fa-plus"></i> Novo Lançamento';
    btnAdd.onclick = () => openModal("finance-modal");
    document.getElementById("financeiro").prepend(btnAdd);
    atualizarTabelaFinanceiro();
  }
});

// Funções para Tabela Financeira da Empresa
function handleInput(input) {
  input.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (value / 100).toFixed(2).replace(".", ",");
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    e.target.value = value;
    updateCalculations();
    saveToLocalStorage();
  });
}

function parseValue(value) {
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, "").replace(",", "."));
}

function formatValue(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function updateCalculations() {
  const balanco = parseValue(document.querySelector('[data-key="balanco"]')?.value);
  const faturamento = parseValue(document.querySelector('[data-key="faturamento"]')?.value);
  const despesas = parseValue(document.querySelector('[data-key="despesas"]')?.value);
  const investimento = parseValue(document.querySelector('[data-key="investimento"]')?.value);
  const proLabore = parseValue(document.querySelector('[data-key="proLabore"]')?.value);
  const reinvestimento = parseValue(document.querySelector('[data-key="reinvestimento"]')?.value);
  const reservaEmergencia = parseValue(document.querySelector('[data-key="reservaEmergencia"]')?.value);

  const lucro = faturamento - despesas;
  const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;
  const pontoEquilibrio = despesas;
  const payback = lucro > 0 ? investimento / lucro : 0;
  const roi = investimento > 0 ? (lucro * 12 / investimento) * 100 : 0;
  const lucroRestante = lucro - proLabore - reinvestimento - reservaEmergencia;

  if (document.getElementById("lucro")) document.getElementById("lucro").textContent = formatValue(lucro);
  if (document.getElementById("margem")) document.getElementById("margem").textContent = margem.toFixed(2) + "%";
  if (document.getElementById("pontoEquilibrio")) document.getElementById("pontoEquilibrio").textContent = formatValue(pontoEquilibrio);
  if (document.getElementById("payback")) document.getElementById("payback").textContent = payback.toFixed(1) + " meses";
  if (document.getElementById("roi")) document.getElementById("roi").textContent = roi.toFixed(2) + "%";
  if (document.getElementById("lucro-display")) document.getElementById("lucro-display").textContent = formatValue(lucro);
  if (document.getElementById("lucroRestante")) document.getElementById("lucroRestante").textContent = formatValue(lucroRestante);
}

function saveToLocalStorage() {
  const data = {};
  document.querySelectorAll(".currency-input").forEach(input => {
    data[input.getAttribute("data-key")] = input.value;
  });
  localStorage.setItem("financeData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem("financeData") || "{}");
  Object.keys(data).forEach(key => {
    const input = document.querySelector(`[data-key="${key}"]`);
    if (input) input.value = data[key];
  });
}

let barChart, distributionChart;

function updateCharts() {
  const faturamento = parseValue(document.querySelector('[data-key="faturamento"]')?.value);
  const despesas = parseValue(document.querySelector('[data-key="despesas"]')?.value);
  const lucro = faturamento - despesas;

  const proLabore = parseValue(document.querySelector('[data-key="proLabore"]')?.value);
  const reinvestimento = parseValue(document.querySelector('[data-key="reinvestimento"]')?.value);
  const reservaEmergencia = parseValue(document.querySelector('[data-key="reservaEmergencia"]')?.value);
  const lucroRestante = lucro - proLabore - reinvestimento - reservaEmergencia;

  if (barChart) barChart.destroy();
  const ctxBar = document.getElementById("barChart")?.getContext("2d");
  if (ctxBar) {
    barChart = new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: ["Faturamento", "Despesas", "Lucro"],
        datasets: [{
          label: "Valores em R$",
          data: [faturamento, despesas, lucro],
          backgroundColor: ["#4caf50", "#f44336", "#2196f3"]
        }]
      },
      options: { responsive: true }
    });
  }

  if (distributionChart) distributionChart.destroy();
  const ctxDist = document.getElementById("distributionChart")?.getContext("2d");
  if (ctxDist) {
    distributionChart = new Chart(ctxDist, {
      type: "pie",
      data: {
        labels: ["Pró-labore", "Reinvestimento", "Reserva", "Restante"],
        datasets: [{
          data: [proLabore, reinvestimento, reservaEmergencia, Math.max(0, lucroRestante)],
          backgroundColor: ["#ff9800", "#9c27b0", "#00bcd4", "#8bc34a"]
        }]
      },
      options: { responsive: true }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tabela-financeira")) {
    loadFromLocalStorage();
    document.querySelectorAll("input.currency-input").forEach(input => {
      handleInput(input);
    });
    updateCalculations();
    updateCharts();
  }
});
