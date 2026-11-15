document.addEventListener('DOMContentLoaded', () => {
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));

  const grid = document.getElementById('favoritosGrid');
  const avisoVazio = document.getElementById('avisoVazio');
  
  const filtroPreco = document.getElementById('filtroPreco');
  const spanPreco = document.getElementById('valorPreco');

  let favoritosDoBanco = []; 

  async function carregarFavoritos() {
    const token = localStorage.getItem('token');
    const estudanteId = localStorage.getItem('usuarioId');

    if (!token || !estudanteId) {
      grid.innerHTML = '';
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = 'Faça login para ver seus favoritos.';
      return;
    }

    grid.innerHTML = '<p style="text-align: center; padding: 40px;">Carregando favoritos...</p>';
    avisoVazio.style.display = 'none';

    try {
      const response = await fetch(`http://localhost:8081/api/favoritos?estudanteId=${estudanteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erro ao buscar favoritos');

      const data = await response.json();
      console.log("Dados recebidos:", data); // Para debug
      
      favoritosDoBanco = data.favoritos || [];

      renderizarGrid();
      
    } catch (error) {
      console.error(error);
      grid.innerHTML = '';
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = 'Erro ao carregar favoritos.';
    }
  }

  function renderizarGrid() {
    grid.innerHTML = '';
    
    let precoMax = 999999;
    if (filtroPreco) {
      precoMax = Number(filtroPreco.value);
      spanPreco.textContent = `R$ ${precoMax}`;
    }

    const filtrados = favoritosDoBanco.filter(fav => Number(fav.valorAluguel) <= precoMax);

    if (filtrados.length === 0) {
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = 'Você ainda não tem favoritos (ou nenhum atende ao filtro de preço).';
      return;
    }
    avisoVazio.style.display = 'none';

    const imagemPlaceholder = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400';

    filtrados.forEach(fav => {
      const card = document.createElement('div');
      card.className = 'match-card';
      
      const precoFormatado = Number(fav.valorAluguel).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
      
      // Proteção caso o endereço venha nulo
      const endereco = fav.endereco || "Endereço não informado";
      const enderecoCurto = endereco.split('-')[0];

      card.innerHTML = `
        <div class="match-img" style="background-image: url('${imagemPlaceholder}');"></div>
        <div class="match-info">
          <h2>${fav.titulo}</h2>
          <p class="match-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${enderecoCurto}
          </p>
          <p class="match-price">R$ ${precoFormatado}<span>/mês</span></p>
          
          <div class="card-actions flex-col">
            <div class="flex-row">
              <button class="btn-heart active" data-id="${fav.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <a href="detalhes-moradia.html?id=${fav.id}" class="btn-match">Ver detalhes</a>
            </div>
          </div>
        </div>
      `;

      // Apenas remove visualmente
      card.querySelector('.btn-heart').addEventListener('click', () => {
        favoritosDoBanco = favoritosDoBanco.filter(f => f.id !== fav.id);
        renderizarGrid();
      });

      grid.appendChild(card);
    });
  }

  if (filtroPreco) {
    filtroPreco.addEventListener('input', renderizarGrid);
  }

  carregarFavoritos();
});