document.addEventListener('DOMContentLoaded', () => {
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle && appLayout) sidebarToggle.addEventListener('click', () => appLayout.classList.toggle('collapsed'));

  // 1. Filtros
  const filtroPreco = document.getElementById('filtroPreco');
  const filtroDistancia = document.getElementById('filtroDistancia');
  const cards = document.querySelectorAll('.match-card');

  function aplicarFiltros() {
    const precoMax = Number(filtroPreco.value);
    const distanciaMax = Number(filtroDistancia.value);
    document.getElementById('valorPreco').textContent = `R$ ${precoMax}`;
    document.getElementById('valorDistancia').textContent = `${distanciaMax} km`;

    cards.forEach(card => {
      const preco = Number(card.dataset.preco);
      const distancia = Number(card.dataset.distancia);
      card.style.display = (preco <= precoMax && distancia <= distanciaMax) ? 'flex' : 'none';
    });
  }

  if (filtroPreco) {
    filtroPreco.addEventListener('input', aplicarFiltros);
    filtroDistancia.addEventListener('input', aplicarFiltros);
  }

  // 2. Favoritos
  const botoesCoracao = document.querySelectorAll('.btn-heart');
  let favoritos = JSON.parse(localStorage.getItem('finduhouse_favoritos') || '[]');

  botoesCoracao.forEach(botao => {
    const id = botao.getAttribute('data-id');
    if (favoritos.includes(id)) botao.classList.add('active');

    botao.addEventListener('click', () => {
      if (favoritos.includes(id)) {
        favoritos = favoritos.filter(favId => favId !== id);
        botao.classList.remove('active');
      } else {
        favoritos.push(id);
        botao.classList.add('active');
      }
      localStorage.setItem('finduhouse_favoritos', JSON.stringify(favoritos));
    });
  });
});  