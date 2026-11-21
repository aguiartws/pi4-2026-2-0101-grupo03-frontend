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

  // Se quiser deixar as fotos opcionais, troque para false
  const FOTOS_OBRIGATORIAS = true;

  // --- CEP: variáveis e funções ---
  const campoCep = document.getElementById("cep");
  const cepStatus = document.getElementById("cepStatus");
  const campoEndereco = document.getElementById("endereco");
  const campoBairro = document.getElementById("bairro");
  const campoCidade = document.getElementById("cidade");
  const campoEstado = document.getElementById("estado");
  const campoNumero = document.getElementById("numero");

  // --- Campos numéricos ---
  const campoAluguel = document.getElementById("valorAluguel");
  const campoMoradores = document.getElementById("numeroMoradores");
  const campoLatitude = document.getElementById("latitude");
  const campoLongitude = document.getElementById("longitude");

  // --- Fotos (declaradas aqui para a validação poder usá-las) ---
  const inputFotos = document.getElementById("fotosMoradia");
  const previewFotos = document.getElementById("previewFotos");
  const secaoFotos = document.querySelector(".photo-upload");

  const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
  const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

  let fotosSelecionadas = [];

  // =========================================================
  // MENSAGENS DE ERRO (inline, no padrão visual do projeto)
  // =========================================================
  const errosAtivos = new WeakMap();

  function limparErro(alvo) {
    if (!alvo) return;

    const erro = errosAtivos.get(alvo);
    if (erro) {
      erro.remove();
      errosAtivos.delete(alvo);
    }

    alvo.classList.remove("invalid");
    alvo.removeAttribute("aria-invalid");
  }

  function mostrarErro(alvo, mensagem, ancora = alvo) {
    limparErro(alvo);

    const erro = document.createElement("div");
    erro.className = "field-error";
    erro.setAttribute("role", "alert");
    erro.textContent = mensagem;

    ancora.insertAdjacentElement("afterend", erro);

    alvo.classList.add("invalid");
    alvo.setAttribute("aria-invalid", "true");

    errosAtivos.set(alvo, erro);
  }

  // Limpa o erro assim que a pessoa mexe no campo
  ["input", "change"].forEach((tipoEvento) => {
    form.addEventListener(tipoEvento, (evento) => {
      const alvo = evento.target;

      if (alvo.type === "radio") {
        limparErro(alvo.closest(".question"));
      } else {
        limparErro(alvo);
      }
    });
  });

  // =========================================================
  // CAMPOS NUMÉRICOS: só números, ponto, vírgula, hífen e parênteses
  // =========================================================
  const CARACTERES_INVALIDOS_NUMERICOS = /[^\d.,\-()]/g;

  [campoAluguel, campoMoradores, campoLatitude, campoLongitude].forEach((campo) => {
    if (!campo) return;

    campo.addEventListener("input", () => {
      const limpo = campo.value.replace(CARACTERES_INVALIDOS_NUMERICOS, "");

      if (limpo !== campo.value) campo.value = limpo;
    });
  });

  // =========================================================
  // CEP
  // =========================================================
  let cepInexistente = false;
  let consultaAtual = 0;

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

    // Campos preenchidos automaticamente deixam de ter erro
    [campoEndereco, campoBairro, campoCidade, campoEstado].forEach(limparErro);
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
        campoCep.classList.add("invalid");
        definirStatusCep(dados.mensagem + ".", "erro");
        return;
      }

      cepInexistente = false;
      campoCep.setCustomValidity("");
      campoCep.classList.remove("invalid");

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
      definirStatusCep(
        "Não foi possível validar o CEP agora. Preencha o endereço manualmente.",
        "erro"
      );
    }
  }

  if (campoCep) {
    campoCep.addEventListener("input", () => {
      // Remove letras e qualquer caractere que não seja número
      let valor = campoCep.value.replace(/\D/g, "").slice(0, 8);

      // Adiciona o hífen automaticamente
      if (valor.length > 5) {
        valor = valor.slice(0, 5) + "-" + valor.slice(5);
      }

      campoCep.value = valor;

      cepInexistente = false;
      campoCep.setCustomValidity("");
      campoCep.classList.remove("invalid");
      consultaAtual++;

      const digitos = valor.replace(/\D/g, "");

      if (digitos.length < 8) {
        definirStatusCep("", "info");
        return;
      }

      consultarCep(digitos);
    });
  }

  // --- Navegação ---
  function mostrarEtapa(indice) {
    etapas.forEach((etapa, i) => {
      if (!etapa) return;

      etapa.hidden = i !== indice;
      etapa.classList.toggle("active", i === indice);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =========================================================
  // VALIDAÇÃO (todos os campos são obrigatórios)
  // =========================================================
  function validarFormatoCampo(campo) {
    const valor = campo.value.trim();

    switch (campo.id) {
      case "cep": {
        const digitos = valor.replace(/\D/g, "");

        if (digitos.length !== 8) return "Informe um CEP com 8 dígitos.";
        if (cepInexistente) return "CEP inválido. Confira os números.";
        return "";
      }

      case "valorAluguel": {
        const numero = valor.replace(",", ".");

        if (!/^\d+(\.\d+)?$/.test(numero) || Number(numero) <= 0) {
          return "Informe um valor de aluguel válido. Ex.: 850,00";
        }
        return "";
      }

      case "numeroMoradores": {
        if (!/^\d+$/.test(valor) || Number(valor) < 1) {
          return "Informe um número inteiro de moradores (mínimo 1).";
        }
        return "";
      }

      case "latitude": {
        const numero = valor.replace(",", ".");

        if (!/^-?\d+(\.\d+)?$/.test(numero) || Math.abs(Number(numero)) > 90) {
          return "Latitude inválida. Use um valor entre -90 e 90. Ex.: -22.9056";
        }
        return "";
      }

      case "longitude": {
        const numero = valor.replace(",", ".");

        if (!/^-?\d+(\.\d+)?$/.test(numero) || Math.abs(Number(numero)) > 180) {
          return "Longitude inválida. Use um valor entre -180 e 180. Ex.: -47.0608";
        }
        return "";
      }

      default:
        return "";
    }
  }

  function validarEtapa(indice) {
    const etapa = etapas[indice];

    if (!etapa) return false;

    let primeiroInvalido = null;

    const marcar = (alvo, mensagem, ancora) => {
      mostrarErro(alvo, mensagem, ancora);
      if (!primeiroInvalido) primeiroInvalido = alvo;
    };

    // 1) Campos de texto e áreas de texto: todos obrigatórios
    const campos = etapa.querySelectorAll(
      'input:not([type="radio"]):not([type="file"]), textarea'
    );

    campos.forEach((campo) => {
      limparErro(campo);

      if (!campo.value.trim()) {
        if (campo === campoCep) definirStatusCep("", "info");
        marcar(campo, "Este campo é obrigatório.", campo === campoCep ? cepStatus : campo);
        return;
      }

      const mensagemFormato = validarFormatoCampo(campo);

      if (mensagemFormato) {
        if (campo === campoCep) definirStatusCep("", "info");
        marcar(campo, mensagemFormato, campo === campoCep ? cepStatus : campo);
      }
    });

    // 2) Grupos de radio: uma resposta por pergunta
    const grupos = [...new Set(
      [...etapa.querySelectorAll('input[type="radio"]')].map((input) => input.name)
    )];

    grupos.forEach((nome) => {
      const primeiraOpcao = etapa.querySelector(`input[name="${nome}"]`);
      const pergunta = primeiraOpcao.closest(".question");

      limparErro(pergunta);

      if (!etapa.querySelector(`input[name="${nome}"]:checked`)) {
        marcar(
          pergunta,
          "Selecione uma opção para continuar.",
          pergunta.querySelector(".options")
        );
      }
    });

    // 3) Fotos
    if (FOTOS_OBRIGATORIAS && secaoFotos && etapa.contains(secaoFotos)) {
      limparErro(secaoFotos);

      if (fotosSelecionadas.length === 0) {
        marcar(secaoFotos, "Adicione pelo menos uma foto da moradia.", previewFotos);
      }
    }

    if (primeiroInvalido) {
      primeiroInvalido.scrollIntoView({ behavior: "smooth", block: "center" });

      const foco = primeiroInvalido.matches("input, textarea")
        ? primeiroInvalido
        : primeiroInvalido.querySelector('input[type="radio"]');

      if (foco) foco.focus({ preventScroll: true });

      return false;
    }

    return true;
  }

  // --- Botões de navegação ---
  const btnProximo = document.getElementById("btnProximo");

  if (btnProximo) {
    btnProximo.addEventListener("click", () => {
      if (validarEtapa(0)) mostrarEtapa(1);
    });
  }

  const btnVoltarEtapa2 = document.getElementById("btnVoltarEtapa2");

  if (btnVoltarEtapa2) {
    btnVoltarEtapa2.addEventListener("click", () => mostrarEtapa(0));
  }

  const btnProximoEtapa2 = document.getElementById("btnProximoEtapa2");

  if (btnProximoEtapa2) {
    btnProximoEtapa2.addEventListener("click", () => {
      if (validarEtapa(1)) mostrarEtapa(2);
    });
  }

  const btnVoltarEtapa3 = document.getElementById("btnVoltarEtapa3");

  if (btnVoltarEtapa3) {
    btnVoltarEtapa3.addEventListener("click", () => mostrarEtapa(1));
  }

  // --- Fotos ---
  if (inputFotos) {
    inputFotos.addEventListener("change", () => {
      const novasFotos = [...inputFotos.files];

      limparErro(secaoFotos);

      const imagensInvalidas = novasFotos.some((arquivo) => (
        !TIPOS_PERMITIDOS.includes(arquivo.type)
        || arquivo.size === 0
        || arquivo.size > TAMANHO_MAXIMO_FOTO
      ));

      if (imagensInvalidas) {
        mostrarErro(
          secaoFotos,
          "Escolha imagens JPG, PNG ou WEBP de até 5 MB.",
          previewFotos
        );
        inputFotos.value = "";
        return;
      }

      const imagensValidas = novasFotos.filter((arquivo) =>
        TIPOS_PERMITIDOS.includes(arquivo.type)
      );

      const excedeu = fotosSelecionadas.length + imagensValidas.length > 5;
      const vagas = 5 - fotosSelecionadas.length;

      fotosSelecionadas = fotosSelecionadas.concat(
        imagensValidas.slice(0, vagas)
      );

      atualizarPreview();
      inputFotos.value = "";

      if (excedeu) {
        mostrarErro(secaoFotos, "Você pode adicionar no máximo 5 fotos.", previewFotos);
      }
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
        limparErro(secaoFotos);
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

    const respostaSim = (nome) =>
      form.querySelector(`input[name="${nome}"]:checked`)?.value === "sim";

    // Converte vírgula decimal em ponto
    const aluguelConvertido = campoAluguel.value.replace(",", ".");
    const latitudeConvertida = campoLatitude.value.replace(",", ".");
    const longitudeConvertida = campoLongitude.value.replace(",", ".");

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

      valorAluguel: Number(aluguelConvertido),

      numeroMoradores: Number(campoMoradores.value),

      regrasCasa: document.getElementById("regrasCasa").value.trim(),

      latitude: Number(latitudeConvertida),

      longitude: Number(longitudeConvertida),

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
        throw {
          codigo: "DADOS_INVALIDOS",
          mensagem: "O servidor não retornou o ID da moradia criada."
        };
      }

      // --- Envio das fotos ---
      if (fotosSelecionadas.length > 0) {
        const formData = new FormData();

        fotosSelecionadas.forEach((foto) => {
          formData.append("fotos", foto);
        });

        try {
          const resultadoFotos = await chamarApiMultipart(
            `/vagas/${encodeURIComponent(resultado.vagaId)}/fotos`,
            {
              corpo: formData
            }
          );

          if (!resultadoFotos || !Array.isArray(resultadoFotos.fotos)) {
            throw { codigo: "FALHA_UPLOAD_IMAGEM" };
          }

        } catch (erroUpload) {
          document.getElementById("tituloModalSucesso").textContent =
            "Moradia criada, mas as fotos não foram enviadas";

          document.getElementById("mensagemModalSucesso").textContent =
            `${mensagemDeErro(erroUpload)} Você pode tentar novamente pela edição da moradia.`;

          document.getElementById("linkModalSucesso").href =
            `editar-anuncio.html?id=${encodeURIComponent(resultado.vagaId)}`;

          document.getElementById("linkModalSucesso").textContent =
            "Editar moradia";

          document.getElementById("modalSucesso").classList.add("active");

          return;
        }
      }

      // --- Sucesso ---
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