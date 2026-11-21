document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin("estudante")) return;

  // 1. Lógica da barra lateral retrátil
  const appLayout = document.getElementById("appLayout");
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener("click", () =>
      appLayout.classList.toggle("collapsed"),
    );
  }

  const PERGUNTAS = [
    {
      texto: "Você aceita barulho depois das 22h durante a semana?",
      chave: "aceitaBarulhoDepoisDas22",
    },
    { texto: "Você fuma?", chave: "fuma" },
    { texto: "Você aceita animais de estimação?", chave: "aceitaAnimais" },
    {
      texto: "Você gosta de receber visitas em casa?",
      chave: "gostaReceberVisitas",
    },
    { texto: "Você gosta de cozinhar em casa?", chave: "gostaCozinhar" },
    { texto: "Você costuma estudar em casa?", chave: "estudaEmCasa" },
    {
      texto: "Você aceita dividir as tarefas domésticas?",
      chave: "aceitaDividirTarefas",
    },
    {
      texto: "Você aceitaria dividir o quarto com outra pessoa?",
      chave: "aceitaDividirQuarto",
    },
    {
      texto: "Você topa que a casa receba festas de vez em quando?",
      chave: "aceitaFestas",
    },
    {
      texto: "Você é uma pessoa comunicativa com colegas?",
      chave: "comunicativo",
    },
  ];

  const questionsList = document.getElementById("questionsList");
  const sobreMim = document.getElementById("sobreMim");
  const charCount = document.getElementById("charCount");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnVoltar = document.getElementById("btnVoltar");

  // null = ainda sem resposta
  let respostas = PERGUNTAS.map(() => null);

  // Valida a sessão do estudante
  function obterEstudanteId() {
    const sessao = obterSessao();
    const estudanteId = sessao && Number(sessao.usuarioId);

    if (
      !sessao ||
      sessao.perfil !== "estudante" ||
      !Number.isInteger(estudanteId) ||
      estudanteId <= 0
    ) {
      alert("Sua sessão de estudante não é válida. Faça login novamente.");
      window.location.href = "login.html";
      return null;
    }

    return estudanteId;
  }

  // Monta o payload enviado para POST /questionario
  // Exemplo: { estudanteId: 44, respostas: { fuma: false, aceitaAnimais: true, ... } }
  function montarPayload(estudanteId) {
    return {
      estudanteId,
      respostas: Object.fromEntries(
        PERGUNTAS.map((pergunta, index) => [
          pergunta.chave,
          respostas[index] === "sim",
        ]),
      ),
    };
  }

  // Aceita true/false, "true"/"false", "sim"/"nao", 1/0
  function paraResposta(valor) {
    if (valor === true || valor === 1) return "sim";
    if (valor === false || valor === 0) return "nao";
    if (typeof valor === "string") {
      const v = valor.trim().toLowerCase();
      if (["true", "sim", "s", "1"].includes(v)) return "sim";
      if (["false", "nao", "não", "n", "0"].includes(v)) return "nao";
    }
    return null;
  }

  // Usa o mesmo chamarApi do perfil (mesma base de URL e mesmo token)
  async function salvarSobreMimApi(texto) {
    await chamarApi("/usuario/perfil/sobre-mim", {
      metodo: "PATCH",
      corpo: { sobreMim: texto },
    });
  }

  function atualizarContador() {
    charCount.textContent = `${sobreMim.value.length} / 500`;
  }

  function renderizarPerguntas() {
    questionsList.innerHTML = "";

    PERGUNTAS.forEach((pergunta, index) => {
      const resposta = respostas[index];
      const div = document.createElement("div");
      div.className = "question-item";

      div.innerHTML = `
        <span class="question-text">${escaparHtml(index + 1)}. ${escaparHtml(pergunta.texto)}</span>
        <div class="toggle-group">
          <label>
            <input type="radio" name="q${index}" value="sim" ${resposta === "sim" ? "checked" : ""}>
            <span class="toggle-btn">Sim</span>
          </label>
          <label>
            <input type="radio" name="q${index}" value="nao" ${resposta === "nao" ? "checked" : ""}>
            <span class="toggle-btn">Não</span>
          </label>
        </div>
      `;

      div.querySelectorAll("input").forEach((input) => {
        input.addEventListener("change", (event) => {
          respostas[index] = event.target.value;
        });
      });

      questionsList.appendChild(div);
    });
  }

  // CARREGA OS DADOS DA API

  async function carregarQuestionario(estudanteId, perfil) {
    try {
      const respostaApi = await chamarApi(
        `/estudantes/${encodeURIComponent(estudanteId)}/questionario`,
      );
      console.log("Resposta do GET /questionario:", respostaApi);

      const respostasApi =
        respostaApi?.respostas ||
        respostaApi?.questionario ||
        respostaApi?.data ||
        respostaApi;

      if (!respostasApi || typeof respostasApi !== "object") {
        throw { codigo: "DADOS_INVALIDOS" };
      }

      respostas = PERGUNTAS.map((pergunta) =>
        paraResposta(respostasApi[pergunta.chave]),
      );

      const semValor = PERGUNTAS.filter((_, i) => respostas[i] === null).map(
        (pergunta) => pergunta.chave,
      );
      if (semValor.length > 0) {
        console.warn(
          "Chaves não encontradas ou com valor inválido na resposta da API:",
          semValor,
          "| Chaves recebidas:",
          Object.keys(respostasApi),
        );
      }
    } catch (erro) {
      // Questionário ainda não preenchido: segue com tudo em branco
      if (
        erro?.codigo === "QUESTIONARIO_NAO_PREENCHIDO" ||
        mensagemDeErro(erro)?.includes("ainda não respondeu o questionário")
      ) {
        const doPerfil = perfil?.questionario || perfil?.respostas;
        respostas = PERGUNTAS.map((pergunta) =>
          paraResposta(doPerfil ? doPerfil[pergunta.chave] : null),
        );
        return;
      }
      throw erro;
    }
  }

  // Busca o perfil na mesma rota usada pela tela "Meu perfil"
  async function carregarPerfil() {
    try {
      const perfil = await chamarApi("/usuario/perfil");
      console.log("Resposta do GET /usuario/perfil:", perfil);
      return perfil;
    } catch (erro) {
      console.warn("Não foi possível carregar o perfil pela API:", erro);
      return null;
    }
  }

  function preencherSobreMim(perfil) {
    const textoApi = perfil?.sobreMim ?? perfil?.sobre_mim;
    if (typeof textoApi === "string") {
      sobreMim.value = textoApi;
      return;
    }

    // Reserva: cache local
    try {
      const cache = localStorage.getItem("finduhouse_perfil_aluno");
      if (cache) sobreMim.value = JSON.parse(cache).sobreMim || "";
    } catch (erro) {
      console.warn("Erro ao ler cache do perfil:", erro);
    }
  }

  async function carregarDados() {
    const estudanteId = obterEstudanteId();
    if (!estudanteId) return;

    const perfil = await carregarPerfil();

    try {
      await carregarQuestionario(estudanteId, perfil);
    } catch (erro) {
      alert(mensagemDeErro(erro));
    }

    preencherSobreMim(perfil);

    atualizarContador();
    renderizarPerguntas();
  }

  sobreMim.addEventListener("input", atualizarContador);

  btnSalvar.addEventListener("click", async () => {
    if (btnSalvar.disabled) return;

    const estudanteId = obterEstudanteId();
    if (!estudanteId) return;

    // Lê as respostas marcadas direto na tela
    respostas = PERGUNTAS.map((_, index) => {
      const marcado = document.querySelector(`input[name="q${index}"]:checked`);
      return marcado ? marcado.value : null;
    });

    const faltando = respostas
      .map((resposta, index) => (resposta === null ? index + 1 : null))
      .filter(Boolean);

    if (faltando.length > 0) {
      alert(
        `Responda todas as perguntas antes de salvar. Faltam: ${faltando.join(", ")}.`,
      );
      return;
    }

    const textoSobreMim = sobreMim.value.trim();

    // Monta o payload do questionário
    const payload = montarPayload(estudanteId);
    console.log("Payload enviado:", payload);

    const dadosCache = {
      respostas: PERGUNTAS.map((pergunta, index) => ({
        pergunta: pergunta.texto,
        resposta: respostas[index],
      })),
      sobreMim: textoSobreMim,
    };

    btnSalvar.disabled = true;

    try {
      // Salva as respostas do questionário
      // Se der 404 aqui, o endpoint provavelmente é só "/questionario"
      await chamarApi("/questionario/questionario", {
        metodo: "POST",
        corpo: payload,
      });

      // Salva o Sobre mim no perfil do estudante
      let sobreMimSalvo = true;
      try {
        await salvarSobreMimApi(textoSobreMim);
      } catch (erroPerfil) {
        sobreMimSalvo = false;
        console.error("Erro ao salvar Sobre mim:", erroPerfil);
      }

      // Cache local (mantém o Sobre mim mesmo se a API falhar)
      localStorage.setItem(
        "finduhouse_perfil_aluno",
        JSON.stringify(dadosCache),
      );

      if (!sobreMimSalvo) {
        alert(
          "Suas respostas foram salvas, mas não foi possível salvar o 'Sobre mim' no servidor.",
        );
        return;
      }

      alert("Alterações salvas com sucesso!");

      window.location.href = "perfil-aluno.html";
    } catch (erro) {
      console.error("Erro ao salvar alterações:", erro);
      alert(mensagemDeErro(erro));
    } finally {
      btnSalvar.disabled = false;
    }
  });

  // BOTÃO VOLTAR INTELIGENTE (Volta para a última tela ou para o perfil)
  btnVoltar.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "perfil-aluno.html";
    }
  });

  // Inicializa
  carregarDados();
});