document.addEventListener('DOMContentLoaded', () => {
  if (!exigirLogin("estudante")) return;

  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));

  const grid = document.getElementById('favoritosGrid');
  const avisoVazio = document.getElementById('avisoVazio');
  
  const filtroPreco = document.getElementById('filtroPreco');
  const filtroDistancia = document.getElementById('filtroDistancia');
  const spanPreco = document.getElementById('valorPreco');
  const spanDistancia = document.getElementById('valorDistancia');

  let favoritosDoBanco = []; 

  async function carregarFavoritos() {
    const sessao = obterSessao();
    const token = sessao.token;
    const estudanteId = sessao.usuarioId;

    if (!token || !estudanteId) {
      grid.innerHTML = '';
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = 'Faça login para ver seus favoritos.';
      return;
    }

    grid.innerHTML = '<p style="text-align: center; padding: 40px;">Carregando favoritos...</p>';
    avisoVazio.style.display = 'none';

    try {
      const data = await chamarApi(`/favoritos?estudanteId=${encodeURIComponent(estudanteId)}`);
      favoritosDoBanco = Array.isArray(data) ? data : (data?.favoritos || []);

      favoritosDoBanco = await Promise.all(favoritosDoBanco.map(async (favorito) => {
        if (favorito.fotoCapa) return favorito;

        try {
          const vaga = await chamarApi(`/vagas/${encodeURIComponent(favorito.id)}`);
          return {
            ...favorito,
            fotoCapa: vaga.fotoCapa || vaga.fotos?.[0] || null
          };
        } catch (erro) {
          console.warn(`Não foi possível carregar a foto da vaga ${favorito.id}:`, erro);
          return favorito;
        }
      }));

      renderizarGrid();
      
    } catch (error) {
      console.error(error);
      grid.innerHTML = '';
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = mensagemDeErro(error);
    }
  }

  function renderizarGrid() {
    grid.innerHTML = '';
    
    let precoMax = 999999;
    if (filtroPreco) {
      precoMax = Number(filtroPreco.value);
      spanPreco.textContent = `R$ ${precoMax}`;
    }

    let distanciaMax = 999999;
    if (filtroDistancia) {
      distanciaMax = Number(filtroDistancia.value);
      spanDistancia.textContent = `${distanciaMax} km`;
    }

    // Filtra por preço e distância
    const filtrados = favoritosDoBanco.filter(fav => {
      const precoOk = Number(fav.valorAluguel) <= precoMax;
      
      // Usa 0 como fallback se distanciaCampus for nulo
      const distanciaCasa = Number(fav.distanciaCampus || 0);
      const distanciaOk = distanciaCasa <= distanciaMax;

      return precoOk && distanciaOk;
    });

    if (filtrados.length === 0) {
      avisoVazio.style.display = 'block';
      avisoVazio.textContent = 'Você ainda não tem favoritos (ou nenhum atende aos filtros).';
      return;
    }
    avisoVazio.style.display = 'none';

    const imagemPlaceholder = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400';

    filtrados.forEach(fav => {
      const card = document.createElement('div');
      card.className = 'match-card';
      
      const precoFormatado = Number(fav.valorAluguel).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
      
      const endereco = fav.endereco || "Endereço não informado";
      const enderecoCurto = endereco.split('-')[0];

      card.innerHTML = `
        <div class="match-img" style="background-image: url('${escaparHtml(urlImagemSegura(fav.fotoCapa, imagemPlaceholder))}');"></div>
        <div class="match-info">
          <h2>${escaparHtml(fav.titulo)}</h2>
          <p class="match-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${escaparHtml(enderecoCurto)}
          </p>
          <p class="match-price">R$ ${escaparHtml(precoFormatado)}<span>/mês</span></p>
          
          <div class="card-actions flex-col">
            <div class="flex-row">
              <button class="btn-heart active" data-id="${escaparHtml(fav.id)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <a href="detalhes-moradia.html?id=${escaparHtml(fav.id)}" class="btn-match">Ver detalhes</a>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.btn-heart').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
          const estudanteId = obterSessao().usuarioId;
          await chamarApi(
            `/favoritos/${encodeURIComponent(fav.id)}?estudanteId=${encodeURIComponent(estudanteId)}`,
            { metodo: 'DELETE' }
          );
          favoritosDoBanco = favoritosDoBanco.filter(f => f.id !== fav.id);
          renderizarGrid();
        } catch (error) {
          console.error(error);
          btn.disabled = false;
          alert(mensagemDeErro(error));
        }
      });

      grid.appendChild(card);
    });
  }

  // Adiciona escuta para AMBOS os filtros
  if (filtroPreco) filtroPreco.addEventListener('input', renderizarGrid);
  if (filtroDistancia) filtroDistancia.addEventListener('input', renderizarGrid);

  carregarFavoritos();
  window.addEventListener('pageshow', (e) => { if (e.persisted) carregarFavoritos(); });
});