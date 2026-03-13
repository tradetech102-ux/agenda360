let editFornecedorIndex = -1;

function saveFornecedor() {
  const nome = document.getElementById("fornecedor-nome").value;
  const contato = document.getElementById("fornecedor-contato").value;
  const email = document.getElementById("fornecedor-email").value;
  const categoria = document.getElementById("fornecedor-categoria").value;

  if (!nome || !contato) {
    alert("Nome e Contato são obrigatórios!");
    return;
  }

  const fornecedor = { nome, contato, email, categoria };
  let fornecedores = JSON.parse(localStorage.getItem("fornecedores") || "[]");

  if (editFornecedorIndex === -1) {
    fornecedores.push(fornecedor);
  } else {
    fornecedores[editFornecedorIndex] = fornecedor;
    editFornecedorIndex = -1;
    document.getElementById("btn-save-fornecedor").textContent = "Adicionar Fornecedor";
  }

  localStorage.setItem("fornecedores", JSON.stringify(fornecedores));
  limparFormularioFornecedor();
  atualizarTabelaFornecedores();
}

function limparFormularioFornecedor() {
  document.getElementById("fornecedor-nome").value = "";
  document.getElementById("fornecedor-contato").value = "";
  document.getElementById("fornecedor-email").value = "";
  document.getElementById("fornecedor-categoria").value = "";
}

function atualizarTabelaFornecedores() {
  const fornecedores = JSON.parse(localStorage.getItem("fornecedores") || "[]");
  const container = document.getElementById("fornecedores");
  
  let tabela = document.getElementById("tabelaFornecedores");
  if (!tabela) {
    tabela = document.createElement("table");
    tabela.id = "tabelaFornecedores";
    tabela.innerHTML = `
      <thead>
        <tr>
          <th>Nome</th>
          <th>Contato</th>
          <th>Categoria</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="fornecedoresBody"></tbody>
    `;
    container.appendChild(tabela);
  }

  const tbody = document.getElementById("fornecedoresBody");
  tbody.innerHTML = "";
  
  fornecedores.forEach((f, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${f.nome}</td>
      <td>${f.contato}</td>
      <td>${f.categoria}</td>
      <td>
        <button class="edit-btn" onclick="editarFornecedor(${index})">Editar</button>
        <button class="delete-btn" onclick="excluirFornecedor(${index})">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editarFornecedor(index) {
  const fornecedores = JSON.parse(localStorage.getItem("fornecedores") || "[]");
  const f = fornecedores[index];
  
  document.getElementById("fornecedor-nome").value = f.nome;
  document.getElementById("fornecedor-contato").value = f.contato;
  document.getElementById("fornecedor-email").value = f.email;
  document.getElementById("fornecedor-categoria").value = f.categoria;
  
  editFornecedorIndex = index;
  document.getElementById("btn-save-fornecedor").textContent = "Atualizar Fornecedor";
}

function excluirFornecedor(index) {
  if (confirm("Deseja realmente excluir este fornecedor?")) {
    let fornecedores = JSON.parse(localStorage.getItem("fornecedores") || "[]");
    fornecedores.splice(index, 1);
    localStorage.setItem("fornecedores", JSON.stringify(fornecedores));
    atualizarTabelaFornecedores();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("fornecedores")) {
    atualizarTabelaFornecedores();
  }
});
