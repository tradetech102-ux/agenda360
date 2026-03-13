let editIndex = -1;

function cadastrarOuEditarCliente() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value || "-";
  const telefone = document.getElementById("telefone").value;
  const cpf = document.getElementById("cpf").value || "-";
  const rg = document.getElementById("rg").value || "-";
  const endereco = document.getElementById("endereco").value || "-";

  if (!nome || !telefone) {
    alert("Por favor, preencha os campos obrigatórios (Nome e Telefone)!");
    return;
  }

  let clientes = JSON.parse(localStorage.getItem("clientes") || "[]");

  if (editIndex === -1) {
    const cliente = { nome, email, telefone, cpf, rg, endereco };
    clientes.push(cliente);
  } else {
    clientes[editIndex] = { nome, email, telefone, cpf, rg, endereco };
    editIndex = -1;
    document.getElementById("cadastrarBtn").innerHTML = 
      '<i class="fas fa-user-plus"></i> Adicionar Cliente';
    document.getElementById("cadastrarBtn").classList.remove("edit-mode");
    document.getElementById("cancelarBtn").style.display = "none";
  }

  localStorage.setItem("clientes", JSON.stringify(clientes));
  limparFormulario();
  atualizarTabela();
}

function excluirCliente(index) {
  let clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  clientes.splice(index, 1);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  atualizarTabela();
}

function editarCliente(index) {
  let clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  const cliente = clientes[index];
  document.getElementById("nome").value = cliente.nome;
  document.getElementById("email").value = cliente.email === "-" ? "" : cliente.email;
  document.getElementById("telefone").value = cliente.telefone;
  document.getElementById("cpf").value = cliente.cpf === "-" ? "" : cliente.cpf;
  document.getElementById("rg").value = cliente.rg === "-" ? "" : cliente.rg;
  document.getElementById("endereco").value = cliente.endereco === "-" ? "" : cliente.endereco;
  document.getElementById("cadastrarBtn").innerHTML = 
    '<i class="fas fa-user-plus"></i> Salvar Cliente';
  document.getElementById("cadastrarBtn").classList.add("edit-mode");
  document.getElementById("cancelarBtn").style.display = "inline";
  editIndex = index;
}

function cancelarEdicao() {
  limparFormulario();
  document.getElementById("cadastrarBtn").innerHTML = 
    '<i class="fas fa-user-plus"></i> Adicionar Cliente';
  document.getElementById("cadastrarBtn").classList.remove("edit-mode");
  document.getElementById("cancelarBtn").style.display = "none";
  editIndex = -1;
}

function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("cpf").value = "";
  document.getElementById("rg").value = "";
  document.getElementById("endereco").value = "";
}

function atualizarTabela() {
  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  const tbody = document.getElementById("clientesBody");
  tbody.innerHTML = "";

  clientes.forEach((cliente, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.email}</td>
      <td>${cliente.telefone}</td>
      <td>${cliente.cpf}</td>
      <td>${cliente.rg}</td>
      <td>${cliente.endereco}</td>
      <td>
        <button class="edit-btn" onclick="editarCliente(${index})">Editar</button>
        <button class="delete-btn" onclick="excluirCliente(${index})">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  // Verifica se o elemento da tabela de clientes existe na página atual antes de executar
  if (document.getElementById("clientesBody")) {
    atualizarTabela();
  }
});
