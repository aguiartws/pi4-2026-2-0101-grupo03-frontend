document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin("estudante")) return;

  // 1. Lógica da barra lateral retrátil
  const appLayout = document.getElementById("appLayout");
  const sidebarToggle = document.getElementById("sidebarToggle");

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

  // 2. Elementos do perfil
  const sobreMimText = document.getElementById("sobreMimText");
  const nomeAlunoEl = document.getElementById("nomeAluno");
  const avatarAlunoEl = document.getElementById("avatarAluno");
  const mensagemPerfil = document.getElementById("mensagemPerfil");
  const perfilEmail = document.getElementById("perfilEmail");
  const perfilTelefone = document.getElementById("perfilTelefone");
  const perfilCidade = document.getElementById("perfilCidade");
  const perfilCurso = document.getElementById("perfilCurso");
  const FOTO_PADRAO = "../imagens/avatar-padrao.png";

  function atualizarPerfil(perfil) {
    const nome = perfil.nome || "";
    nomeAlunoEl.textContent = nome;
    avatarAlunoEl.textContent = nome
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("");
    if (perfilEmail) perfilEmail.textContent = perfil.email || "";
    if (perfilTelefone) perfilTelefone.textContent = perfil.telefone || "";
    if (perfilCidade) perfilCidade.textContent = perfil.cidade || "";
    if (perfilCurso) perfilCurso.textContent = perfil.curso || "";

    const fotoUrl = urlImagemSegura(perfil.fotoPerfilUrl, FOTO_PADRAO);
    fotoPreview.src = fotoUrl;
    fotoPreview.hidden = false;
    avatarAlunoEl.hidden = true;

    if (sobreMimText) {
  sobreMimText.textContent =
    perfil.sobreMim?.trim() ||
    perfil.sobre_mim?.trim() ||
    "Informações sobre você ainda não foram preenchidas.";
}
  }

  // 3. Foto de perfil do Aluno (Câmara e Upload)
  const btnFoto = document.getElementById("btnFoto");
  const fotoInput = document.getElementById("fotoPerfil");
  const fotoPreview = document.getElementById("fotoPreview");
  const erroFoto = document.getElementById("erroFoto");

  const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
  const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
  let urlFotoTemporaria = null;

  if (btnFoto && fotoInput && fotoPreview && avatarAlunoEl) {
    btnFoto.addEventListener("click", () => fotoInput.click());

    fotoInput.addEventListener("change", async () => {
      erroFoto.textContent = "";

      const arquivo = fotoInput.files[0];
      if (!arquivo) return;

      if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
        erroFoto.textContent = mensagemDeErro({ codigo: "ARQUIVO_INVALIDO" });
        fotoInput.value = "";
        return;
      }

      if (arquivo.size === 0 || arquivo.size > TAMANHO_MAXIMO_FOTO) {
        erroFoto.textContent = mensagemDeErro({ codigo: "ARQUIVO_INVALIDO" });
        fotoInput.value = "";
        return;
      }

      if (urlFotoTemporaria) URL.revokeObjectURL(urlFotoTemporaria);

      urlFotoTemporaria = URL.createObjectURL(arquivo);
      fotoPreview.src = urlFotoTemporaria;
      fotoPreview.hidden = false;
      avatarAlunoEl.hidden = true;

      try {
        const sessao = obterSessao();
        if (!sessao) return;
        const formData = new FormData();
        formData.append("foto", arquivo);

        const resultado = await chamarApiMultipart(
          `/alunos/${sessao.usuarioId}/foto`,
          {
            corpo: formData,
          },
        );

        const fotoUrl = resultado?.fotoUrl;
        if (fotoUrl) fotoPreview.src = urlImagemSegura(fotoUrl, FOTO_PADRAO);
        await carregarPerfil();
      } catch (erro) {
        console.error("Erro ao enviar foto:", erro);
        erroFoto.textContent = mensagemDeErro(erro);
      }
    });
  }

  const IMAGEM_PADRAO_MORADIA = "../imagens/imagem-moradia-padrao.png";

  // Evita inserir conteúdo recebido da API diretamente como HTML.
  function escaparHTML(valor) {
    return String(valor ?? "").replace(
      /[&<>"']/g,
      (caractere) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[caractere],
    );
  }

    const totalMatches = document.getElementById("totalMatches");
  const totalFavoritos = document.getElementById("totalFavoritos");

  async function carregarContagens() {
    const sessao = obterSessao();
    if (!sessao) return;
    const id = encodeURIComponent(sessao.usuarioId);

    try {
      const m = await chamarApi(`/vagas/meus-matches?estudanteId=${id}`);
      totalMatches.textContent = (m.matches || []).length;
    } catch (erro) {
      console.error("Erro ao contar matches:", erro);
      totalMatches.textContent = "0";
    }

    try {
      const f = await chamarApi(`/favoritos?estudanteId=${id}`);
      const lista = Array.isArray(f) ? f : f.favoritos || [];
      totalFavoritos.textContent = lista.length;
    } catch (erro) {
      console.error("Erro ao contar favoritos:", erro);
      totalFavoritos.textContent = "0";
    }
  }

  async function carregarPerfil() {
    try {
      const sessao = obterSessao();
      if (!sessao) return;
      const perfil = await chamarApi("/usuario/perfil");
      atualizarPerfil(perfil);
    } catch (erro) {
      const mensagemErro = mensagemDeErro(erro);
      erroFoto.textContent = mensagemErro;
      if (mensagemPerfil) mensagemPerfil.textContent = mensagemErro;
    }
  }

  carregarContagens();
  carregarPerfil();
});