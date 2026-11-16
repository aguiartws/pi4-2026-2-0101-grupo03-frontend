document.addEventListener('DOMContentLoaded', () => {
  if (!exigirLogin("estudante")) return;

  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));

  const grid = document.getElementById('matchesGrid');
  const avisoVazio = document.getElementById('avisoVazio');

  async function carregarMatches() {
    const sessao = obterSessao();
    const token = sessao.token;
    const estudanteId = sessao.usuarioId;

    if (!token || !estudanteId) {
      grid.innerHTML = '';
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = 'Você precisa estar logado para ver seus matches.';
      return;
    }

    grid.innerHTML = '<p style="text-align: center; padding: 40px;">Buscando seus matches...</p>';
    avisoVazio.style.display = 'none';

    try {
      const data = await chamarApi(`/vagas/meus-matches?estudanteId=${encodeURIComponent(estudanteId)}`);
      const matches = data.matches || [];

      grid.innerHTML = ''; // Limpa o "Buscando..."

      if (matches.length === 0) {
        avisoVazio.style.display = 'block';
        return;
      }

      const imagemPlaceholder = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400';

      matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        
        const precoFormatado = Number(match.valorAluguel).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
        const enderecoCurto = match.endereco.split('-')[0] || match.endereco;

        card.innerHTML = `
          <div class="match-img" style="background-image: url('${imagemPlaceholder}');"></div>
          <div class="match-info">
            <h2>${escaparHtml(match.titulo)}</h2>
            <p class="match-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${escaparHtml(enderecoCurto)}
            </p>
            <p class="match-price">R$ ${escaparHtml(precoFormatado)}<span>/mês</span></p>
            
            <div class="card-actions">
              <a href="detalhes-moradia.html?id=${escaparHtml(match.vagaId)}" class="btn-match">Ver detalhes</a>
              <button class="btn-match btn-desfazer" data-id="${escaparHtml(match.vagaId)}" style="background: #fee2e2; color: #dc2626;">Desfazer match</button>
            </div>
          </div>
        `;

        // Lógica visual para desfazer o match
        card.querySelector('.btn-desfazer').addEventListener('click', () => {
          card.style.transform = 'scale(0.9)';
          card.style.opacity = '0';
          setTimeout(() => {
            card.remove();
            if (grid.children.length === 0) avisoVazio.style.display = 'block';
          }, 300);
        });

        grid.appendChild(card);
      });

    } catch (error) {
      console.error(error);
      grid.innerHTML = '';
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = 'Erro ao carregar seus matches.';
    }
  }

  carregarMatches();
});