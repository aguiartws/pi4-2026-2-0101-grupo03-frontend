document.addEventListener('DOMContentLoaded', () => {
  if (!exigirLogin("proprietario")) return;

  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const grid = document.getElementById('matchesGrid');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      appLayout.classList.toggle('collapsed');
      const isCollapsed = appLayout.classList.contains('collapsed');
      sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
    });
  }

  const iniciais = (nome) => (nome || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

  const obterFotoPerfil = (match) => {
    const foto = match.fotoPerfilUrl || match.fotoUrl;
    return typeof foto === 'string' ? urlImagemSegura(foto.trim(), '') : '';
  };

  function criarCard(match) {
    const nome = escaparHtml(match.nomeEstudante || 'Estudante');
    const curso = escaparHtml(match.curso || 'Curso não informado');
    const tituloVaga = escaparHtml(match.tituloVaga || 'Moradia');
    const iniciaisAluno = escaparHtml(iniciais(match.nomeEstudante));
    const fotoPerfilUrl = obterFotoPerfil(match);
    const dados = encodeURIComponent(JSON.stringify(match));

    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
      <div class="match-img student-bg">
        ${fotoPerfilUrl
          ? `<img class="student-avatar" src="${escaparHtml(fotoPerfilUrl)}" alt="Foto de ${nome}">`
          : `<div class="student-avatar">${iniciaisAluno}</div>`}
        <span class="match-badge">💜 Interesse recebido</span>
      </div>
      <div class="match-info">
        <h2>${nome}</h2>
        <p class="match-course">${curso}</p>
        <div class="match-property">
          <span class="label">Gostou de:</span>
          <span class="value">${tituloVaga}</span>
        </div>
        <button class="btn-match" type="button" data-match="${escaparHtml(dados)}">Ver detalhes</button>
      </div>
    `;
    const foto = card.querySelector('.student-avatar');
    if (foto && foto.tagName === 'IMG') {
      foto.addEventListener('error', () => {
        const fallback = document.createElement('div');
        fallback.className = 'student-avatar';
        fallback.textContent = iniciais(match.nomeEstudante);
        foto.replaceWith(fallback);
      }, { once: true });
    }
    return card;
  }

  function abrirModal(match) {
    const modalOverlay = document.getElementById('modalContato');
    const modalNome = document.getElementById('modalNome');
    const modalCurso = document.getElementById('modalCurso');
    const modalEmail = document.getElementById('modalEmail');
    const modalTelefone = document.getElementById('modalTelefone');
    const modalIniciais = document.getElementById('modalIniciais');
    const modalFoto = document.getElementById('modalFoto');
    const modalSobreMim = document.getElementById('modalSobreMim');
    const modalRespostas = document.getElementById('modalRespostas');

    modalNome.textContent = match.nomeEstudante || 'Estudante';
    modalCurso.textContent = match.curso || 'Curso não informado';
    modalEmail.textContent = match.email || 'E-mail não informado';
    modalEmail.href = match.email ? `mailto:${match.email}` : '#';
    modalTelefone.textContent = match.telefone || 'Telefone não informado';
    const telefoneWhatsApp = window.api.normalizarTelefoneWhatsApp(match.telefone);
    modalTelefone.href = telefoneWhatsApp
      ? `https://wa.me/${telefoneWhatsApp}`
      : '#';

    const textoIniciais = iniciais(match.nomeEstudante);
    const fotoPerfilUrl = obterFotoPerfil(match);

    const exibirIniciais = () => {
      modalFoto.removeAttribute('src');
      modalFoto.hidden = true;
      modalIniciais.hidden = false;
      modalIniciais.textContent = textoIniciais;
    };

    if (fotoPerfilUrl) {
      modalFoto.onerror = exibirIniciais;
      modalFoto.src = fotoPerfilUrl;
      modalFoto.hidden = false;
      modalIniciais.hidden = true;
    } else {
      exibirIniciais();
    }

    modalSobreMim.textContent = 'O estudante não escreveu nada sobre si.';
    modalRespostas.innerHTML = '<p>Preferências não disponíveis.</p>';
    modalOverlay.classList.add('active');
  }

  function configurarModal() {
    const modalOverlay = document.getElementById('modalContato');
    const fechar = () => modalOverlay.classList.remove('active');
    document.getElementById('fecharModalX').addEventListener('click', fechar);
    document.getElementById('btnFecharModal').addEventListener('click', fechar);
    modalOverlay.addEventListener('click', (evento) => {
      if (evento.target === modalOverlay) fechar();
    });
  }

  async function carregarMatches() {
    const sessao = obterSessao();
    try {
      const resposta = await chamarApi(
        `/vagas/responsavel/${encodeURIComponent(sessao.usuarioId)}/matches`
      );
      const matches = Array.isArray(resposta) ? resposta : (resposta?.matches || []);
      grid.innerHTML = '';

      if (matches.length === 0) {
        grid.innerHTML = '<p class="loading-msg">Nenhum estudante demonstrou interesse nas suas moradias.</p>';
        return;
      }

      matches.forEach((match) => grid.appendChild(criarCard(match)));
      grid.querySelectorAll('[data-match]').forEach((botao) => {
        botao.addEventListener('click', () => {
          abrirModal(JSON.parse(decodeURIComponent(botao.dataset.match)));
        });
      });
    } catch (erro) {
      console.error('Erro ao carregar matches do proprietário:', erro);
      grid.innerHTML = `<p class="loading-msg">${escaparHtml(mensagemDeErro(erro))}</p>`;
    }
  }

  configurarModal();
  carregarMatches();
});