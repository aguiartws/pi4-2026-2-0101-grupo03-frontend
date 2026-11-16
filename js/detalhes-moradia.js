document.addEventListener('DOMContentLoaded', () => {
  if (!exigirLogin("estudante")) return;

  // 1. Sidebar
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));
  }

  // 2. Pega o ID da URL
  const urlParams = new URLSearchParams(window.location.search);
  const vagaId = urlParams.get('id') || '1';
  const sessao = obterSessao();
  const token = sessao.token;
  const estudanteId = sessao.usuarioId;

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
      const vaga = await chamarApi(`/vagas/${encodeURIComponent(vagaId)}`);
      renderizarGaleria(Array.isArray(vaga.fotos) ? vaga.fotos : []);

      // Atualiza o título da página e os dados no HTML
      document.title = `${vaga.titulo} | FindUHouse`;
      document.querySelector('.title-section h1').textContent = vaga.titulo;
      document.querySelector('.location').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${escaparHtml(vaga.endereco)}
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
      document.querySelector('.description-section p').textContent = error.mensagem || error.message || 'Não foi possível carregar os detalhes.';
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
        await chamarApi(`/vagas/${encodeURIComponent(vagaId)}/interesse?estudanteId=${encodeURIComponent(estudanteId)}`, {
          metodo: 'POST'
        });

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
    // ==========================================
  // 5. BOTÃO FAVORITAR (INTEGRADO COM O BANCO)
  // ==========================================
  const btnFavoritar = document.getElementById('btnFavoritar');
  
  if (btnFavoritar) {
    // Verifica se já está favoritado (podemos checar na API ou só assumir que não)
    // Para simplificar, vamos apenas deixar o visual para depois de clicar.

    btnFavoritar.addEventListener('click', async () => {
      if (!token || !estudanteId) {
        alert('Você precisa estar logado para favoritar.');
        return;
      }

      // Se o botão já está ativo, significa que o usuário quer remover (mas vamos apenas avisar que precisa de delete)
      if (btnFavoritar.classList.contains('active')) {
        // Aqui entraria o DELETE /api/favoritos/{id}, mas como não existe, vamos remover só do visual
        btnFavoritar.classList.remove('active');
        btnFavoritar.querySelector('span').textContent = 'Favoritar';
        alert('Favorito removido da tela (Implementar DELETE no backend para remover do banco).');
        return;
      }

      btnFavoritar.querySelector('span').textContent = 'Salvando...';
      btnFavoritar.disabled = true;

      try {
        await chamarApi("/favoritos", {
          metodo: 'POST',
          corpo: {
            estudanteId: estudanteId,
            vagaId: vagaId
          }
        });
        btnFavoritar.classList.add('active');
        btnFavoritar.querySelector('span').textContent = 'Favoritado';
        
      } catch (error) {
        console.error(error);
        if (error.codigo === 'VAGA_JA_FAVORITADA') {
          alert('Esta vaga já está nos seus favoritos!');
        } else {
          alert(mensagemDeErro(error));
        }
        btnFavoritar.querySelector('span').textContent = 'Favoritar';
      } finally {
        btnFavoritar.disabled = false;
      }
    });
  }

  // ==========================================
  // 6. LIGHTBOX (GALERIA)
  // ==========================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const PLACEHOLDER_FOTO = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200';
  let imagens = [PLACEHOLDER_FOTO];
  let indexAtual = 0;

  function renderizarGaleria(fotos) {
    imagens = fotos
      .map((foto) => urlImagemSegura(foto, ''))
      .filter(Boolean);
    if (imagens.length === 0) imagens = [PLACEHOLDER_FOTO];

    const galeria = document.querySelector(".gallery");
    const laterais = document.createElement("div");
    laterais.className = "side-photos";

    imagens.forEach((foto, index) => {
      const elemento = document.createElement("div");
      elemento.className = index === 0 ? "main-photo" : "photo";
      elemento.style.backgroundImage = `url("${foto}")`;
      elemento.addEventListener("click", () => window.abrirLightbox(index));

      const teste = new Image();
      teste.onerror = () => {
        elemento.style.backgroundImage = `url("${PLACEHOLDER_FOTO}")`;
      };
      teste.src = foto;

      if (index === 0) {
        galeria.replaceChildren(elemento, laterais);
      } else {
        laterais.appendChild(elemento);
      }
    });
  }

  window.abrirLightbox = function(index) {
    indexAtual = Math.max(0, Math.min(index, imagens.length - 1));
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

  lightboxImg.addEventListener("error", () => {
    lightboxImg.src = PLACEHOLDER_FOTO;
  });

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