document.addEventListener('DOMContentLoaded', () => {
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));
  }

  const grid = document.getElementById('explorarGrid');
  
  const filtroPreco = document.getElementById('filtroPreco');
  const filtroDistancia = document.getElementById('filtroDistancia');
  const spanPreco = document.getElementById('valorPreco');
  const spanDistancia = document.getElementById('valorDistancia');

  let vagasNoBanco = [];
  let idsFavoritos = []; // Guarda apenas os IDs das vagas que o aluno favoritou
  
  const sessao = obterSessao();
  const token = sessao.token === "mock-token-de-teste" ? null : sessao.token;
  const estudanteId = token ? sessao.usuarioId : null;

  
  function renderizarGrid() {
    grid.innerHTML = ''; 

    if (vagasNoBanco.length === 0) {
      grid.innerHTML = '<p class="empty-msg">Nenhuma moradia encontrada com esses filtros.</p>';
      return;
    }

    vagasNoBanco.forEach(vaga => grid.appendChild(criarCard(vaga)));
  }

    async function inicializar() {
    if (!token || !estudanteId) {
      grid.innerHTML = '<p class="empty-msg">Você precisa estar logado para ver as vagas.</p>';
      return;
    }

    grid.innerHTML = '<p class="loading-msg">Carregando moradias...</p>';

    try {
      const [dataVagas, dataFavoritos] = await Promise.all([
        chamarApi(`/vagas?valorAluguelMaximo=${filtroPreco.value}&distanciaMaxima=${filtroDistancia.value}`),
        chamarApi(`/favoritos?estudanteId=${estudanteId}`)
      ]);

      const vagas = Array.isArray(dataVagas) ? dataVagas : (dataVagas?.vagas || []);
      vagasNoBanco = Array.isArray(vagas) ? vagas : [];
      
      // Garante que todos os IDs sejam do tipo Number para a comparação funcionar
      const favoritos = Array.isArray(dataFavoritos)
        ? dataFavoritos
        : (dataFavoritos?.favoritos || []);
      idsFavoritos = favoritos.map(fav => Number(fav.id));

      renderizarGrid();

    } catch (error) {
      console.error(error);
      grid.innerHTML = `<p class="empty-msg">${mensagemDeErro(error)}</p>`;
    }
  }

  function criarCard(vaga) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    const imagem = vaga.fotoCapa || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400';
    const badge = 'Moradia'; 
    
    const precoFormatado = Number(vaga.valorAluguel).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const distanciaFormatada = vaga.distanciaCampus ? Number(vaga.distanciaCampus).toFixed(1).replace('.', ',') : '?';
    const endereco = vaga.endereco || "Endereço não informado";
    const enderecoCurto = endereco.split('-')[0] || endereco;

    // Força a conversão para Number na hora de checar
    const isFavorito = idsFavoritos.includes(Number(vaga.id));

    card.innerHTML = `
      <div class="match-img" style="background-image: url('${imagem}');">
        <span class="match-badge category-badge">${badge}</span>
      </div>
      <div class="match-info">
        <h2>${vaga.titulo}</h2>
        <p class="match-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${enderecoCurto} (${distanciaFormatada} km)
        </p>
        <p class="match-price">R$ ${precoFormatado}<span>/mês</span></p>
        <div class="card-actions">
          <a href="detalhes-moradia.html?id=${vaga.id}" class="btn-match">Ver detalhes</a>
          <button class="btn-heart ${isFavorito ? 'active' : ''}" data-id="${vaga.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
    `;

    const btnHeart = card.querySelector('.btn-heart');

    btnHeart.addEventListener('click', async () => {
      if (!token || !estudanteId) return alert('Faça login para favoritar.');

      btnHeart.classList.toggle('active');
      const idVagaNumero = Number(vaga.id);
      const jaEraFavorito = idsFavoritos.includes(idVagaNumero);

      try {
        if (jaEraFavorito) {
          idsFavoritos = idsFavoritos.filter(id => id !== idVagaNumero);
          console.warn('Favorito removido da tela, mas o endpoint DELETE ainda não existe no backend.');
        } else {
          await chamarApi("/favoritos", {
            metodo: 'POST',
            corpo: { estudanteId: Number(estudanteId), vagaId: idVagaNumero }
          });
          idsFavoritos.push(idVagaNumero);
        }
      } catch (error) {
        console.error(error);
        btnHeart.classList.toggle('active');
        if (error.codigo !== 'VAGA_JA_FAVORITADA') alert(mensagemDeErro(error));
      }
    });

    return card;
  }

  if (filtroPreco && filtroDistancia) {
    filtroPreco.addEventListener('input', () => spanPreco.textContent = `R$ ${filtroPreco.value}`);
    filtroDistancia.addEventListener('input', () => spanDistancia.textContent = `${filtroDistancia.value} km`);

    // Ao soltar o slider, busca as vagas com o novo filtro E os favoritos novamente
    filtroPreco.addEventListener('change', inicializar);
    filtroDistancia.addEventListener('change', inicializar);
  }

  inicializar();
});