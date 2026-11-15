document.addEventListener('DOMContentLoaded', () => {
  // 1. Sidebar
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));
  }

  const moradiaId = 'casa-1'; // ID fixo para simulação

  // ==========================================
  // 2. BOTÃO FAVORITAR
  // ==========================================
  const btnFavoritar = document.getElementById('btnFavoritar');
  if (btnFavoritar) {
    let favoritos = JSON.parse(localStorage.getItem('finduhouse_favoritos') || '[]');
    
    if (favoritos.includes(moradiaId)) {
      btnFavoritar.classList.add('active');
      btnFavoritar.querySelector('span').textContent = 'Favoritado';
    }

    btnFavoritar.addEventListener('click', () => {
      if (favoritos.includes(moradiaId)) {
        favoritos = favoritos.filter(id => id !== moradiaId);
        btnFavoritar.classList.remove('active');
        btnFavoritar.querySelector('span').textContent = 'Favoritar';
      } else {
        favoritos.push(moradiaId);
        btnFavoritar.classList.add('active');
        btnFavoritar.querySelector('span').textContent = 'Favoritado';
      }
      localStorage.setItem('finduhouse_favoritos', JSON.stringify(favoritos));
    });
  }

  // ==========================================
  // 3. BOTÃO FECHAR MATCH + TOAST DINÂMICO
  // ==========================================
  const btnFecharMatch = document.getElementById('btnFecharMatch');
  
  // Função para criar e exibir o Toast (Notificação flutuante)
  function mostrarToast() {
    // Cria o elemento HTML do toast
    const toast = document.createElement('div');
    toast.className = 'toast-sucesso';
    
    // Ícone de check e o texto
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>Parabéns! Seu match foi feito. 🎉</span>
    `;
    
    document.body.appendChild(toast);
    
    // Pequeno delay para a animação de subida funcionar
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Remove o toast da tela depois de 3.5 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400); // Remove do HTML após a animação de saída
    }, 3500);
  }

  if (btnFecharMatch) {
    let matches = JSON.parse(localStorage.getItem('finduhouse_matches') || '[]');

    const atualizarBotaoMatch = () => {
      if (matches.includes(moradiaId)) {
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

    btnFecharMatch.addEventListener('click', () => {
      if (matches.includes(moradiaId)) {
        matches = matches.filter(id => id !== moradiaId);
      } else {
        matches.push(moradiaId);
        mostrarToast(); // Chama a nova notificação bonita em vez do alert
      }
      
      localStorage.setItem('finduhouse_matches', JSON.stringify(matches));
      atualizarBotaoMatch();
    });
  }

  // ==========================================
  // 4. LIGHTBOX (GALERIA)
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