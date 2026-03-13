function saveVenda() {
  const produtoId = document.getElementById("venda-produto").value;
  const clienteId = document.getElementById("venda-cliente").value;
  const quantidade = parseInt(document.getElementById("venda-quantidade").value);
  const data = document.getElementById("venda-data").value;

  if (!produtoId || !quantidade || !data) {
    alert("Produto, Quantidade e Data são obrigatórios!");
    return;
  }

  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  
  const produto = produtos[produtoId];
  const cliente = clienteId !== "" ? clientes[clienteId].nome : "Consumidor Final";
  
  const valorTotal = parseFloat(produto.preco) * quantidade;

  const venda = {
    produto: produto.nome,
    cliente: cliente,
    quantidade: quantidade,
    valorTotal: valorTotal,
    data: data
  };

  let vendas = JSON.parse(localStorage.getItem("vendas") || "[]");
  vendas.push(venda);
  localStorage.setItem("vendas", JSON.stringify(vendas));

  // Atualiza estoque do produto
  produto.estoque = parseInt(produto.estoque) - quantidade;
  localStorage.setItem("produtos", JSON.stringify(produtos));

  limparFormularioVenda();
  atualizarTabelaVendas();
  carregarSelectsVenda(); // Recarrega para atualizar estoque no select
  alert("Venda registrada com sucesso!");
}

function limparFormularioVenda() {
  document.getElementById("venda-produto").value = "";
  document.getElementById("venda-cliente").value = "";
  document.getElementById("venda-quantidade").value = "";
  document.getElementById("venda-data").value = "";
}

function atualizarTabelaVendas() {
  const vendas = JSON.parse(localStorage.getItem("vendas") || "[]");
  const container = document.getElementById("vendas");
  
  let tabela = document.getElementById("tabelaVendas");
  if (!tabela) {
    tabela = document.createElement("table");
    tabela.id = "tabelaVendas";
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>Data</th>
          <th>Produto</th>
          <th>Cliente</th>
          <th>Qtd</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody id="vendasBody"></tbody>
    `;
    container.appendChild(tabela);
  }

  const tbody = document.getElementById("vendasBody");
  tbody.innerHTML = "";
  
  vendas.forEach((v) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${v.data}</td>
      <td>${v.produto}</td>
      <td>${v.cliente}</td>
      <td>${v.quantidade}</td>
      <td>R$ ${parseFloat(v.valorTotal).toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
}

function carregarSelectsVenda() {
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  
  const selectProduto = document.getElementById("venda-produto");
  const selectCliente = document.getElementById("venda-cliente");
  
  if (!selectProduto || !selectCliente) return;

  selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
  produtos.forEach((p, index) => {
    if (parseInt(p.estoque) > 0) {
      selectProduto.innerHTML += `<option value="${index}">${p.nome} (Estoque: ${p.estoque})</option>`;
    }
  });

  selectCliente.innerHTML = '<option value="">Consumidor Final</option>';
  clientes.forEach((c, index) => {
    selectCliente.innerHTML += `<option value="${index}">${c.nome}</option>`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("vendas")) {
    carregarSelectsVenda();
    atualizarTabelaVendas();
  }
});
