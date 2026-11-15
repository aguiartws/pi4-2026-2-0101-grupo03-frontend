document.addEventListener('DOMContentLoaded', () => {
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));

  const todasAsCasas = [
    { id: 'casa-1', titulo: 'República Vila Universitária', preco: 850, local: 'Campinas, SP (1.2 km da PUC)', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400' },
    { id: 'casa-2', titulo: 'Kitnet Moderna Centro', preco: 1200, local: 'Campinas, SP (2.5 km da PUC)', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400' }
  ];

  let matchesIds = JSON.parse(localStorage.getItem('finduhouse_matches') || '[]');
  const grid = document.getElementById('matchesGrid');
  const avisoVazio = document.getElementById('avisoVazio');

  function renderizar() {
    grid.innerHTML = '';
    
    if (matchesIds.length === 0) {
      avisoVazio.style.display = 'block';
      return;
    }
    avisoVazio.style.display = 'none';

    matchesIds.forEach(id => {
      const casa = todasAsCasas.find(c => c.id === id);
      if (!casa) return;

      const card = document.createElement('div');
      card.className = 'match-card';
      card.innerHTML = `
        <div class="match-img" style="background-image: url('${casa.img}');"></div>
        <div class="match-info">
          <h2>${casa.titulo}</h2>
          <p class="match-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${casa.local}</p>
          <p class="match-price">R$ ${casa.preco}<span>/mês</span></p>
          
          <div class="card-actions">
            <a href="detalhes-moradia.html" class="btn-match">Ver detalhes</a>
            <button class="btn-match btn-desfazer" style="background: #fee2e2; color: #dc2626;">Desfazer match</button>
          </div>
        </div>
      `;

      // Desfazer match
      card.querySelector('.btn-desfazer').addEventListener('click', () => {
        card.style.transform = 'scale(0.9)';
        card.style.opacity = '0';
        setTimeout(() => {
          matchesIds = matchesIds.filter(matchId => matchId !== casa.id);
          localStorage.setItem('finduhouse_matches', JSON.stringify(matchesIds));
          renderizar();
        }, 300);
      });

      grid.appendChild(card);
    });
  }

  renderizar();
});