document.addEventListener('DOMContentLoaded', () => {
  // 1. Sidebar
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));
  }

  // 2. Pega o ID da URL
  const urlParams = new URLSearchParams(window.location.search);
  const vagaId = urlParams.get('id') || '1';
  const token = localStorage.getItem('token');
  const estudanteId = localStorage.getItem('usuarioId');

  // ==========================================
  // 3. CARREGAR DADOS DA MORADIA
  // ==========================================
  async function carregarDetalhes() {
    // Limpa o HTML fixo enquanto busca
    document.querySelector('.title-section h1').textContent = 'Carregando...';
    document.querySelector('.location').innerHTML = '';
    document.querySelector('.description-section p').textContent = '';
    document.querySelector('.price-value').textContent = '...';
    document.querySelector('.features-grid').innerHTML = '<p>Buscando características...</p>';

    try {
      const response = await fetch(`http://localhost:8081/api/vagas/${vagaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (!response.ok) throw new Error('Erro ao buscar detalhes');

      const vaga = await response.json();

      // Atualiza o título da página e os dados no HTML
      document.title = `${vaga.titulo} | FindUHouse`;
      document.querySelector('.title-section h1').textContent = vaga.titulo;
      document.querySelector('.location').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${vaga.endereco}
      `;
      document.querySelector('.description-section p').textContent = vaga.descricao;

      const precoFormatado = Number(vaga.valorAluguel).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
      document.querySelector('.price-value').textContent = precoFormatado;

      const featuresGrid = document.querySelector('.features-grid');
      
      // Verifica se as regras vieram no JSON (se o DTO de detalhe tiver o campo regrasConvivencia)
      if (vaga.regrasConvivencia) {
        featuresGrid.innerHTML = `
          <div class="feature-item"><span class="feature-label">Aceita barulho após 22h?</span><span class="feature-value ${vaga.regrasConvivencia.aceitaBarulhoDepoisDas22 ? 'yes' : 'none'}">${vaga.regrasConvivencia.aceitaBarulhoDepoisDas22 ? 'Sim' : 'Não'}</span></div>
          <div class="feature-item"><span class="feature-label">Aceita animais?</span><span class="feature-value ${vaga.regrasConvivencia.aceitaAnimais ? 'yes' : 'none'}">${vaga.regrasConvivencia.aceitaAnimais ? 'Sim' : 'Não'}</span></div>
          <div class="feature-item"><span class="feature-label">Fuma?</span><span class="feature-value ${vaga.regrasConvivencia.fuma ? 'yes' : 'none'}">${vaga.regrasConvivencia.fuma ? 'Sim' : 'Não'}</span></div>
          <div class="feature-item"><span class="feature-label">Gosta de receber visitas?</span><span class="feature-value ${vaga.regrasConvivencia.gostaReceberVisitas ? 'yes' : 'none'}">${vaga.regrasConvivencia.gostaReceberVisitas ? 'Sim' : 'Não'}</span></div>
          <div class="feature-item"><span class="feature-label">Aceita dividir tarefas?</span><span class="feature-value ${vaga.regrasConvivencia.aceitaDividirTarefas ? 'yes' : 'none'}">${vaga.regrasConvivencia.aceitaDividirTarefas ? 'Sim' : 'Não'}</span></div>
          <div class="feature-item"><span class="feature-label">Costuma ter festas?</span><span class="feature-value ${vaga.regrasConvivencia.aceitaFestas ? 'yes' : 'none'}">${vaga.regrasConvivencia.aceitaFestas ? 'Sim' : 'Não'}</span></div>
        `;
      } else {
        featuresGrid.innerHTML = '<p>Regras não informadas.</p>';
      }

    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      document.querySelector('.title-section h1').textContent = 'Erro ao carregar';
      document.querySelector('.description-section p').textContent = error.message;
      document.querySelector('.price-value').textContent = '--';
      document.querySelector('.features-grid').innerHTML = '';
    }
  }

  carregarDetalhes();

  // ==========================================
  // 4. BOTÃO FECHAR MATCH + TOAST DINÂMICO
  // ==========================================
  const btnFecharMatch = document.getElementById('btnFecharMatch');
  
  function mostrarToast() {
    const toast = document.createElement('div');
    toast.className = 'toast-sucesso';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>Parabéns! Seu match foi feito. 🎉</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  if (btnFecharMatch) {
    let matches = JSON.parse(localStorage.getItem('finduhouse_matches') || '[]');

    const atualizarBotaoMatch = () => {
      if (matches.includes(vagaId)) {
        btnFecharMatch.textContent = 'Desfazer match';
        btnFecharMatch.style.background = 'var(--primary-soft)';
        btnFecharMatch.style.color = 'var(--accent)';
        btnFecharMatch.style.border = '2px solid var(--border)';
      } else {
        btnFecharMatch.textContent = 'Fechar match';
        btnFecharMatch.style.background = 'linear-gradient(135deg, var(--primary), var(--accent))';
        btnFecharMatch.style.color = '#fff';
        btnFecharMatch.style.border = 'none';
      }
    };

    atualizarBotaoMatch();

    btnFecharMatch.addEventListener('click', async () => {
      if (!token || !estudanteId) {
        alert('Você precisa estar logado para fechar um match.');
        return;
      }

      // Se já deu match, remove do localStorage (desfaz visualmente)
      if (matches.includes(vagaId)) {
        matches = matches.filter(id => id !== vagaId);
        localStorage.setItem('finduhouse_matches', JSON.stringify(matches));
        atualizarBotaoMatch();
        return;
      }

      // Se não, envia para o backend
      btnFecharMatch.textContent = 'Enviando...';
      btnFecharMatch.disabled = true;

      try {
        const response = await fetch(`http://localhost:8081/api/vagas/${vagaId}/interesse?estudanteId=${estudanteId}`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        });

        if (response.status === 401) {
          alert('Sessão expirada. Faça login novamente.');
          return;
        }

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.mensagem || 'Falha ao registrar interesse');
        }

        // Sucesso
        matches.push(vagaId);
        localStorage.setItem('finduhouse_matches', JSON.stringify(matches));
        mostrarToast();
        
      } catch (error) {
        console.error(error);
        alert(error.message || 'Erro ao fechar match. Tente novamente.');
      } finally {
        btnFecharMatch.disabled = false;
        atualizarBotaoMatch();
      }
    });
  }

  // ==========================================
  // 5. BOTÃO FAVORITAR
  // ==========================================
  const btnFavoritar = document.getElementById('btnFavoritar');
  if (btnFavoritar) {
    let favoritos = JSON.parse(localStorage.getItem('finduhouse_favoritos') || '[]');
    
    if (favoritos.includes(vagaId)) {
      btnFavoritar.classList.add('active');
      btnFavoritar.querySelector('span').textContent = 'Favoritado';
    }

    btnFavoritar.addEventListener('click', () => {
      if (favoritos.includes(vagaId)) {
        favoritos = favoritos.filter(id => id !== vagaId);
        btnFavoritar.classList.remove('active');
        btnFavoritar.querySelector('span').textContent = 'Favoritar';
      } else {
        favoritos.push(vagaId);
        btnFavoritar.classList.add('active');
        btnFavoritar.querySelector('span').textContent = 'Favoritado';
      }
      localStorage.setItem('finduhouse_favoritos', JSON.stringify(favoritos));
    });
  }

  // ==========================================
  // 6. LIGHTBOX (GALERIA)
  // ==========================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const imagens = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200'
  ];
  let indexAtual = 0;

  window.abrirLightbox = function(index) {
    indexAtual = index;
    lightboxImg.src = imagens[indexAtual];
    lightbox.classList.add('active');
  }

  window.fecharLightbox = function() {
    lightbox.classList.remove('active');
  }

  window.mudarFoto = function(dir) {
    indexAtual += dir;
    if (indexAtual < 0) indexAtual = imagens.length - 1;
    if (indexAtual >= imagens.length) indexAtual = 0;
    
    lightboxImg.style.opacity = 0;
    setTimeout(() => {
      lightboxImg.src = imagens[indexAtual];
      lightboxImg.style.opacity = 1;
    }, 150);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) fecharLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') fecharLightbox();
      if (e.key === 'ArrowRight') mudarFoto(1);
      if (e.key === 'ArrowLeft') mudarFoto(-1);
    });
  }
});