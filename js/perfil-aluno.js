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

  // 2. Lógica do "Sobre mim" e Nome do Aluno
  const sobreMimText = document.getElementById('sobreMimText');
  const nomeAlunoEl = document.getElementById('nomeAluno');
  const avatarAlunoEl = document.getElementById('avatarAluno');

  if (sobreMimText) {
    try {
      const dadosSalvos = localStorage.getItem('finduhouse_perfil_aluno');
      let nomeSalvo = localStorage.getItem('finduhouse_usuario_nome'); // Caso você salve o nome depois

      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        
        // Preenche Sobre Mim
        sobreMimText.textContent = dados.sobreMim && dados.sobreMim.trim() !== '' 
          ? dados.sobreMim 
          : "Você ainda não escreveu nada sobre você.";

        // Se o nome estiver salvo dentro do perfil, puxa ele
        if (dados.nome) nomeSalvo = dados.nome;
      } else {
        sobreMimText.textContent = "Você ainda não escreveu nada sobre você.";
      }

      // Se tiver um nome salvo, atualiza a tela e o avatar
      if (nomeSalvo && nomeSalvo.trim() !== "") {
        nomeAlunoEl.textContent = nomeSalvo;
        if (avatarAlunoEl) {
          // Pega a primeira letra do nome
          avatarAlunoEl.textContent = nomeSalvo.charAt(0).toUpperCase();
        }
      }
    } catch (e) {
      console.error("Erro ao ler os dados do perfil:", e);
      sobreMimText.textContent = "Erro ao carregar informações.";
    }
  }
});