let editProdutoIndex = -1;

function saveProduto() {
  const nome = document.querySelector("#produtos input:nth-of-type(1)").value;
  const preco = document.querySelector("#produtos input:nth-of-type(2)").value;
  const codigoBarras = document.querySelector("#produtos input:nth-of-type(3)").value;
  const categoria = document.querySelector("#produtos input:nth-of-type(4)").value;
  const estoque = document.querySelector("#produtos input:nth-of-type(5)").value;

  if (!nome) {
    alert("O campo Nome é obrigatório!");
    return;
  }

  const produto = { nome, preco, codigoBarras, categoria, estoque };
  let produtos = JSON.parse(localStorage.getItem("produtos") || "[]");

  if (editProdutoIndex === -1) {
    produtos.push(produto);
  } else {
    produtos[editProdutoIndex] = produto;
    editProdutoIndex = -1;
    document.querySelector("#produtos button").textContent = "Salvar Produto";
  }

  localStorage.setItem("produtos", JSON.stringify(produtos));
  limparFormularioProduto();
  atualizarTabelaProdutos();
  alert("Produto salvo com sucesso!");
}

function limparFormularioProduto() {
  document.querySelectorAll("#produtos input").forEach(input => input.value = "");
}

function atualizarTabelaProdutos() {
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
  const container = document.getElementById("produtos");
  
  // Remove tabela anterior se existir
  const tabelaAntiga = document.getElementById("tabelaProdutos");
  if (tabelaAntiga) tabelaAntiga.remove();

  if (produtos.length === 0) return;

  const tabela = document.createElement("table");
  tabela.id = "tabelaProdutos";
  tabela.innerHTML = `
    <thead>
      <tr>
        <th>Nome</th>
        <th>Preço</th>
        <th>Estoque</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody id="produtosBody"></tbody>
  `;

  const tbody = tabela.querySelector("tbody");
  produtos.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.nome}</td>
      <td>R$ ${parseFloat(p.preco || 0).toFixed(2)}</td>
      <td>${p.estoque}</td>
      <td>
        <button class="edit-btn" onclick="editarProduto(${index})">Editar</button>
        <button class="delete-btn" onclick="excluirProduto(${index})">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  container.appendChild(tabela);
}

function editarProduto(index) {
  const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
  const p = produtos[index];
  
  document.querySelector("#produtos input:nth-of-type(1)").value = p.nome;
  document.querySelector("#produtos input:nth-of-type(2)").value = p.preco;
  document.querySelector("#produtos input:nth-of-type(3)").value = p.codigoBarras;
  document.querySelector("#produtos input:nth-of-type(4)").value = p.categoria;
  document.querySelector("#produtos input:nth-of-type(5)").value = p.estoque;
  
  editProdutoIndex = index;
  document.querySelector("#produtos button").textContent = "Atualizar Produto";
}

function excluirProduto(index) {
  if (confirm("Deseja realmente excluir este produto?")) {
    let produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
    produtos.splice(index, 1);
    localStorage.setItem("produtos", JSON.stringify(produtos));
    atualizarTabelaProdutos();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("produtos")) {
    atualizarTabelaProdutos();
  }
});
