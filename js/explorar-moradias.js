document.addEventListener('DOMContentLoaded', () => {
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));
  }

  const API_BASE = 'http://localhost:8081/api';
  const grid = document.getElementById('explorarGrid');
  
  const filtroPreco = document.getElementById('filtroPreco');
  const filtroDistancia = document.getElementById('filtroDistancia');
  const spanPreco = document.getElementById('valorPreco');
  const spanDistancia = document.getElementById('valorDistancia');

  async function carregarVagas() {
    // Pega o token da chave correta que vimos no console
    const token = localStorage.getItem('token'); 
    
    if (!token) {
      grid.innerHTML = '<p class="empty-msg">Você precisa estar logado para ver as vagas.</p>';
      return;
    }

    const precoMax = filtroPreco.value;
    const distanciaMax = filtroDistancia.value;

    // Limpa a tela e mostra carregando
    grid.innerHTML = '<p class="loading-msg">Carregando moradias...</p>';

    try {
      const url = `${API_BASE}/vagas?valorAluguelMaximo=${precoMax}&distanciaMaxima=${distanciaMax}`;
      const resp = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (resp.status === 401) {
        grid.innerHTML = '<p class="empty-msg">Sessão expirada. Faça login novamente.</p>';
        return;
      }
      
      if (!resp.ok) throw new Error('Falha ao buscar vagas');

      const data = await resp.json();
      const vagas = data.vagas || [];

      grid.innerHTML = ''; // Limpa o "Carregando..."

      if (vagas.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Nenhuma moradia encontrada com esses filtros.</p>';
        return;
      }

      vagas.forEach(vaga => grid.appendChild(criarCard(vaga)));
      
    } catch (error) {
      console.error(error);
      grid.innerHTML = '<p class="empty-msg">Erro ao carregar moradias. Verifique o console.</p>';
    }
  }

  function criarCard(vaga) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    // O backend não manda imagem por enquanto, usamos um placeholder bonito
    const imagem = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400';
    const badge = 'Moradia'; 
    
    const precoFormatado = Number(vaga.valorAluguel).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const distanciaFormatada = vaga.distanciaCampus ? Number(vaga.distanciaCampus).toFixed(1).replace('.', ',') : '?';
    const enderecoCurto = vaga.endereco.split('-')[0] || vaga.endereco;

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
          <button class="btn-heart" data-id="${vaga.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>
    `;

    const btnHeart = card.querySelector('.btn-heart');
    let favoritos = JSON.parse(localStorage.getItem('finduhouse_favoritos') || '[]');
    
    if (favoritos.includes(String(vaga.id))) btnHeart.classList.add('active');

    btnHeart.addEventListener('click', () => {
      const idStr = String(vaga.id);
      if (favoritos.includes(idStr)) {
        favoritos = favoritos.filter(favId => favId !== idStr);
        btnHeart.classList.remove('active');
      } else {
        favoritos.push(idStr);
        btnHeart.classList.add('active');
      }
      localStorage.setItem('finduhouse_favoritos', JSON.stringify(favoritos));
    });

    return card;
  }

  if (filtroPreco && filtroDistancia) {
    filtroPreco.addEventListener('input', () => spanPreco.textContent = `R$ ${filtroPreco.value}`);
    filtroDistancia.addEventListener('input', () => spanDistancia.textContent = `${filtroDistancia.value} km`);

    filtroPreco.addEventListener('change', carregarVagas);
    filtroDistancia.addEventListener('change', carregarVagas);
  }

  carregarVagas();
});