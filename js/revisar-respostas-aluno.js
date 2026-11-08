document.addEventListener('DOMContentLoaded', () => {
  const PERGUNTAS = [
    { texto: 'Você aceita barulho depois das 22h durante a semana?', chave: 'aceitaBarulhoDepoisDas22' },
    { texto: 'Você fuma?', chave: 'fuma' },
    { texto: 'Você aceita animais de estimação?', chave: 'aceitaAnimais' },
    { texto: 'Você gosta de receber visitas em casa?', chave: 'gostaReceberVisitas' },
    { texto: 'Você gosta de cozinhar em casa?', chave: 'gostaCozinhar' },
    { texto: 'Você costuma estudar em casa?', chave: 'estudaEmCasa' },
    { texto: 'Você aceita dividir as tarefas domésticas?', chave: 'aceitaDividirTarefas' },
    { texto: 'Você aceitaria dividir o quarto com outra pessoa?', chave: 'aceitaDividirQuarto' },
    { texto: 'Você topa que a casa receba festas de vez em quando?', chave: 'aceitaFestas' },
    { texto: 'Você é uma pessoa comunicativa com colegas?', chave: 'comunicativo' }
  ];

  const questionsList = document.getElementById('questionsList');
  const sobreMim = document.getElementById('sobreMim');
  const charCount = document.getElementById('charCount');
  const btnSalvar = document.getElementById('btnSalvar');
  const btnVoltar = document.getElementById('btnVoltar');
  let respostas = [];

  function obterEstudanteId() {
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

  function atualizarContador() {
    charCount.textContent = `${sobreMim.value.length} / 500`;
  }

  function renderizarPerguntas() {
    questionsList.innerHTML = '';

    respostas.forEach((resposta, index) => {
      const div = document.createElement('div');
      div.className = 'question-item';
      const isSim = resposta === 'sim';

      div.innerHTML = `
        <span class="question-text">${index + 1}. ${PERGUNTAS[index].texto}</span>
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

      div.querySelectorAll('input').forEach((input) => {
        input.addEventListener('change', (event) => {
          respostas[index] = event.target.value;
        });
      });
      questionsList.appendChild(div);
    });
  }

  async function carregarDados() {
    const estudanteId = obterEstudanteId();
    if (!estudanteId) return;

    try {
      const respostaApi = await chamarApi(
        `/estudantes/${encodeURIComponent(estudanteId)}/questionario`
      );
      const respostasApi = respostaApi && respostaApi.respostas ? respostaApi.respostas : respostaApi;

      if (!respostasApi || typeof respostasApi !== 'object') {
        throw { codigo: 'DADOS_INVALIDOS' };
      }

      respostas = PERGUNTAS.map((pergunta) => {
        if (typeof respostasApi[pergunta.chave] !== 'boolean') {
          throw { codigo: 'DADOS_INVALIDOS' };
        }
        return respostasApi[pergunta.chave] ? 'sim' : 'nao';
      });

      const cache = localStorage.getItem('finduhouse_perfil_aluno');
      if (cache) {
        try {
          const dadosCache = JSON.parse(cache);
          sobreMim.value = dadosCache.sobreMim || '';
        } catch (erro) {
          console.warn('Não foi possível ler o cache do perfil.', erro);
        }
      }

      atualizarContador();
      renderizarPerguntas();
    } catch (erro) {
      alert(mensagemDeErro(erro));
    }
  }

  sobreMim.addEventListener('input', atualizarContador);

  btnSalvar.addEventListener('click', async () => {
    if (btnSalvar.disabled) return;

    const estudanteId = obterEstudanteId();
    if (!estudanteId) return;

    if (respostas.length !== PERGUNTAS.length ||
        respostas.some((resposta) => !['sim', 'nao'].includes(resposta))) {
      alert('Não foi possível identificar todas as respostas.');
      return;
    }

    const respostasApi = Object.fromEntries(
      PERGUNTAS.map((pergunta, index) => [
        pergunta.chave,
        respostas[index] === 'sim'
      ])
    );
    const dadosCache = {
      respostas: PERGUNTAS.map((pergunta, index) => ({
        pergunta: pergunta.texto,
        resposta: respostas[index]
      })),
      sobreMim: sobreMim.value.trim()
    };

    btnSalvar.disabled = true;
    try {
      await chamarApi('/questionario/questionario', {
        metodo: 'POST',
        corpo: { estudanteId, respostas: respostasApi }
      });

      localStorage.setItem('finduhouse_perfil_aluno', JSON.stringify(dadosCache));
      alert('Alterações salvas com sucesso!');
      window.location.href = 'perfil-aluno.html';
    } catch (erro) {
      alert(mensagemDeErro(erro));
    } finally {
      btnSalvar.disabled = false;
    }
  });

  btnVoltar.addEventListener('click', () => {
    window.location.href = 'perfil-aluno.html';
  });

  carregarDados();
});
