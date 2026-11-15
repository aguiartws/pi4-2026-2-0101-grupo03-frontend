document.addEventListener('DOMContentLoaded', () => {
  // 1. Lógica da barra lateral retrátil
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      appLayout.classList.toggle('collapsed');
      const isCollapsed = appLayout.classList.contains('collapsed');
      sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
    });
  }

  // 2. Elementos do perfil
  const sobreMimText = document.getElementById('sobreMimText');
  const nomeAlunoEl = document.getElementById('nomeAluno');
  const avatarAlunoEl = document.getElementById('avatarAluno');
  const mensagemPerfil = document.getElementById('mensagemPerfil');
  const perfilEmail = document.getElementById('perfilEmail');
  const perfilTelefone = document.getElementById('perfilTelefone');
  const perfilCidade = document.getElementById('perfilCidade');
  const perfilCurso = document.getElementById('perfilCurso');
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

    const temFoto = typeof perfil.fotoPerfilUrl === "string" && perfil.fotoPerfilUrl.trim() !== "";
    fotoPreview.src = temFoto ? perfil.fotoPerfilUrl : FOTO_PADRAO;
    fotoPreview.hidden = false;
    avatarAlunoEl.hidden = true;

    if (sobreMimText) {
      sobreMimText.textContent = "Informações sobre você ainda não foram preenchidas.";
    }
  }

  // 3. Foto de perfil do Aluno (Câmara e Upload)
  const btnFoto = document.getElementById('btnFoto');
  const fotoInput = document.getElementById('fotoPerfil');
  const fotoPreview = document.getElementById('fotoPreview');
  const erroFoto = document.getElementById('erroFoto');

  const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
  const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
  let urlFotoTemporaria = null;

  if (btnFoto && fotoInput && fotoPreview && avatarAlunoEl) {
    btnFoto.addEventListener('click', () => fotoInput.click());

    fotoInput.addEventListener('change', async () => {
      erroFoto.textContent = '';

      const arquivo = fotoInput.files[0];
      if (!arquivo) return;

      if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
        erroFoto.textContent = mensagemDeErro({ codigo: "ARQUIVO_INVALIDO" });
        fotoInput.value = '';
        return;
      }

      if (arquivo.size === 0 || arquivo.size > TAMANHO_MAXIMO_FOTO) {
        erroFoto.textContent = mensagemDeErro({ codigo: "ARQUIVO_INVALIDO" });
        fotoInput.value = '';
        return;
      }

      if (urlFotoTemporaria) URL.revokeObjectURL(urlFotoTemporaria);

      urlFotoTemporaria = URL.createObjectURL(arquivo);
      fotoPreview.src = urlFotoTemporaria;
      fotoPreview.hidden = false;
      avatarAlunoEl.hidden = true;

      try {
        const sessao = obterSessao();
        if (sessao.token === "mock-token-de-teste") {
          throw new Error("É necessário fazer login com uma sessão real para enviar a foto.");
        }
        const formData = new FormData();
        formData.append("foto", arquivo);

        const resultado = await chamarApiMultipart(`/alunos/${sessao.usuarioId}/foto`, {
          corpo: formData
        });

        const fotoUrl = resultado?.fotoUrl;
        if (fotoUrl) fotoPreview.src = fotoUrl;
        await carregarPerfil();
      } catch (erro) {
        console.error("Erro ao enviar foto:", erro);
        erroFoto.textContent = mensagemDeErro(erro);
      }
    });
  }

  async function carregarPerfil() {
    try {
      const sessao = obterSessao();
      if (sessao.token === "mock-token-de-teste") {
        throw new Error("É necessário fazer login com uma sessão real para consultar o perfil.");
      }
      const perfil = await chamarApi("/usuario/perfil");
      atualizarPerfil(perfil);
    } catch (erro) {
      const mensagemErro = mensagemDeErro(erro);
      erroFoto.textContent = mensagemErro;
      if (mensagemPerfil) mensagemPerfil.textContent = mensagemErro;
    }
  }

  carregarPerfil();
});