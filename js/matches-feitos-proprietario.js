document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin("proprietario")) return;

  const appLayout = document.getElementById("appLayout");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const grid = document.getElementById("matchesGrid");

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener("click", () => {
      appLayout.classList.toggle("collapsed");
      const isCollapsed = appLayout.classList.contains("collapsed");
      sidebarToggle.setAttribute(
        "aria-label",
        isCollapsed ? "Expandir menu" : "Recolher menu",
      );
    });
  }

  // Perguntas do questionário (mesmas chaves usadas pela API)
  const PERGUNTAS = [
    {
      texto: "Aceita barulho depois das 22h durante a semana?",
      chave: "aceitaBarulhoDepoisDas22",
    },
    { texto: "Fuma?", chave: "fuma" },
    { texto: "Aceita animais de estimação?", chave: "aceitaAnimais" },
    { texto: "Gosta de receber visitas em casa?", chave: "gostaReceberVisitas" },
    { texto: "Gosta de cozinhar em casa?", chave: "gostaCozinhar" },
    { texto: "Costuma estudar em casa?", chave: "estudaEmCasa" },
    {
      texto: "Aceita dividir as tarefas domésticas?",
      chave: "aceitaDividirTarefas",
    },
    {
      texto: "Aceitaria dividir o quarto com outra pessoa?",
      chave: "aceitaDividirQuarto",
    },
    {
      texto: "Topa que a casa receba festas de vez em quando?",
      chave: "aceitaFestas",
    },
    { texto: "É uma pessoa comunicativa com colegas?", chave: "comunicativo" },
  ];

  // Estilos das preferências do modal (verde = Sim, vermelho = Não)
  const estilo = document.createElement("style");
  estilo.textContent = `
    .pref-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #ececf6;
      font-size: 14px;
    }
    .pref-item:last-child { border-bottom: none; }
    .pref-badge {
      flex-shrink: 0;
      min-width: 52px;
      text-align: center;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
    .pref-badge--sim { background: #dcfce7; color: #15803d; }
    .pref-badge--nao { background: #fee2e2; color: #b91c1c; }
    .pref-msg { margin: 0; color: #6b6b8a; }
  `;
  document.head.appendChild(estilo);

  const iniciais = (nome) =>
    (nome || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("");

  const obterFotoPerfil = (match) => {
    const foto = match.fotoPerfilUrl || match.fotoUrl;
    return typeof foto === "string" ? urlImagemSegura(foto.trim(), "") : "";
  };

  // Descobre o id do estudante no objeto do match
  // (só aceita campos que realmente identificam o estudante, para nunca buscar o aluno errado)
  const obterEstudanteId = (match) =>
    match.estudanteId ?? match.idEstudante ?? match.alunoId ?? null;

  function criarCard(match) {
    const nome = escaparHtml(match.nomeEstudante || "Estudante");
    const curso = escaparHtml(match.curso || "Curso não informado");
    const tituloVaga = escaparHtml(match.tituloVaga || "Moradia");
    const iniciaisAluno = escaparHtml(iniciais(match.nomeEstudante));
    const fotoPerfilUrl = obterFotoPerfil(match);
    const dados = encodeURIComponent(JSON.stringify(match));

    const card = document.createElement("div");
    card.className = "match-card";
    card.innerHTML = `
      <div class="match-img student-bg">
        ${
          fotoPerfilUrl
            ? `<img class="student-avatar" src="${escaparHtml(fotoPerfilUrl)}" alt="Foto de ${nome}">`
            : `<div class="student-avatar">${iniciaisAluno}</div>`
        }
        <span class="match-badge">💜 Interesse recebido</span>
      </div>
      <div class="match-info">
        <h2>${nome}</h2>
        <p class="match-course">${curso}</p>
        <div class="match-property">
          <span class="label">Gostou de:</span>
          <span class="value">${tituloVaga}</span>
        </div>
        <button class="btn-match" type="button" data-match="${escaparHtml(dados)}">Ver detalhes</button>
      </div>
    `;
    const foto = card.querySelector(".student-avatar");
    if (foto && foto.tagName === "IMG") {
      foto.addEventListener(
        "error",
        () => {
          const fallback = document.createElement("div");
          fallback.className = "student-avatar";
          fallback.textContent = iniciais(match.nomeEstudante);
          foto.replaceWith(fallback);
        },
        { once: true },
      );
    }
    return card;
  }

  // Renderiza as preferências no modal
  function renderizarPreferencias(container, respostasApi) {
    container.innerHTML = PERGUNTAS.map((pergunta) => {
      const valor = respostasApi[pergunta.chave];

      if (typeof valor !== "boolean") {
        return `
          <div class="pref-item">
            <span>${escaparHtml(pergunta.texto)}</span>
            <span class="pref-badge">—</span>
          </div>`;
      }

      const classe = valor ? "sim" : "nao";
      return `
        <div class="pref-item">
          <span>${escaparHtml(pergunta.texto)}</span>
          <span class="pref-badge pref-badge--${classe}">${valor ? "Sim" : "Não"}</span>
        </div>`;
    }).join("");
  }

  // Controle para ignorar respostas de um modal que já foi fechado/trocado
  let aberturaAtual = 0;

  async function carregarPreferencias(match, modalRespostas, abertura) {
    // 1) Se o back-end já devolveu as preferências dentro do match, usa direto
    const embutido = match.questionario || match.respostas;
    if (embutido && typeof embutido === "object") {
      renderizarPreferencias(modalRespostas, embutido);
      return;
    }

    // 2) Senão, busca pelo id do estudante
    const estudanteId = obterEstudanteId(match);

    if (!estudanteId) {
      modalRespostas.innerHTML =
        '<p class="pref-msg">Preferências não disponíveis.</p>';
      console.warn(
        "O match não traz o id do estudante (esperado: estudanteId). Campos recebidos:",
        Object.keys(match),
      );
      return;
    }

    modalRespostas.innerHTML = '<p class="pref-msg">Carregando preferências...</p>';

    try {
      const respostaApi = await chamarApi(
        `/estudantes/${encodeURIComponent(estudanteId)}/questionario`,
      );
      if (abertura !== aberturaAtual) return;

      const respostasApi = respostaApi?.respostas || respostaApi;
      if (!respostasApi || typeof respostasApi !== "object") {
        throw { codigo: "DADOS_INVALIDOS" };
      }

      renderizarPreferencias(modalRespostas, respostasApi);
    } catch (erro) {
      if (abertura !== aberturaAtual) return;

      console.error("Erro ao carregar preferências do estudante:", erro);

      const mensagem = mensagemDeErro(erro) || "";
      modalRespostas.innerHTML = mensagem.includes(
        "ainda não respondeu o questionário",
      )
        ? '<p class="pref-msg">O estudante ainda não respondeu o questionário.</p>'
        : '<p class="pref-msg">Preferências não disponíveis.</p>';
    }
  }

  function abrirModal(match) {
    const modalOverlay = document.getElementById("modalContato");
    const modalNome = document.getElementById("modalNome");
    const modalCurso = document.getElementById("modalCurso");
    const modalEmail = document.getElementById("modalEmail");
    const modalTelefone = document.getElementById("modalTelefone");
    const modalIniciais = document.getElementById("modalIniciais");
    const modalFoto = document.getElementById("modalFoto");
    const modalSobreMim = document.getElementById("modalSobreMim");
    const modalRespostas = document.getElementById("modalRespostas");

    modalNome.textContent = match.nomeEstudante || "Estudante";
    modalCurso.textContent = match.curso || "Curso não informado";
    modalEmail.textContent = match.email || "E-mail não informado";
    modalEmail.href = match.email ? `mailto:${match.email}` : "#";
    modalTelefone.textContent = match.telefone || "Telefone não informado";
    const telefoneWhatsApp = window.api.normalizarTelefoneWhatsApp(
      match.telefone,
    );
    modalTelefone.href = telefoneWhatsApp
      ? `https://wa.me/${telefoneWhatsApp}`
      : "#";

    const textoIniciais = iniciais(match.nomeEstudante);
    const fotoPerfilUrl = obterFotoPerfil(match);

    const exibirIniciais = () => {
      modalFoto.removeAttribute("src");
      modalFoto.hidden = true;
      modalIniciais.hidden = false;
      modalIniciais.textContent = textoIniciais;
    };

    if (fotoPerfilUrl) {
      modalFoto.onerror = exibirIniciais;
      modalFoto.src = fotoPerfilUrl;
      modalFoto.hidden = false;
      modalIniciais.hidden = true;
    } else {
      exibirIniciais();
    }

    const sobreMim = (match.sobreMim || match.sobre_mim || "").trim();
    modalSobreMim.textContent =
      sobreMim || "O estudante não escreveu nada sobre si.";

    modalOverlay.classList.add("active");

    // Carrega as preferências do estudante
    aberturaAtual++;
    carregarPreferencias(match, modalRespostas, aberturaAtual);
  }

  function configurarModal() {
    const modalOverlay = document.getElementById("modalContato");
    const fechar = () => {
      aberturaAtual++;
      modalOverlay.classList.remove("active");
    };
    document.getElementById("fecharModalX").addEventListener("click", fechar);
    document.getElementById("btnFecharModal").addEventListener("click", fechar);
    modalOverlay.addEventListener("click", (evento) => {
      if (evento.target === modalOverlay) fechar();
    });
  }

  async function carregarMatches() {
    const sessao = obterSessao();
    try {
      const resposta = await chamarApi(
        `/vagas/responsavel/${encodeURIComponent(sessao.usuarioId)}/matches`,
      );
      console.log("Resposta dos matches:", resposta);

      const matches = Array.isArray(resposta)
        ? resposta
        : resposta?.matches || [];
      grid.innerHTML = "";

      if (matches.length === 0) {
        grid.innerHTML =
          '<p class="loading-msg">Nenhum estudante demonstrou interesse nas suas moradias.</p>';
        return;
      }

      matches.forEach((match) => grid.appendChild(criarCard(match)));
      grid.querySelectorAll("[data-match]").forEach((botao) => {
        botao.addEventListener("click", () => {
          abrirModal(JSON.parse(decodeURIComponent(botao.dataset.match)));
        });
      });
    } catch (erro) {
      console.error("Erro ao carregar matches do proprietário:", erro);
      grid.innerHTML = `<p class="loading-msg">${escaparHtml(mensagemDeErro(erro))}</p>`;
    }
  }

  configurarModal();
  carregarMatches();
});