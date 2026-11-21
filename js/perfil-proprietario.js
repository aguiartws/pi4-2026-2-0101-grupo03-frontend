document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin("proprietario")) return;

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
  const nomeProprietarioEl = document.getElementById("nomeProprietario");
  const avatarProprietarioEl = document.getElementById("avatarProprietario");
  const mensagemPerfil = document.getElementById("mensagemPerfil");
  const perfilEmail = document.getElementById("perfilEmail");
  const perfilTelefone = document.getElementById("perfilTelefone");
  const perfilCidade = document.getElementById("perfilCidade");
  const FOTO_PADRAO = "../imagens/avatar-padrao.png";

  function atualizarPerfil(perfil) {
    const nome = perfil.nome || "";
    nomeProprietarioEl.textContent = nome;
    avatarProprietarioEl.textContent = nome
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join("");
    if (perfilEmail) perfilEmail.textContent = perfil.email || "";
    if (perfilTelefone) perfilTelefone.textContent = perfil.telefone || "";
    if (perfilCidade) perfilCidade.textContent = perfil.cidade || "";

    const fotoUrl = urlImagemSegura(perfil.fotoPerfilUrl, FOTO_PADRAO);
    fotoPreview.src = fotoUrl;
    fotoPreview.hidden = false;
    avatarProprietarioEl.hidden = true;
  }

  // 3. Foto de perfil (Câmara e Upload)
  const btnFoto = document.getElementById("btnFoto");
  const fotoInput = document.getElementById("fotoPerfil");
  const fotoPreview = document.getElementById("fotoPreview");
  const erroFoto = document.getElementById("erroFoto");

  const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
  const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
  let urlFotoTemporaria = null;

  if (btnFoto && fotoInput && fotoPreview && avatarProprietarioEl) {
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
      avatarProprietarioEl.hidden = true;

      // Envio da foto para o backend via FormData
      try {
        const sessao = obterSessao();
        if (!sessao) return;
        const formData = new FormData();
        formData.append("foto", arquivo);

        const resultado = await chamarApiMultipart(
          `/proprietarios/${sessao.usuarioId}/foto`,
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
  const totalCasas = document.getElementById("totalCasas");
  const totalMatches = document.getElementById("totalMatches");

  async function carregarContagem(endpoint, chave, elemento) {
    if (!elemento) return;
    try {
      const sessao = obterSessao();
      if (!sessao) return;

      const resposta = await chamarApi(
        `/vagas/responsavel/${encodeURIComponent(sessao.usuarioId)}${endpoint}`,
      );
      const lista = Array.isArray(resposta)
        ? resposta
        : resposta?.[chave] || [];
      elemento.textContent = lista.length;
    } catch (erro) {
      console.error(`Erro ao contar ${chave}:`, erro);
      elemento.textContent = "0";
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

  carregarContagem("", "vagas", totalCasas);
  carregarContagem("/matches", "matches", totalMatches);
  carregarPerfil();
});
