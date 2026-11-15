document.addEventListener('DOMContentLoaded', () => {
  // Lógica da barra lateral retrátil
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      appLayout.classList.toggle('collapsed');
      const isCollapsed = appLayout.classList.contains('collapsed');
      sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
    });
  }

  // Lógica do Modal de Contato
  const modalOverlay = document.getElementById('modalContato');
  const btnFecharX = document.getElementById('fecharModalX');
  const btnFechar = document.getElementById('btnFecharModal');
  
  // Elementos dentro do modal
  const modalNome = document.getElementById('modalNome');
  const modalCurso = document.getElementById('modalCurso');
  const modalEmail = document.getElementById('modalEmail');
  const modalTelefone = document.getElementById('modalTelefone');
  const modalIniciais = document.getElementById('modalIniciais');
  const modalFoto = document.getElementById('modalFoto');

  // Seleciona todos os botões de "Conversar com estudante"
  const botoesConversar = document.querySelectorAll('.btn-match');

  botoesConversar.forEach(botao => {
    botao.addEventListener('click', () => {
      // Pega as informações escondidas nos atributos data-* do botão
      const nome = botao.getAttribute('data-nome');
      const iniciais = botao.getAttribute('data-iniciais');
      const curso = botao.getAttribute('data-curso');
      const email = botao.getAttribute('data-email');
      const telefone = botao.getAttribute('data-telefone');
      const fotoUrl = botao.getAttribute('data-foto');

      // Preenche o modal
      modalNome.textContent = nome;
      modalCurso.textContent = curso;
      
      modalEmail.textContent = email;
      modalEmail.href = `mailto:${email}`;
      
      modalTelefone.textContent = telefone;
      // Limpa o telefone para criar o link do WhatsApp (só números)
      const telNumeros = telefone.replace(/\D/g, '');
      modalTelefone.href = `https://wa.me/55${telNumeros}`;
      modalTelefone.target = "_blank"; // Abre o whats em outra aba

      // Lógica para a foto (se tiver foto, mostra. Se não, mostra as iniciais)
      if (fotoUrl && fotoUrl.trim() !== '') {
        modalFoto.src = fotoUrl;
        modalFoto.hidden = false;
        modalIniciais.hidden = true;
      } else {
        modalFoto.hidden = true;
        modalIniciais.hidden = false;
        modalIniciais.textContent = iniciais;
      }

      // Abre o modal adicionando a classe active
      modalOverlay.classList.add('active');
    });
  });

  // Função para fechar o modal
  function fecharModal() {
    modalOverlay.classList.remove('active');
  }

  // Eventos de clique para fechar
  btnFecharX.addEventListener('click', fecharModal);
  btnFechar.addEventListener('click', fecharModal);
  
  // Fecha se clicar fora da caixinha branca
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      fecharModal();
    }
  });
});