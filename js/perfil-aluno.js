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

  // 2. Lógica do "Sobre mim" e Nome do Aluno
  const sobreMimText = document.getElementById('sobreMimText');
  const nomeAlunoEl = document.getElementById('nomeAluno');
  const avatarAlunoEl = document.getElementById('avatarAluno');

  if (sobreMimText) {
    try {
      const dadosSalvos = localStorage.getItem('finduhouse_perfil_aluno');
      let nomeSalvo = localStorage.getItem('finduhouse_usuario_nome');

      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        
        sobreMimText.textContent = dados.sobreMim && dados.sobreMim.trim() !== '' 
          ? dados.sobreMim 
          : "Você ainda não escreveu nada sobre você.";

        if (dados.nome) nomeSalvo = dados.nome;
      } else {
        sobreMimText.textContent = "You ainda não escreveu nada sobre você.";
      }

      if (nomeSalvo && nomeSalvo.trim() !== "") {
        nomeAlunoEl.textContent = nomeSalvo;
        if (avatarAlunoEl) {
          avatarAlunoEl.textContent = nomeSalvo.charAt(0).toUpperCase();
        }
      }
    } catch (e) {
      console.error("Erro ao ler os dados do perfil:", e);
      sobreMimText.textContent = "Erro ao carregar informações.";
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
        erroFoto.textContent = 'Escolha uma imagem JPG, PNG ou WEBP.';
        fotoInput.value = '';
        return;
      }

      if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
        erroFoto.textContent = 'A imagem deve ter no máximo 5 MB.';
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
        const formData = new FormData();
        formData.append("foto", arquivo);

        const resposta = await fetch(`${API_BASE}/alunos/${sessao.usuarioId}/foto`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sessao.token}`
          },
          body: formData
        });

        if (!resposta.ok) throw new Error("Erro ao salvar foto no servidor.");
        console.log("Foto de perfil do aluno atualizada com sucesso!");
      } catch (erro) {
        console.error("Erro ao enviar foto:", erro);
        erroFoto.textContent = "Falha ao enviar a foto para o servidor.";
      }
    });
  }
});