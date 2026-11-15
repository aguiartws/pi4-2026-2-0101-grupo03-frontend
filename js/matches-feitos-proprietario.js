document.addEventListener('DOMContentLoaded', () => {
  // 1. Sidebar
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      appLayout.classList.toggle('collapsed');
      const isCollapsed = appLayout.classList.contains('collapsed');
      sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
    });
  }

  // 2. Lógica do Modal
  const modalOverlay = document.getElementById('modalContato');
  const btnFecharX = document.getElementById('fecharModalX');
  const btnFechar = document.getElementById('btnFecharModal');
  
  const modalNome = document.getElementById('modalNome');
  const modalCurso = document.getElementById('modalCurso');
  const modalEmail = document.getElementById('modalEmail');
  const modalTelefone = document.getElementById('modalTelefone');
  const modalIniciais = document.getElementById('modalIniciais');
  const modalFoto = document.getElementById('modalFoto');
  const modalSobreMim = document.getElementById('modalSobreMim');
  const modalRespostas = document.getElementById('modalRespostas');

  const botoesConversar = document.querySelectorAll('.btn-match');

  botoesConversar.forEach(botao => {
    botao.addEventListener('click', () => {
      const nome = botao.getAttribute('data-nome');
      const iniciais = botao.getAttribute('data-iniciais');
      const curso = botao.getAttribute('data-curso');
      const email = botao.getAttribute('data-email');
      const telefone = botao.getAttribute('data-telefone');
      const fotoUrl = botao.getAttribute('data-foto');
      const sobreMim = botao.getAttribute('data-sobre-mim');
      const respostasJson = botao.getAttribute('data-respostas');

      // Preenche contatos
      modalNome.textContent = nome;
      modalCurso.textContent = curso;
      modalEmail.textContent = email;
      modalEmail.href = `mailto:${email}`;
      
      modalTelefone.textContent = telefone;
      const telNumeros = telefone.replace(/\D/g, '');
      modalTelefone.href = `https://wa.me/55${telNumeros}`;
      modalTelefone.target = "_blank";

      // Foto / Iniciais
      if (fotoUrl && fotoUrl.trim() !== '') {
        modalFoto.src = fotoUrl;
        modalFoto.hidden = false;
        modalIniciais.hidden = true;
      } else {
        modalFoto.hidden = true;
        modalIniciais.hidden = false;
        modalIniciais.textContent = iniciais;
      }

      // Preenche o Sobre Mim
      modalSobreMim.textContent = sobreMim || "O estudante não escreveu nada sobre si.";

      // Monta a lista de Respostas do Questionário
      modalRespostas.innerHTML = '';
      if (respostasJson) {
        try {
          const respostas = JSON.parse(respostasJson);
          respostas.forEach(item => {
            const qaItem = document.createElement('div');
            qaItem.className = 'qa-item';
            const classeResposta = item.a.toLowerCase() === 'sim' ? 'yes' : 'no';
            
            qaItem.innerHTML = `
              <span class="qa-q">${item.q}</span>
              <span class="qa-a ${classeResposta}">${item.a}</span>
            `;
            modalRespostas.appendChild(qaItem);
          });
        } catch (e) {
          modalRespostas.innerHTML = '<p>Erro ao carregar respostas.</p>';
        }
      }

      modalOverlay.classList.add('active');
    });
  });

  function fecharModal() {
    modalOverlay.classList.remove('active');
  }

  btnFecharX.addEventListener('click', fecharModal);
  btnFechar.addEventListener('click', fecharModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fecharModal();
  });
});