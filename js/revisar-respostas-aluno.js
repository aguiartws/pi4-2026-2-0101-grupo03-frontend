document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     ESTRUTURA BASE DAS PERGUNTAS (caso o localStorage esteja vazio)
     ========================================================= */
  const PERGUNTAS_PADRAO = [
    { texto: 'Você aceita barulho depois das 22h durante a semana?' },
    { texto: 'Você fuma?' },
    { texto: 'Você aceita animais de estimação?' },
    { texto: 'Você gosta de receber visitas em casa?' },
    { texto: 'Você gosta de cozinhar em casa?' },
    { texto: 'Você costuma estudar em casa?' },
    { texto: 'Você aceita dividir as tarefas domésticas?' },
    { texto: 'Você aceitaria dividir o quarto com outra pessoa?' },
    { texto: 'Você topa que a casa receba festas de vez em quando?' },
    { texto: 'Você é uma pessoa comunicativa com colegas?' },
  ];

  /* ---------------- Referências do DOM ---------------- */
  const questionsList = document.getElementById('questionsList');
  const sobreMim      = document.getElementById('sobreMim');
  const charCount     = document.getElementById('charCount');
  const btnSalvar     = document.getElementById('btnSalvar');
  const btnVoltar     = document.getElementById('btnVoltar');

  /* ---------------- Estado ---------------- */
  let dadosAtuais = {
    respostas: [],
    sobreMim: ''
  };

  /* =========================================================
     CARREGAR DADOS DO LOCALSTORAGE
     ========================================================= */
  function carregarDados() {
    const salvo = localStorage.getItem('finduhouse_perfil_aluno');

    if (salvo) {
      try {
        dadosAtuais = JSON.parse(salvo);
      } catch (e) {
        console.error("Erro ao ler os dados:", e);
      }
    }

    // Se não houver respostas salvas, usa o padrão para montar a tela
    if (!dadosAtuais.respostas || dadosAtuais.respostas.length === 0) {
      dadosAtuais.respostas = PERGUNTAS_PADRAO.map(p => ({
        pergunta: p.texto,
        resposta: 'sim' // Valor inicial padrão
      }));
    }

    // Preenche o textarea
    sobreMim.value = dadosAtuais.sobreMim || '';
    atualizarContador();
  }

  /* =========================================================
     RENDERIZAR LISTA DE PERGUNTAS
     ========================================================= */
  function renderizarPerguntas() {
    questionsList.innerHTML = '';

    dadosAtuais.respostas.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'question-item';

      const isSim = item.resposta === 'sim';

      div.innerHTML = `
        <span class="question-text">${index + 1}. ${item.pergunta}</span>
        
        <div class="toggle-group">
          <label>
            <input type="radio" name="q${index}" value="sim" ${isSim ? 'checked' : ''}>
            <span class="toggle-btn">Sim</span>
          </label>
          <label>
            <input type="radio" name="q${index}" value="nao" ${!isSim ? 'checked' : ''}>
            <span class="toggle-btn">Não</span>
          </label>
        </div>
      `;

      // Escuta mudanças para atualizar o objeto em memória
      div.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
          dadosAtuais.respostas[index].resposta = e.target.value;
        });
      });

      questionsList.appendChild(div);
    });
  }

  /* =========================================================
     CONTADOR DE CARACTERES
     ========================================================= */
  function atualizarContador() {
    charCount.textContent = `${sobreMim.value.length} / 500`;
  }

  sobreMim.addEventListener('input', atualizarContador);

  /* =========================================================
     AÇÕES DOS BOTÕES
     ========================================================= */
  
  // Salvar Alterações
  btnSalvar.addEventListener('click', () => {
    // Atualiza o texto do "Sobre mim" no objeto
    dadosAtuais.sobreMim = sobreMim.value.trim();

    // Salva de volta no navegador
    localStorage.setItem('finduhouse_perfil_aluno', JSON.stringify(dadosAtuais));

    // Feedback visual e redirecionamento
    alert('Alterações salvas com sucesso!');
    window.location.href = 'perfil-aluno.html';
  });

  // Voltar (sem salvar)
  btnVoltar.addEventListener('click', () => {
    window.location.href = 'perfil-aluno.html';
  });

  /* =========================================================
     INICIALIZAÇÃO
     ========================================================= */
  carregarDados();
  renderizarPerguntas();

});