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
  // 4. ESTADO REAL (BANCO) DE FAVORITO E MATCH
  // ==========================================
  const btnFecharMatch = document.getElementById('btnFecharMatch');
  const btnFavoritar = document.getElementById('btnFavoritar');
  const vagaIdNum = Number(vagaId);

  // Fonte da verdade = banco. Nada de localStorage.
  const estado = { favorito: false, match: false };

  function mostrarToast(texto) {
    const toast = document.createElement('div');
    toast.className = 'toast-sucesso';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${escaparHtml(texto)}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  function pintarFavorito() {
    if (!btnFavoritar) return;
    btnFavoritar.classList.toggle('active', estado.favorito);
    btnFavoritar.querySelector('span').textContent = estado.favorito ? 'Favoritado' : 'Favoritar';
  }

  function pintarMatch() {
    if (!btnFecharMatch) return;
    if (estado.match) {
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
  }

  // Busca no backend se esta vaga já está nos favoritos / matches do aluno
  async function carregarEstadoInicial() {
    if (!token || !estudanteId) return;

    // desabilita enquanto não sabe o estado, para não clicar errado
    if (btnFavoritar) btnFavoritar.disabled = true;
    if (btnFecharMatch) btnFecharMatch.disabled = true;

    const [resFav, resMatch] = await Promise.allSettled([
      chamarApi(`/favoritos?estudanteId=${encodeURIComponent(estudanteId)}`),
      chamarApi(`/vagas/meus-matches?estudanteId=${encodeURIComponent(estudanteId)}`)
    ]);

    if (resFav.status === 'fulfilled') {
      const lista = Array.isArray(resFav.value) ? resFav.value : (resFav.value?.favoritos || []);
      estado.favorito = lista.some(f => Number(f.id) === vagaIdNum);
    } else {
      console.warn('Não foi possível carregar favoritos:', resFav.reason);
    }

    if (resMatch.status === 'fulfilled') {
      const lista = resMatch.value?.matches || [];
      estado.match = lista.some(m => Number(m.vagaId) === vagaIdNum);
    } else {
      console.warn('Não foi possível carregar matches:', resMatch.reason);
    }

    pintarFavorito();
    pintarMatch();
    if (btnFavoritar) btnFavoritar.disabled = false;
    if (btnFecharMatch) btnFecharMatch.disabled = false;
  }

  carregarEstadoInicial();
  window.addEventListener('pageshow', (e) => { if (e.persisted) carregarEstadoInicial(); });

  // ==========================================
  // 5. BOTÃO FECHAR / DESFAZER MATCH
  // ==========================================
  if (btnFecharMatch) {
    btnFecharMatch.addEventListener('click', async () => {
      if (!token || !estudanteId) {
        alert('Você precisa estar logado para fechar um match.');
        return;
      }

      const caminho = `/vagas/${encodeURIComponent(vagaId)}/interesse?estudanteId=${encodeURIComponent(estudanteId)}`;
      const desfazendo = estado.match;

      btnFecharMatch.textContent = 'Enviando...';
      btnFecharMatch.disabled = true;

      try {
        await chamarApi(caminho, { metodo: desfazendo ? 'DELETE' : 'POST' });
        estado.match = !desfazendo;
        if (!desfazendo) mostrarToast('Parabéns! Seu match foi feito. 🎉');
      } catch (error) {
        console.error(error);
        if (error.codigo === 'INTERESSE_JA_REGISTRADO') {
          estado.match = true; // o banco já tinha; só sincroniza a tela
        } else {
          alert(mensagemDeErro(error));
        }
      } finally {
        btnFecharMatch.disabled = false;
        pintarMatch();
      }
    });
  }

  // ==========================================
  // 6. BOTÃO FAVORITAR / DESFAVORITAR
  // ==========================================
  if (btnFavoritar) {
    btnFavoritar.addEventListener('click', async () => {
      if (!token || !estudanteId) {
        alert('Você precisa estar logado para favoritar.');
        return;
      }

      const desfavoritando = estado.favorito;
      btnFavoritar.querySelector('span').textContent = 'Salvando...';
      btnFavoritar.disabled = true;

      try {
        if (desfavoritando) {
          await chamarApi(
            `/favoritos/${encodeURIComponent(vagaId)}?estudanteId=${encodeURIComponent(estudanteId)}`,
            { metodo: 'DELETE' }
          );
          estado.favorito = false;
        } else {
          await chamarApi('/favoritos', {
            metodo: 'POST',
            corpo: { estudanteId: Number(estudanteId), vagaId: vagaIdNum }
          });
          estado.favorito = true;
        }
      } catch (error) {
        console.error(error);
        if (error.codigo === 'VAGA_JA_FAVORITADA') {
          estado.favorito = true; // o banco já tinha; só sincroniza a tela
        } else {
          alert(mensagemDeErro(error));
        }
      } finally {
        btnFavoritar.disabled = false;
        pintarFavorito();
      }
    });
  }

  // ==========================================
  // 7. LIGHTBOX (GALERIA)
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