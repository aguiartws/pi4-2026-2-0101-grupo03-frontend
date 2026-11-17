document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin("proprietario")) return;

  // --- Setinha da barra lateral ---
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      appLayout.classList.toggle('collapsed');
    });
  }

  // --- Elementos principais ---
  const form = document.getElementById("formQuestionario");
  const etapas = [
    document.getElementById("etapa1"),
    document.getElementById("etapa2"),
    document.getElementById("etapa3")
  ];

  if (!form || !etapas[0]) return;

  // --- CEP: variáveis e funções (antes de validarEtapa) ---
  const campoCep = document.getElementById("cep");
  const cepStatus = document.getElementById("cepStatus");
  const campoEndereco = document.getElementById("endereco");
  const campoBairro = document.getElementById("bairro");
  const campoCidade = document.getElementById("cidade");
  const campoEstado = document.getElementById("estado");
  const campoNumero = document.getElementById("numero");

  let cepInexistente = false; // true só quando o servidor diz que o CEP é inválido
  let consultaAtual = 0;      // evita que resposta antiga sobrescreva a nova

  function definirStatusCep(mensagem, tipo = "info") {
    if (!cepStatus) return;
    cepStatus.textContent = mensagem;
    cepStatus.className = "cep-status " + tipo;
  }

  function preencherEndereco(dados) {
    campoEndereco.value = dados.logradouro || "";
    campoBairro.value = dados.bairro || "";
    campoCidade.value = dados.localidade || "";
    campoEstado.value = dados.uf || "";
  }

  async function consultarCep(cep) {
    const consulta = ++consultaAtual;
    definirStatusCep("Validando CEP...", "info");

    try {
      const dados = await chamarApi(`/cep/${cep}`);
      if (consulta !== consultaAtual) return;

      if (!dados.valido) {
        cepInexistente = true;
        campoCep.setCustomValidity(dados.mensagem);
        definirStatusCep(dados.mensagem + ".", "erro");
        return;
      }

      cepInexistente = false;
      campoCep.setCustomValidity("");
      preencherEndereco({
        logradouro: dados.logradouro,
        bairro: dados.bairro,
        localidade: dados.cidade,
        uf: dados.uf
      });
      definirStatusCep("CEP válido. Endereço preenchido automaticamente.", "ok");

      if (!dados.logradouro) campoEndereco.focus();
      else campoNumero.focus();
    } catch (erro) {
      if (consulta !== consultaAtual) return;
      cepInexistente = false;
      campoCep.setCustomValidity("");
      definirStatusCep("Não foi possível validar o CEP agora. Preencha o endereço manualmente.", "erro");
    }
  }

  if (campoCep) {
    campoCep.addEventListener("input", () => {
      let valor = campoCep.value.replace(/\D/g, "").slice(0, 8);
      if (valor.length > 5) valor = valor.slice(0, 5) + "-" + valor.slice(5);
      campoCep.value = valor;

      cepInexistente = false;
      campoCep.setCustomValidity("");
      consultaAtual++; // cancela consultas pendentes

      const digitos = valor.replace(/\D/g, "");
      if (digitos.length < 8) {
        definirStatusCep("", "info");
        return;
      }
      consultarCep(digitos);
    });
  }

  // --- Navegação e validação ---
  function mostrarEtapa(indice) {
    etapas.forEach((etapa, i) => {
      if (!etapa) return;
      etapa.hidden = i !== indice;
      etapa.classList.toggle("active", i === indice);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validarEtapa(indice) {
    const etapa = etapas[indice];
    if (!etapa) return false;

    if (indice === 0) {
      const digitosCep = campoCep.value.replace(/\D/g, "");
      if (digitosCep.length !== 8 || cepInexistente) {
        definirStatusCep(
          digitosCep.length !== 8 ? "Informe um CEP com 8 dígitos." : "CEP inválido. Confira os números.",
          "erro"
        );
        campoCep.focus();
        return false;
      }
    }

    const campos = etapa.querySelectorAll("input[required], textarea[required]");
    for (const campo of campos) {
      if (!campo.value.trim()) {
        campo.focus();
        campo.reportValidity();
        return false;
      }
    }

    const grupos = [...new Set(
      [...etapa.querySelectorAll('input[type="radio"]')].map(input => input.name)
    )];

    for (const nome of grupos) {
      if (!etapa.querySelector(`input[name="${nome}"]:checked`)) {
        alert("Por favor, responda todas as perguntas antes de continuar.");
        const primeiraOpcao = etapa.querySelector(`input[name="${nome}"]`);
        if (primeiraOpcao) primeiraOpcao.focus();
        return false;
      }
    }
    return true;
  }

  const btnProximo = document.getElementById("btnProximo");
  if (btnProximo) btnProximo.addEventListener("click", () => { if (validarEtapa(0)) mostrarEtapa(1); });

  const btnVoltarEtapa2 = document.getElementById("btnVoltarEtapa2");
  if (btnVoltarEtapa2) btnVoltarEtapa2.addEventListener("click", () => mostrarEtapa(0));

  const btnProximoEtapa2 = document.getElementById("btnProximoEtapa2");
  if (btnProximoEtapa2) btnProximoEtapa2.addEventListener("click", () => { if (validarEtapa(1)) mostrarEtapa(2); });

  const btnVoltarEtapa3 = document.getElementById("btnVoltarEtapa3");
  if (btnVoltarEtapa3) btnVoltarEtapa3.addEventListener("click", () => mostrarEtapa(1));

  // --- Fotos ---
  const inputFotos = document.getElementById("fotosMoradia");
  const previewFotos = document.getElementById("previewFotos");
  const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
  const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
  let fotosSelecionadas = [];

  if (inputFotos) {
    inputFotos.addEventListener("change", () => {
      const novasFotos = [...inputFotos.files];
      const imagensInvalidas = novasFotos.some((arquivo) => (
        !TIPOS_PERMITIDOS.includes(arquivo.type)
        || arquivo.size === 0
        || arquivo.size > TAMANHO_MAXIMO_FOTO
      ));

      if (imagensInvalidas) {
        alert("Escolha imagens JPG, PNG ou WEBP de até 5 MB.");
        inputFotos.value = "";
        return;
      }

      const imagensValidas = novasFotos.filter((arquivo) => TIPOS_PERMITIDOS.includes(arquivo.type));

      if (fotosSelecionadas.length + imagensValidas.length > 5) {
        alert("Você pode adicionar no máximo 5 fotos.");
      }
      const vagas = 5 - fotosSelecionadas.length;
      fotosSelecionadas = fotosSelecionadas.concat(imagensValidas.slice(0, vagas));
      atualizarPreview();
      inputFotos.value = "";
    });
  }

  function atualizarPreview() {
    if (!previewFotos) return;
    previewFotos.innerHTML = "";
    fotosSelecionadas.forEach((arquivo, indice) => {
      const item = document.createElement("div");
      item.className = "photo-item";
      const imagem = document.createElement("img");
      imagem.src = URL.createObjectURL(arquivo);
      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "remove-photo";
      remover.textContent = "×";
      remover.addEventListener("click", () => {
        fotosSelecionadas.splice(indice, 1);
        atualizarPreview();
      });
      item.appendChild(imagem);
      item.appendChild(remover);
      previewFotos.appendChild(item);
    });
  }

  // --- Envio e modal de sucesso ---
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!validarEtapa(2)) return;

    const botaoFinalizar = form.querySelector('button[type="submit"]');
    const sessao = obterSessao();

    const respostaSim = (nome) => form.querySelector(`input[name="${nome}"]:checked`)?.value === "sim";
    const dados = {
      responsavelId: Number(sessao.usuarioId),
      titulo: document.getElementById("nomeRepublica").value.trim(),
      descricao: document.getElementById("descricao").value.trim(),
      endereco: [
        document.getElementById("endereco").value.trim(),
        document.getElementById("numero").value.trim(),
        document.getElementById("bairro").value.trim(),
        document.getElementById("cidade").value.trim(),
        document.getElementById("estado").value.trim()
      ].filter(Boolean).join(", "),
      valorAluguel: Number(document.getElementById("valorAluguel").value),
      numeroMoradores: Number(document.getElementById("numeroMoradores").value),
      regrasCasa: document.getElementById("regrasCasa").value.trim(),
      latitude: Number(document.getElementById("latitude").value),
      longitude: Number(document.getElementById("longitude").value),
      regras: {
        aceitaBarulhoDepoisDas22: respostaSim("barulho"),
        fuma: respostaSim("fumar"),
        aceitaAnimais: respostaSim("animais"),
        gostaReceberVisitas: respostaSim("visitas"),
        gostaCozinhar: respostaSim("cozinhar"),
        estudaEmCasa: respostaSim("horarios_estudo"),
        aceitaDividirTarefas: respostaSim("tarefas"),
        aceitaDividirQuarto: respostaSim("quartos"),
        aceitaFestas: respostaSim("festas"),
        comunicativo: respostaSim("comunicacao")
      }
    };

    botaoFinalizar.disabled = true;
    botaoFinalizar.textContent = "Salvando...";

    try {
      const resultado = await chamarApi("/vagas", {
        metodo: "POST",
        corpo: dados
      });

      if (!resultado || !resultado.vagaId) {
        throw { codigo: "DADOS_INVALIDOS", mensagem: "O servidor não retornou o ID da moradia criada." };
      }

      if (fotosSelecionadas.length > 0) {
        const formData = new FormData();
        fotosSelecionadas.forEach((foto) => formData.append("fotos", foto));

        try {
          const resultadoFotos = await chamarApiMultipart(`/vagas/${encodeURIComponent(resultado.vagaId)}/fotos`, {
            corpo: formData
          });
          if (!resultadoFotos || !Array.isArray(resultadoFotos.fotos)) {
            throw { codigo: "FALHA_UPLOAD_IMAGEM" };
          }
        } catch (erroUpload) {
          document.getElementById("tituloModalSucesso").textContent = "Moradia criada, mas as fotos não foram enviadas";
          document.getElementById("mensagemModalSucesso").textContent =
            `${mensagemDeErro(erroUpload)} Você pode tentar novamente pela edição da moradia.`;
          document.getElementById("linkModalSucesso").href =
            `editar-anuncio.html?id=${encodeURIComponent(resultado.vagaId)}`;
          document.getElementById("linkModalSucesso").textContent = "Editar moradia";
          document.getElementById("modalSucesso").classList.add("active");
          return;
        }
      }

      document.getElementById("modalSucesso").classList.add("active");
    } catch (erro) {
      alert(mensagemDeErro(erro));
    } finally {
      botaoFinalizar.disabled = false;
      botaoFinalizar.textContent = "Finalizar cadastro de moradia";
    }
  });

  // Inicia na primeira etapa
  mostrarEtapa(0);
});