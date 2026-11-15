document.addEventListener("DOMContentLoaded", () => {
  // --- Lógica da Setinha da Barra Lateral ---
  const appLayout = document.getElementById('appLayout');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle && appLayout) {
    sidebarToggle.addEventListener('click', () => {
      appLayout.classList.toggle('collapsed');
    });
  }

  // --- Navegação e Validação do Questionário ---
  const form = document.getElementById("formQuestionario");
  const etapas = [
    document.getElementById("etapa1"),
    document.getElementById("etapa2"),
    document.getElementById("etapa3")
  ];

  if (!form || !etapas[0]) return;

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

    const campos = etapa.querySelectorAll("input[required]");
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

  // CEP e Fotos
  const campoCep = document.getElementById("cep");
  if (campoCep) {
    campoCep.addEventListener("input", () => {
      let valor = campoCep.value.replace(/\D/g, "").slice(0, 8);
      if (valor.length > 5) valor = valor.slice(0, 5) + "-" + valor.slice(5);
      campoCep.value = valor;
    });
  }

  const inputFotos = document.getElementById("fotosMoradia");
  const previewFotos = document.getElementById("previewFotos");
  let fotosSelecionadas = [];

  if (inputFotos) {
    inputFotos.addEventListener("change", () => {
      const novasFotos = [...inputFotos.files];
      const imagensValidas = novasFotos.filter(arquivo => arquivo.type.startsWith("image/"));
      
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

  // Envio e Modal de Sucesso
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarEtapa(2)) return;
    
    // Coleta os dados (opcional, para o console ou backend futuro)
    const respostas = {};
    form.querySelectorAll('input[type="radio"]:checked').forEach(input => {
      respostas[input.name] = input.value;
    });
    respostas.cep = document.getElementById("cep").value.trim();
    respostas.nomeRepublica = document.getElementById("nomeRepublica").value.trim();
    
    console.log("Respostas:", respostas);
    console.log("Fotos:", fotosSelecionadas);

    // Mostra o Modal de Sucesso
    const modal = document.getElementById("modalSucesso");
    if (modal) {
      modal.classList.add("active");
    }
  });

  // Inicia na primeira etapa
  mostrarEtapa(0);
});