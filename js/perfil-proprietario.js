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

  // 2. Lógica para puxar o nome do proprietário
  const nomeProprietarioEl = document.getElementById('nomeProprietario');
  const avatarProprietarioEl = document.getElementById('avatarProprietario');

  const nomeSalvo = localStorage.getItem('finduhouse_usuario_nome');

  if (nomeSalvo && nomeSalvo.trim() !== "") {
    if (nomeProprietarioEl) nomeProprietarioEl.textContent = nomeSalvo;
    if (avatarProprietarioEl) {
      const partes = nomeSalvo.trim().split(" ");
      let iniciais = partes[0].charAt(0).toUpperCase();
      if (partes.length > 1) {
        iniciais += partes[partes.length - 1].charAt(0).toUpperCase();
      }
      avatarProprietarioEl.textContent = iniciais;
    }
  }

  // 3. Foto de perfil (Câmara e Upload)
  const btnFoto = document.getElementById('btnFoto');
  const fotoInput = document.getElementById('fotoPerfil');
  const fotoPreview = document.getElementById('fotoPreview');
  const erroFoto = document.getElementById('erroFoto');

  const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
  const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
  let urlFotoTemporaria = null;

  if (btnFoto && fotoInput && fotoPreview && avatarProprietarioEl) {
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
      avatarProprietarioEl.hidden = true;

      // Envio da foto para o backend via FormData
      try {
        const sessao = obterSessao();
        const formData = new FormData();
        formData.append("foto", arquivo);

        const resposta = await fetch(`${API_BASE}/proprietarios/${sessao.usuarioId}/foto`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sessao.token}`
          },
          body: formData
        });

        if (!resposta.ok) throw new Error("Erro ao salvar foto no servidor.");
        console.log("Foto de perfil do proprietário atualizada com sucesso!");
      } catch (erro) {
        console.error("Erro ao enviar foto:", erro);
        erroFoto.textContent = "Falha ao enviar a foto para o servidor.";
      }
    });
  }
});