// Mapeamento de seções para arquivos HTML
const sectionToPage = {
  'calendar': 'calendario.html',
  'clientes': 'clientes.html',
  'fornecedores': 'fornecedores.html',
  'tarefas': 'tarefas.html',
  'produtos': 'produtos.html',
  'financeiro': 'financeiro.html',
  'tabela-emprestimos': 'emprestimos.html',
  'tabela-financeira': 'tabela-financeira.html',
  'times': 'times.html',
  'vendas': 'vendas.html',
  'relatorios': 'relatorios.html'
};

function showSection(id) {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const targetPage = sectionToPage[id];

  // Fechar sidebar ao navegar em mobile
  closeSidebar();

  if (targetPage && currentPage !== targetPage) {
    window.location.href = targetPage;
  } else {
    // Se já estiver na página, apenas garante que a seção está ativa (para o caso de SPA parcial)
    document.querySelectorAll(".form-section, .times-section, .tabela-emprestimos-section, .tabela-financeira-section").forEach(section => {
      section.classList.remove("active");
    });
    const targetElement = document.getElementById(id);
    if (targetElement) targetElement.classList.add("active");
  }
}

// ===== MENU HAMBURGUER PARA MOBILE =====
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
  if (overlay) {
    overlay.classList.toggle('active');
  }
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.remove('active');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Fechar sidebar ao clicar fora dele (no overlay)
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Adicionar evento ao botão do menu hamburguer
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }

  // Fechar sidebar ao clicar em um item do menu
  const sidebarItems = document.querySelectorAll('.sidebar ul li');
  sidebarItems.forEach(item => {
    item.addEventListener('click', closeSidebar);
  });

  // Destacar item ativo na sidebar
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  sidebarItems.forEach(item => {
    const section = item.getAttribute('data-section');
    if (sectionToPage[section] === currentPage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Fechar sidebar ao redimensionar a janela (se voltar para desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
});
