document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     LISTA DE PERGUNTAS
     ========================================================= */
  const PERGUNTAS = [
    { icon: '🔊', texto: 'Você aceita barulho depois das 22h durante a semana?', chave: 'aceitaBarulhoDepoisDas22' },
    { icon: '🚬', texto: 'Você fuma?', chave: 'fuma' },
    { icon: '🐶', texto: 'Você aceita animais de estimação?', chave: 'aceitaAnimais' },
    { icon: '🎉', texto: 'Você gosta de receber visitas em casa?', chave: 'gostaReceberVisitas' },
    { icon: '🍳', texto: 'Você gosta de cozinhar em casa?', chave: 'gostaCozinhar' },
    { icon: '📚', texto: 'Você costuma estudar em casa?', chave: 'estudaEmCasa' },
    { icon: '🧹', texto: 'Você aceita dividir as tarefas domésticas?', chave: 'aceitaDividirTarefas' },
    { icon: '🛏️', texto: 'Você aceitaria dividir o quarto com outra pessoa?', chave: 'aceitaDividirQuarto' },
    { icon: '🎶', texto: 'Você topa que a casa receba festas de vez em quando?', chave: 'aceitaFestas' },
    { icon: '🤝', texto: 'Você é uma pessoa comunicativa com colegas?', chave: 'comunicativo' },
  ];

  const LIMITE_ARRASTO = 100;
  const MIN_CARACTERES_SOBRE = 10;

  /* ---------------- Referências do DOM ---------------- */
  const deck          = document.getElementById('deck');
  const progressFill  = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const btnNo         = document.getElementById('btnNo');
  const btnYes        = document.getElementById('btnYes');
  const introEl       = document.getElementById('intro');
  const controlsEl    = document.getElementById('controls');

  const aboutMeEl     = document.getElementById('aboutMe');
  const sobreMim      = document.getElementById('sobreMim');
  const charCount     = document.getElementById('charCount');
  const btnFinalizar  = document.getElementById('btnFinalizar');

  const resultEl      = document.getElementById('result');
  const resultList    = document.getElementById('resultList');
  const resultAbout   = document.getElementById('resultAbout');
  const resultAboutTx = document.getElementById('resultAboutText');
  const btnRestart    = document.getElementById('btnRestart');
  const btnConfirmar  = document.getElementById('btnConfirmar');

  /* ---------------- Estado ---------------- */
  let indiceAtual   = 0;
  let animando      = false;
  let sobreMimTexto = '';
  const respostas   = [];

  function obterSessaoEstudante() {
    const sessao = obterSessao();
    const estudanteId = sessao && Number(sessao.usuarioId);

    if (!sessao || sessao.perfil !== 'estudante' ||
        !Number.isInteger(estudanteId) || estudanteId <= 0) {
      alert('Sua sessão de estudante não é válida. Faça login novamente.');
      window.location.href = 'login.html';
      return null;
    }

    return estudanteId;
  }

  /* =========================================================
     CRIAÇÃO DOS CARTÕES
     ========================================================= */
  function criarCartoes() {
    deck.innerHTML = '';

    PERGUNTAS.forEach((pergunta, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.index = i;

      card.innerHTML = `
        <span class="card__stamp card__stamp--yes">SIM</span>
        <span class="card__stamp card__stamp--no">NÃO</span>
        <div class="card__icon">${pergunta.icon}</div>
        <h2 class="card__question">${pergunta.texto}</h2>
        <p class="card__hint">Arraste para responder</p>
      `;

      deck.appendChild(card);
      configurarArrasto(card);
    });

    atualizarCartoes();
  }

  /* =========================================================
     ATUALIZA POSIÇÕES DO BARALHO E DO PROGRESSO
     ========================================================= */
  function atualizarCartoes() {
    const cards = deck.querySelectorAll('.card');

    cards.forEach((card) => {
      if (card.dataset.leaving === 'true') return;

      const i = Number(card.dataset.index);
      const posicao = i - indiceAtual;

      if (posicao < 0) {
        card.style.display = 'none';
      } else if (posicao === 0) {
        card.style.display = '';
        card.style.transform = '';
        card.style.opacity = '1';
        card.style.zIndex = 100;
        card.classList.add('is-current');
      } else {
        card.style.display = posicao > 2 ? 'none' : '';
        card.style.transform =
          `translateY(${posicao * 14}px) scale(${1 - posicao * 0.06})`;
        card.style.opacity = posicao > 2 ? '0' : '1';
        card.style.zIndex = 100 - posicao;
        card.classList.remove('is-current');
      }
    });

    const total = PERGUNTAS.length;
    const pct = (Math.min(indiceAtual, total) / total) * 100;
    progressFill.style.width = `${pct}%`;

    progressLabel.textContent =
      indiceAtual < total
        ? `${indiceAtual + 1} / ${total}`
        : `${total} / ${total}`;
  }

  /* =========================================================
     ARRASTO (pointer events)
     ========================================================= */
  function configurarArrasto(card) {
    const stampYes = card.querySelector('.card__stamp--yes');
    const stampNo  = card.querySelector('.card__stamp--no');

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let arrastando = false;

    card.addEventListener('pointerdown', (e) => {
      if (!card.classList.contains('is-current') || animando) return;

      arrastando = true;
      startX = e.clientX;
      startY = e.clientY;
      dx = 0;
      dy = 0;

      card.classList.add('is-dragging');
      card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
      if (!arrastando) return;

      dx = e.clientX - startX;
      dy = e.clientY - startY;

      const rotacao = dx / 20;
      card.style.transform =
        `translate(${dx}px, ${dy}px) rotate(${rotacao}deg)`;

      const opacidade = Math.min(Math.abs(dx) / LIMITE_ARRASTO, 1);
      if (dx > 0) {
        stampYes.style.opacity = opacidade;
        stampNo.style.opacity = 0;
      } else if (dx < 0) {
        stampNo.style.opacity = opacidade;
        stampYes.style.opacity = 0;
      } else {
        stampYes.style.opacity = 0;
        stampNo.style.opacity = 0;
      }
    });

    card.addEventListener('pointerup', () => {
      if (!arrastando) return;
      arrastando = false;
      card.classList.remove('is-dragging');

      if (dx > LIMITE_ARRASTO) {
        responder('sim');
      } else if (dx < -LIMITE_ARRASTO) {
        responder('nao');
      } else {
        void card.offsetWidth;
        card.style.transform = '';
        stampYes.style.opacity = 0;
        stampNo.style.opacity = 0;
      }
    });

    card.addEventListener('pointercancel', () => {
      if (!arrastando) return;
      arrastando = false;
      card.classList.remove('is-dragging');
      void card.offsetWidth;
      card.style.transform = '';
      stampYes.style.opacity = 0;
      stampNo.style.opacity = 0;
    });
  }

  /* =========================================================
     REGISTRA RESPOSTA E ANIMA O CARTÃO
     ========================================================= */
  function responder(resposta) {
    if (animando) return;

    const card = deck.querySelector('.card.is-current');
    if (!card) return;

    animando = true;

    respostas.push({
      pergunta: PERGUNTAS[indiceAtual].texto,
      resposta,
    });

    const direcao = resposta === 'sim' ? 1 : -1;

    const selo = card.querySelector(
      resposta === 'sim' ? '.card__stamp--yes' : '.card__stamp--no'
    );
    selo.style.opacity = '1';

    card.classList.remove('is-current');
    card.classList.remove('is-dragging');
    card.dataset.leaving = 'true';
    card.style.pointerEvents = 'none';

    card.style.transition = 'none';
    void card.offsetWidth;

    card.style.transition =
      'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.45s ease';
    card.style.transform =
      `translate(${direcao * 700}px, 30px) rotate(${direcao * 30}deg)`;
    card.style.opacity = '0';

    indiceAtual++;
    atualizarCartoes();

    setTimeout(() => {
      card.remove();
      animando = false;
    }, 500);

    if (indiceAtual >= PERGUNTAS.length) {
      setTimeout(mostrarSobreMim, 520);
    }
  }

  /* =========================================================
     TELA "SOBRE MIM"
     ========================================================= */
  function mostrarSobreMim() {
    deck.style.display = 'none';
    introEl.style.display = 'none';
    controlsEl.style.display = 'none';

    aboutMeEl.classList.add('visible');
    atualizarContador();
    sobreMim.focus();
  }

  function atualizarContador() {
    charCount.textContent = `${sobreMim.value.length} / 500`;
  }

  sobreMim.addEventListener('input', atualizarContador);

  btnFinalizar.addEventListener('click', () => {
    const texto = sobreMim.value.trim();

    if (texto.length < MIN_CARACTERES_SOBRE) {
      alert(`Escreva pelo menos ${MIN_CARACTERES_SOBRE} caracteres sobre você.`);
      sobreMim.focus();
      return;
    }

    sobreMimTexto = texto;
    mostrarResultado();
  });

  /* =========================================================
     RESULTADO FINAL
     ========================================================= */
  function mostrarResultado() {
    aboutMeEl.classList.remove('visible');
    deck.style.display = 'none';
    introEl.style.display = 'none';
    controlsEl.style.display = 'none';

    resultList.innerHTML = '';
    respostas.forEach((r) => {
      const li = document.createElement('li');
      const classe = r.resposta === 'sim' ? 'yes' : 'no';
      const texto  = r.resposta === 'sim' ? 'Sim' : 'Não';

      li.innerHTML = `
        <span>${r.pergunta}</span>
        <span class="answer answer--${classe}">${texto}</span>
      `;
      resultList.appendChild(li);
    });

    if (sobreMimTexto) {
      resultAboutTx.textContent = sobreMimTexto;
      resultAbout.hidden = false;
    } else {
      resultAbout.hidden = true;
    }

    resultEl.classList.add('visible');
  }

  /* =========================================================
     REINICIAR TUDO
     ========================================================= */
  function reiniciar() {
    indiceAtual = 0;
    animando = false;
    respostas.length = 0;
    sobreMimTexto = '';
    sobreMim.value = '';
    atualizarContador();

    deck.style.display = '';
    introEl.style.display = '';
    controlsEl.style.display = '';
    aboutMeEl.classList.remove('visible');
    resultEl.classList.remove('visible');
    resultAbout.hidden = true;

    criarCartoes();
  }

  /* =========================================================
     BOTÕES SIM / NÃO
     ========================================================= */
  btnNo.addEventListener('click', () => {
    if (animando) return;
    const card = deck.querySelector('.card.is-current');
    if (!card) return;

    card.querySelector('.card__stamp--no').style.opacity = '1';
    responder('nao');
  });

  btnYes.addEventListener('click', () => {
    if (animando) return;
    const card = deck.querySelector('.card.is-current');
    if (!card) return;

    card.querySelector('.card__stamp--yes').style.opacity = '1';
    responder('sim');
  });

  btnRestart.addEventListener('click', reiniciar);

  /* =========================================================
     CONFIRMAR CADASTRO E SALVAR
     ========================================================= */
  btnConfirmar.addEventListener('click', async () => {
    if (btnConfirmar.disabled) return;

    const estudanteId = obterSessaoEstudante();
    if (!estudanteId) return;

    if (respostas.length !== PERGUNTAS.length ||
        respostas.some((resposta) => !['sim', 'nao'].includes(resposta.resposta))) {
      alert('Responda todas as perguntas antes de continuar.');
      return;
    }

    // Junta os dados do questionário
    const dadosFinais = {
      respostas: respostas,
      sobreMim: sobreMimTexto
    };

    const respostasApi = Object.fromEntries(
      PERGUNTAS.map((pergunta, index) => [
        pergunta.chave,
        respostas[index].resposta === 'sim'
      ])
    );

    btnConfirmar.disabled = true;

    try {
      await chamarApi('/questionario/questionario', {
        metodo: 'POST',
        corpo: { estudanteId, respostas: respostasApi }
      });

      localStorage.setItem('finduhouse_perfil_aluno', JSON.stringify(dadosFinais));
      alert('Questionário salvo com sucesso!');
      window.location.href = 'perfil-aluno.html';
    } catch (erro) {
      alert(mensagemDeErro(erro));
    } finally {
      btnConfirmar.disabled = false;
    }
  });

  /* ---------------- Inicialização ---------------- */
  criarCartoes();
});