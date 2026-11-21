
document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin("estudante")) return;

  /* =========================================================
     1. CONFIGURAÇÕES
     ========================================================= */

  const PERGUNTAS = [
    {
      icon: "🔊",
      texto: "Você aceita barulho depois das 22h durante a semana?",
      chave: "aceitaBarulhoDepoisDas22",
    },
    {
      icon: "🚬",
      texto: "Você fuma?",
      chave: "fuma",
    },
    {
      icon: "🐶",
      texto: "Você aceita animais de estimação?",
      chave: "aceitaAnimais",
    },
    {
      icon: "🎉",
      texto: "Você gosta de receber visitas em casa?",
      chave: "gostaReceberVisitas",
    },
    {
      icon: "🍳",
      texto: "Você gosta de cozinhar em casa?",
      chave: "gostaCozinhar",
    },
    {
      icon: "📚",
      texto: "Você costuma estudar em casa?",
      chave: "estudaEmCasa",
    },
    {
      icon: "🧹",
      texto: "Você aceita dividir as tarefas domésticas?",
      chave: "aceitaDividirTarefas",
    },
    {
      icon: "🛏️",
      texto: "Você aceitaria dividir o quarto com outra pessoa?",
      chave: "aceitaDividirQuarto",
    },
    {
      icon: "🎶",
      texto: "Você topa que a casa receba festas de vez em quando?",
      chave: "aceitaFestas",
    },
    {
      icon: "🤝",
      texto: "Você é uma pessoa comunicativa com colegas?",
      chave: "comunicativo",
    },
  ];

  const LIMITE_ARRASTO = 100;
  const MIN_CARACTERES_SOBRE = 10;
  const MAX_CARACTERES_SOBRE = 500;

  /* =========================================================
     2. BARRA LATERAL
     ========================================================= */

  const appLayout = document.getElementById("appLayout");
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener("click", () => {
      appLayout.classList.toggle("collapsed");
    });
  }

  /* =========================================================
     3. REFERÊNCIAS DO DOM
     ========================================================= */

  // Questionário
  const deck = document.getElementById("deck");
  const progressFill = document.getElementById("progressFill");
  const progressLabel = document.getElementById("progressLabel");

  const btnNo = document.getElementById("btnNo");
  const btnYes = document.getElementById("btnYes");

  const introEl = document.getElementById("intro");
  const controlsEl = document.getElementById("controls");

  // Sobre mim
  const aboutMeEl = document.getElementById("aboutMe");
  const sobreMim = document.getElementById("sobreMim");
  const charCount = document.getElementById("charCount");
  const btnFinalizar = document.getElementById("btnFinalizar");

  // Resultado
  const resultEl = document.getElementById("result");
  const resultList = document.getElementById("resultList");
  const resultAbout = document.getElementById("resultAbout");
  const resultAboutTx = document.getElementById("resultAboutText");

  const btnRestart = document.getElementById("btnRestart");
  const btnConfirmar = document.getElementById("btnConfirmar");

  // Voltar (caso exista na página)
  const btnVoltar = document.getElementById("btnVoltar");

  /* =========================================================
     4. VALIDAÇÃO DOS ELEMENTOS
     ========================================================= */

  const elementosObrigatorios = {
    deck,
    progressFill,
    progressLabel,
    btnNo,
    btnYes,
    introEl,
    controlsEl,
    aboutMeEl,
    sobreMim,
    charCount,
    btnFinalizar,
    resultEl,
    resultList,
    resultAbout,
    resultAboutTx,
    btnRestart,
    btnConfirmar,
  };

  const elementosAusentes = Object.entries(elementosObrigatorios)
    .filter(([, elemento]) => !elemento)
    .map(([nome]) => nome);

  if (elementosAusentes.length > 0) {
    console.error(
      "Elementos HTML não encontrados:",
      elementosAusentes
    );

    alert(
      "Não foi possível inicializar o questionário. Verifique o HTML."
    );

    return;
  }

  /* =========================================================
     5. ESTADO
     ========================================================= */

  let indiceAtual = 0;
  let animando = false;
  let sobreMimTexto = "";

  // Cada posição corresponde a uma pergunta.
  // null = ainda não respondida.
  let respostas = PERGUNTAS.map(() => null);

  /* =========================================================
     6. VALIDAÇÃO DA SESSÃO
     ========================================================= */

  function obterEstudanteId() {
    const sessao = obterSessao();
    const estudanteId = sessao && Number(sessao.usuarioId);

    if (
      !sessao ||
      sessao.perfil !== "estudante" ||
      !Number.isInteger(estudanteId) ||
      estudanteId <= 0
    ) {
      alert(
        "Sua sessão de estudante não é válida. Faça login novamente."
      );

      window.location.href = "login.html";
      return null;
    }

    return estudanteId;
  }

  /* =========================================================
     7. CONVERSÃO DAS RESPOSTAS
     ========================================================= */

  function paraResposta(valor) {
    if (valor === true || valor === 1) return "sim";
    if (valor === false || valor === 0) return "nao";

    if (typeof valor === "string") {
      const v = valor.trim().toLowerCase();

      if (["true", "sim", "s", "1"].includes(v)) {
        return "sim";
      }

      if (["false", "nao", "não", "n", "0"].includes(v)) {
        return "nao";
      }
    }

    return null;
  }

  /* =========================================================
     8. MONTAGEM DO PAYLOAD DA API
     ========================================================= */

  function montarPayload(estudanteId) {
    return {
      estudanteId,

      respostas: Object.fromEntries(
        PERGUNTAS.map((pergunta, index) => [
          pergunta.chave,
          respostas[index] === "sim",
        ])
      ),
    };
  }

  /* =========================================================
     9. CARREGAMENTO DO QUESTIONÁRIO PELA API
     ========================================================= */

  async function carregarQuestionario(estudanteId) {
    try {
      const respostaApi = await chamarApi(
        `/estudantes/${encodeURIComponent(estudanteId)}/questionario`
      );

      console.log(
        "Resposta do GET /questionario:",
        respostaApi
      );

      const respostasApi =
        respostaApi?.respostas ||
        respostaApi?.questionario ||
        respostaApi?.data ||
        respostaApi;

      if (
        !respostasApi ||
        typeof respostasApi !== "object"
      ) {
        throw {
          codigo: "DADOS_INVALIDOS",
          message: "Os dados do questionário são inválidos.",
        };
      }

      respostas = PERGUNTAS.map((pergunta) =>
        paraResposta(respostasApi[pergunta.chave])
      );

      const semValor = PERGUNTAS
        .filter((_, index) => respostas[index] === null)
        .map((pergunta) => pergunta.chave);

      if (semValor.length > 0) {
        console.warn(
          "Perguntas sem resposta válida:",
          semValor,
          "Chaves recebidas:",
          Object.keys(respostasApi)
        );
      }

    } catch (erro) {
      const mensagem = mensagemDeErro(erro) || "";

      if (
        erro?.codigo === "QUESTIONARIO_NAO_PREENCHIDO" ||
        mensagem.toLowerCase().includes(
          "ainda não respondeu o questionário"
        )
      ) {
        console.log("Questionário ainda não preenchido.");

        respostas = PERGUNTAS.map(() => null);
        return;
      }

      throw erro;
    }
  }

  /* =========================================================
     10. CARREGAMENTO DO SOBRE MIM PELO CACHE
     ========================================================= */

  function carregarSobreMim() {
    try {
      const cache = localStorage.getItem(
        "finduhouse_perfil_aluno"
      );

      if (cache) {
        const dados = JSON.parse(cache);

        sobreMim.value = dados.sobreMim || "";
        sobreMimTexto = dados.sobreMim || "";
      }

    } catch (erro) {
      console.warn(
        "Erro ao carregar Sobre mim do cache:",
        erro
      );
    }
  }

  /* =========================================================
     11. CARREGAMENTO INICIAL DOS DADOS
     ========================================================= */

  async function carregarDados() {
    const estudanteId = obterEstudanteId();

    if (!estudanteId) return;

    try {
      await carregarQuestionario(estudanteId);

    } catch (erro) {
      console.error(
        "Erro ao carregar questionário:",
        erro
      );

      alert(mensagemDeErro(erro));
    }

    carregarSobreMim();
    atualizarContador();
    criarCartoes();
  }

  /* =========================================================
     12. CRIAÇÃO DOS CARTÕES
     ========================================================= */

  function criarCartoes() {
    deck.innerHTML = "";

    PERGUNTAS.forEach((pergunta, index) => {
      const card = document.createElement("div");

      card.className = "card";
      card.dataset.index = index;

      card.innerHTML = `
        <span class="card__stamp card__stamp--yes">
          SIM
        </span>

        <span class="card__stamp card__stamp--no">
          NÃO
        </span>

        <div class="card__icon">
          ${pergunta.icon}
        </div>

        <h2 class="card__question">
          ${escaparHtml(pergunta.texto)}
        </h2>

        <p class="card__hint">
          Arraste para responder
        </p>
      `;

      deck.appendChild(card);

      configurarArrasto(card);
    });

    atualizarCartoes();
  }

  /* =========================================================
     13. ATUALIZAÇÃO DOS CARTÕES E PROGRESSO
     ========================================================= */

  function atualizarCartoes() {
    const cards = deck.querySelectorAll(".card");

    cards.forEach((card) => {
      if (card.dataset.leaving === "true") return;

      const index = Number(card.dataset.index);
      const posicao = index - indiceAtual;

      if (posicao < 0) {
        card.style.display = "none";

      } else if (posicao === 0) {
        card.style.display = "";
        card.style.transform = "";
        card.style.opacity = "1";
        card.style.zIndex = 100;

        card.classList.add("is-current");

      } else {
        card.style.display = posicao > 2 ? "none" : "";

        card.style.transform =
          `translateY(${posicao * 14}px) scale(${1 - posicao * 0.06})`;

        card.style.opacity = posicao > 2 ? "0" : "1";
        card.style.zIndex = 100 - posicao;

        card.classList.remove("is-current");
      }
    });

    const total = PERGUNTAS.length;

    const porcentagem =
      (Math.min(indiceAtual, total) / total) * 100;

    progressFill.style.width = `${porcentagem}%`;

    progressLabel.textContent =
      indiceAtual < total
        ? `${indiceAtual + 1} / ${total}`
        : `${total} / ${total}`;
  }

  /* =========================================================
     14. FUNCIONALIDADE DE ARRASTAR OS CARTÕES
     ========================================================= */

  function configurarArrasto(card) {
    const stampYes = card.querySelector(
      ".card__stamp--yes"
    );

    const stampNo = card.querySelector(
      ".card__stamp--no"
    );

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let dy = 0;
    let arrastando = false;

    card.addEventListener("pointerdown", (event) => {
      if (
        !card.classList.contains("is-current") ||
        animando
      ) {
        return;
      }

      arrastando = true;

      startX = event.clientX;
      startY = event.clientY;

      dx = 0;
      dy = 0;

      card.classList.add("is-dragging");

      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", (event) => {
      if (!arrastando) return;

      dx = event.clientX - startX;
      dy = event.clientY - startY;

      const rotacao = dx / 20;

      card.style.transform =
        `translate(${dx}px, ${dy}px) rotate(${rotacao}deg)`;

      const opacidade = Math.min(
        Math.abs(dx) / LIMITE_ARRASTO,
        1
      );

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

    card.addEventListener("pointerup", () => {
      if (!arrastando) return;

      arrastando = false;

      card.classList.remove("is-dragging");

      if (dx > LIMITE_ARRASTO) {
        responder("sim");

      } else if (dx < -LIMITE_ARRASTO) {
        responder("nao");

      } else {
        void card.offsetWidth;

        card.style.transform = "";

        stampYes.style.opacity = 0;
        stampNo.style.opacity = 0;
      }
    });

    card.addEventListener("pointercancel", () => {
      if (!arrastando) return;

      arrastando = false;

      card.classList.remove("is-dragging");

      void card.offsetWidth;

      card.style.transform = "";

      stampYes.style.opacity = 0;
      stampNo.style.opacity = 0;
    });
  }

  /* =========================================================
     15. REGISTRO DA RESPOSTA E ANIMAÇÃO
     ========================================================= */

  function responder(resposta) {
    if (animando) return;

    const card = deck.querySelector(".card.is-current");

    if (!card) return;

    animando = true;

    // Salva a resposta na posição correspondente à pergunta.
    respostas[indiceAtual] = resposta;

    const direcao = resposta === "sim" ? 1 : -1;

    const selo = card.querySelector(
      resposta === "sim"
        ? ".card__stamp--yes"
        : ".card__stamp--no"
    );

    selo.style.opacity = "1";

    card.classList.remove("is-current");
    card.classList.remove("is-dragging");

    card.dataset.leaving = "true";
    card.style.pointerEvents = "none";

    card.style.transition = "none";

    void card.offsetWidth;

    card.style.transition =
      "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.45s ease";

    card.style.transform =
      `translate(${direcao * 700}px, 30px) rotate(${direcao * 30}deg)`;

    card.style.opacity = "0";

    indiceAtual++;

    atualizarCartoes();

    setTimeout(() => {
      card.remove();
      animando = false;
    }, 500);

    if (indiceAtual >= PERGUNTAS.length) {
      setTimeout(() => {
        mostrarSobreMim();
      }, 520);
    }
  }

  /* =========================================================
     16. BOTÕES SIM E NÃO
     ========================================================= */

  btnNo.addEventListener("click", () => {
    if (animando) return;

    const card = deck.querySelector(".card.is-current");

    if (!card) return;

    card.querySelector(
      ".card__stamp--no"
    ).style.opacity = "1";

    responder("nao");
  });

  btnYes.addEventListener("click", () => {
    if (animando) return;

    const card = deck.querySelector(".card.is-current");

    if (!card) return;

    card.querySelector(
      ".card__stamp--yes"
    ).style.opacity = "1";

    responder("sim");
  });

  /* =========================================================
     17. TELA SOBRE MIM
     ========================================================= */

  function mostrarSobreMim() {
    deck.style.display = "none";
    introEl.style.display = "none";
    controlsEl.style.display = "none";

    aboutMeEl.classList.add("visible");

    atualizarContador();

    sobreMim.focus();
  }

  function atualizarContador() {
    charCount.textContent =
      `${sobreMim.value.length} / ${MAX_CARACTERES_SOBRE}`;
  }

  sobreMim.addEventListener("input", atualizarContador);

  btnFinalizar.addEventListener("click", () => {
    const texto = sobreMim.value.trim();

    if (texto.length < MIN_CARACTERES_SOBRE) {
      alert(
        `Escreva pelo menos ${MIN_CARACTERES_SOBRE} caracteres sobre você.`
      );

      sobreMim.focus();
      return;
    }

    if (texto.length > MAX_CARACTERES_SOBRE) {
      alert(
        `O campo Sobre mim permite até ${MAX_CARACTERES_SOBRE} caracteres.`
      );

      sobreMim.focus();
      return;
    }

    sobreMimTexto = texto;

    mostrarResultado();
  });

  /* =========================================================
     18. RESULTADO FINAL
     ========================================================= */

  function mostrarResultado() {
    aboutMeEl.classList.remove("visible");

    deck.style.display = "none";
    introEl.style.display = "none";
    controlsEl.style.display = "none";

    resultList.innerHTML = "";

    PERGUNTAS.forEach((pergunta, index) => {
      const li = document.createElement("li");

      const spanPergunta = document.createElement("span");
      spanPergunta.textContent = pergunta.texto;

      const spanResposta = document.createElement("span");

      const resposta = respostas[index];

      spanResposta.className =
        resposta === "sim"
          ? "answer answer--yes"
          : "answer answer--no";

      spanResposta.textContent =
        resposta === "sim" ? "Sim" : "Não";

      li.appendChild(spanPergunta);
      li.appendChild(spanResposta);

      resultList.appendChild(li);
    });

    if (sobreMimTexto) {
      resultAboutTx.textContent = sobreMimTexto;
      resultAbout.hidden = false;

    } else {
      resultAbout.hidden = true;
    }

    resultEl.classList.add("visible");
  }

  /* =========================================================
     19. SALVAR SOBRE MIM NA API
     ========================================================= */

  async function salvarSobreMimApi(texto) {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Token de autenticação não encontrado.");
    }

    const resposta = await fetch(
      "http://localhost:8081/api/usuario/perfil/sobre-mim",
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          sobreMim: texto,
        }),
      }
    );

    if (!resposta.ok) {
      let mensagem = `Erro ${resposta.status}`;

      try {
        const dados = await resposta.json();

        mensagem =
          dados.message ||
          dados.mensagem ||
          mensagem;

      } catch {
        // Mantém a mensagem padrão.
      }

      throw new Error(mensagem);
    }

    return true;
  }

  /* =========================================================
     20. CONFIRMAR CADASTRO E SALVAR NA API
     ========================================================= */

  btnConfirmar.addEventListener("click", async () => {
    if (btnConfirmar.disabled) return;

    const estudanteId = obterEstudanteId();

    if (!estudanteId) return;

    // Verifica se todas as perguntas foram respondidas.
    const faltando = respostas
      .map((resposta, index) =>
        resposta === null ? index + 1 : null
      )
      .filter(Boolean);

    if (faltando.length > 0) {
      alert(
        `Responda todas as perguntas antes de salvar. Faltam: ${faltando.join(", ")}.`
      );

      return;
    }

    const textoSobreMim = sobreMimTexto.trim();

    if (textoSobreMim.length < MIN_CARACTERES_SOBRE) {
      alert(
        `O campo Sobre mim precisa ter pelo menos ${MIN_CARACTERES_SOBRE} caracteres.`
      );

      return;
    }

    if (textoSobreMim.length > MAX_CARACTERES_SOBRE) {
      alert(
        `O campo Sobre mim permite até ${MAX_CARACTERES_SOBRE} caracteres.`
      );

      return;
    }

    // Monta o payload esperado pelo backend.
    const payload = montarPayload(estudanteId);

    console.log("Payload enviado:", payload);

    // Monta os dados para o cache local.
    const dadosCache = {
      respostas: PERGUNTAS.map((pergunta, index) => ({
        pergunta: pergunta.texto,
        resposta: respostas[index],
      })),

      sobreMim: textoSobreMim,
    };

    btnConfirmar.disabled = true;

    const textoOriginal = btnConfirmar.textContent;

    btnConfirmar.textContent = "Salvando...";

    try {
      /* -----------------------------------------
         1. SALVAR QUESTIONÁRIO
         ----------------------------------------- */

      await chamarApi("/questionario/questionario", {
        metodo: "POST",
        corpo: payload,
      });

      console.log("Questionário salvo com sucesso.");

      /* -----------------------------------------
         2. SALVAR SOBRE MIM
         ----------------------------------------- */

      await salvarSobreMimApi(textoSobreMim);

      console.log("Sobre mim salvo com sucesso.");

      /* -----------------------------------------
         3. SALVAR CACHE LOCAL
         ----------------------------------------- */

      localStorage.setItem(
        "finduhouse_perfil_aluno",
        JSON.stringify(dadosCache)
      );

      /* -----------------------------------------
         4. CONFIRMAR E REDIRECIONAR
         ----------------------------------------- */

      alert("Alterações salvas com sucesso!");

      window.location.href = "perfil-aluno.html";

    } catch (erro) {
      console.error(
        "Erro ao salvar alterações:",
        erro
      );

      alert(
        mensagemDeErro(erro) ||
        erro.message ||
        "Não foi possível salvar suas alterações."
      );

    } finally {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = textoOriginal;
    }
  });

  /* =========================================================
     21. REINICIAR QUESTIONÁRIO
     ========================================================= */

  function reiniciar() {
    indiceAtual = 0;
    animando = false;

    respostas = PERGUNTAS.map(() => null);

    sobreMimTexto = "";
    sobreMim.value = "";

    atualizarContador();

    deck.style.display = "";
    introEl.style.display = "";
    controlsEl.style.display = "";

    aboutMeEl.classList.remove("visible");
    resultEl.classList.remove("visible");

    resultAbout.hidden = true;

    criarCartoes();
  }

  btnRestart.addEventListener("click", reiniciar);

  /* =========================================================
     22. BOTÃO VOLTAR
     ========================================================= */

  if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();

      } else {
        window.location.href = "perfil-aluno.html";
      }
    });
  }

  /* =========================================================
     23. INICIALIZAÇÃO
     ========================================================= */

  carregarDados();

});
