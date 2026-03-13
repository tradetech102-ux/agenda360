function addGroup() {
  let groups = JSON.parse(localStorage.getItem("groups") || "[]");
  const newGroup = {
    id: groups.length + 1,
    name: `Grupo ${groups.length + 1}`
  };
  groups.push(newGroup);
  localStorage.setItem("groups", JSON.stringify(groups));
  renderGroups();
}

function renderGroups() {
  const groupList = document.getElementById("group-list");
  if (!groupList) return;
  
  const groups = JSON.parse(localStorage.getItem("groups") || "[]");
  groupList.innerHTML = "";
  
  groups.forEach((group, index) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "group-item";
    groupDiv.innerHTML = `
      <span>${index + 1}. ${group.name}</span>
      <button class="delete-btn" onclick="deleteGroup(${index})"><i class="fas fa-trash"></i></button>
    `;
    groupList.appendChild(groupDiv);
  });
}

function deleteGroup(index) {
  if (confirm("Deseja excluir este grupo?")) {
    let groups = JSON.parse(localStorage.getItem("groups") || "[]");
    groups.splice(index, 1);
    localStorage.setItem("groups", JSON.stringify(groups));
    renderGroups();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("times")) {
    renderGroups();
  }
});
