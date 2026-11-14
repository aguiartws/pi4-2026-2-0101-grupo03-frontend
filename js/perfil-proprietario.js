document.addEventListener('DOMContentLoaded', () => {
  // 1. Lógica da barra lateral retrátil
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      appLayout.classList.toggle('collapsed');
      const isCollapsed = appLayout.classList.contains('collapsed');
      sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
    });
  }

  // 2. Lógica para puxar o nome do proprietário
  const nomeProprietarioEl = document.getElementById('nomeProprietario');
  const avatarProprietarioEl = document.getElementById('avatarProprietario');

  // Busca o nome que foi salvo durante o login/cadastro
  const nomeSalvo = localStorage.getItem('finduhouse_usuario_nome');

  if (nomeSalvo && nomeSalvo.trim() !== "") {
    if (nomeProprietarioEl) nomeProprietarioEl.textContent = nomeSalvo;
    if (avatarProprietarioEl) {
      // Pega as iniciais (ex: "Ana Clara" -> "AC")
      const partes = nomeSalvo.trim().split(" ");
      let iniciais = partes[0].charAt(0).toUpperCase();
      if (partes.length > 1) {
        iniciais += partes[partes.length - 1].charAt(0).toUpperCase();
      }
      avatarProprietarioEl.textContent = iniciais;
    }
  }
});