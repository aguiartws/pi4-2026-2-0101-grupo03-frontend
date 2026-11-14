document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. LÓGICA DA BARRA LATERAL RETRÁTIL
  // ==========================================
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      // Adiciona ou remove a classe 'collapsed' no container principal
      appLayout.classList.toggle('collapsed');
      
      // Atualiza o atributo de acessibilidade
      const isCollapsed = appLayout.classList.contains('collapsed');
      sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
    });
  }

  // ==========================================
  // 2. LÓGICA DO "SOBRE MIM"
  // ==========================================
  const sobreMimText = document.getElementById('sobreMimText');

  // Tenta recuperar os dados salvos no questionário
  const dadosSalvos = localStorage.getItem('finduhouse_perfil_aluno');

  if (dadosSalvos && sobreMimText) {
    try {
      const dados = JSON.parse(dadosSalvos);
      
      // Se o usuário escreveu algo no "Sobre mim", exibe
      if (dados.sobreMim && dados.sobreMim.trim() !== '') {
        sobreMimText.textContent = dados.sobreMim;
      } else {
        sobreMimText.textContent = "Você ainda não escreveu nada sobre você.";
      }
    } catch (e) {
      console.error("Erro ao ler os dados", e);
      sobreMimText.textContent = "Você ainda não escreveu nada sobre você.";
    }
  } else if (sobreMimText) {
    sobreMimText.textContent = "Você ainda não escreveu nada sobre você.";
  }
});