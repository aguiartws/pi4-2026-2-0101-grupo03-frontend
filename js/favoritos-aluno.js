document.addEventListener('DOMContentLoaded', () => {
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));

  // Banco de dados simulado
  const todasAsCasas = [
    { id: 'casa-1', titulo: 'República Vila Universitária', preco: 850, local: 'Campinas, SP (1.2 km da PUC)', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400', distancia: 1.2 },
    { id: 'casa-2', titulo: 'Kitnet Moderna Centro', preco: 1200, local: 'Campinas, SP (2.5 km da PUC)', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400', distancia: 2.5 }
  ];

  let favoritosIds = JSON.parse(localStorage.getItem('finduhouse_favoritos') || '[]');
  let matchesIds = JSON.parse(localStorage.getItem('finduhouse_matches') || '[]');
  
  const grid = document.getElementById('favoritosGrid');
  const avisoVazio = document.getElementById('avisoVazio');
  
  const filtroPreco = document.getElementById('filtroPreco');
  const filtroDistancia = document.getElementById('filtroDistancia');

  function renderizar() {
    grid.innerHTML = '';
    
    const precoMax = Number(filtroPreco.value);
    const distanciaMax = Number(filtroDistancia.value);
    document.getElementById('valorPreco').textContent = `R$ ${precoMax}`;
    document.getElementById('valorDistancia').textContent = `${distanciaMax} km`;

    const favoritosFiltrados = favoritosIds.filter(id => {
      const casa = todasAsCasas.find(c => c.id === id);
      if (!casa) return false;
      return casa.preco <= precoMax && casa.distancia <= distanciaMax;
    });

    if (favoritosFiltrados.length === 0) {
      avisoVazio.style.display = 'block';
      return;
    }
    avisoVazio.style.display = 'none';

    favoritosFiltrados.forEach(id => {
      const casa = todasAsCasas.find(c => c.id === id);
      const isMatch = matchesIds.includes(id);

      const card = document.createElement('div');
      card.className = 'match-card';
      
      // Estrutura limpa, sem estilos inline, usando classes CSS
      card.innerHTML = `
        <div class="match-img" style="background-image: url('${casa.img}');"></div>
        <div class="match-info">
          <h2>${casa.titulo}</h2>
          <p class="match-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${casa.local}
          </p>
          <p class="match-price">R$ ${casa.preco}<span>/mês</span></p>
          
          <div class="card-actions flex-col">
            <div class="flex-row">
              <button class="btn-heart active" data-id="${casa.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <a href="detalhes-moradia.html" class="btn-match">Ver detalhes</a>
            </div>
            <button class="btn-match btn-match-toggle ${isMatch ? 'is-match' : ''}">
              ${isMatch ? 'Desfazer match' : 'Fechar match'}
            </button>
          </div>
        </div>
      `;

      // Remove dos favoritos
      card.querySelector('.btn-heart').addEventListener('click', () => {
        favoritosIds = favoritosIds.filter(favId => favId !== casa.id);
        localStorage.setItem('finduhouse_favoritos', JSON.stringify(favoritosIds));
        renderizar();
      });

      // Fechar/Desfazer match
      card.querySelector('.btn-match-toggle').addEventListener('click', () => {
        if (matchesIds.includes(casa.id)) {
          matchesIds = matchesIds.filter(matchId => matchId !== casa.id);
        } else {
          matchesIds.push(casa.id);
          // Aqui você pode usar aquele Toast que criamos antes
          alert('Parabéns, seu match foi feito! 🎉');
        }
        localStorage.setItem('finduhouse_matches', JSON.stringify(matchesIds));
        renderizar();
      });

      grid.appendChild(card);
    });
  }

  if (filtroPreco) {
    filtroPreco.addEventListener('input', renderizar);
    filtroDistancia.addEventListener('input', renderizar);
  }

  renderizar();
});