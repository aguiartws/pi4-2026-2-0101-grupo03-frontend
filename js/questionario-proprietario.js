// Navegação e validação do questionário FindUHouse — 3 etapas

const form = document.getElementById("formQuestionario");

const etapas = [
  document.getElementById("etapa1"),
  document.getElementById("etapa2"),
  document.getElementById("etapa3")
];

let etapaAtual = 0;


// MOSTRAR ETAPA
function mostrarEtapa(indice) {

  etapas.forEach((etapa, i) => {

    etapa.hidden = i !== indice;

    etapa.classList.toggle("active", i === indice);

  });

  etapaAtual = indice;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// VALIDAR ETAPA
function validarEtapa(indice) {

  const etapa = etapas[indice];

  // Verifica os campos obrigatórios de texto da primeira etapa.
  const campos = etapa.querySelectorAll("input[required]");

  for (const campo of campos) {

    if (!campo.value.trim()) {

      campo.focus();

      campo.reportValidity();

      return false;

    }

  }


  // Verifica se todas as perguntas da etapa foram respondidas.
  const grupos = [...new Set(

    [...etapa.querySelectorAll('input[type="radio"]')]

      .map(input => input.name)

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


// BOTÃO PRÓXIMO DA ETAPA 1
document.getElementById("btnProximo").addEventListener("click", () => {

  if (validarEtapa(0)) {

    mostrarEtapa(1);

  }

});


// BOTÃO VOLTAR DA ETAPA 2
document.getElementById("btnVoltarEtapa2").addEventListener("click", () => {

  mostrarEtapa(0);

});


// BOTÃO PRÓXIMO DA ETAPA 2
document.getElementById("btnProximoEtapa2").addEventListener("click", () => {

  if (validarEtapa(1)) {

    mostrarEtapa(2);

  }

});


// BOTÃO VOLTAR DA ETAPA 3
document.getElementById("btnVoltarEtapa3").addEventListener("click", () => {

  mostrarEtapa(1);

});


// CARREGAR NOME E FOTO DO PERFIL
const nomeSalvo = localStorage.getItem("finduhouseNomeProprietario");

const fotoSalva = localStorage.getItem("finduhouseFotoProprietario");

if (nomeSalvo) {

  document.getElementById("nomePerfilUsuario").textContent = nomeSalvo;

}

if (fotoSalva) {

  document.getElementById("fotoPerfilUsuario").src = fotoSalva;

}


// MÁSCARA DO CEP: 00000-000
const campoCep = document.getElementById("cep");

campoCep.addEventListener("input", () => {

  let valor = campoCep.value.replace(/\D/g, "").slice(0, 8);

  if (valor.length > 5) {

    valor = valor.slice(0, 5) + "-" + valor.slice(5);

  }

  campoCep.value = valor;

});


// SELEÇÃO E PRÉ-VISUALIZAÇÃO DAS FOTOS
const inputFotos = document.getElementById("fotosMoradia");

const previewFotos = document.getElementById("previewFotos");

let fotosSelecionadas = [];


inputFotos.addEventListener("change", () => {

  const novasFotos = [...inputFotos.files];

  const imagensValidas = novasFotos.filter(arquivo =>
    arquivo.type.startsWith("image/")
  );


  if (imagensValidas.length !== novasFotos.length) {

    alert("Selecione somente arquivos de imagem.");

  }


  if (fotosSelecionadas.length + imagensValidas.length > 5) {

    alert("Você pode adicionar no máximo 5 fotos.");

  }


  const vagas = 5 - fotosSelecionadas.length;

  fotosSelecionadas = fotosSelecionadas.concat(
    imagensValidas.slice(0, vagas)
  );


  atualizarPreview();

  inputFotos.value = "";

});


// ATUALIZAR PRÉ-VISUALIZAÇÃO
function atualizarPreview() {

  previewFotos.innerHTML = "";


  fotosSelecionadas.forEach((arquivo, indice) => {

    const item = document.createElement("div");

    item.className = "photo-item";


    const imagem = document.createElement("img");

    imagem.src = URL.createObjectURL(arquivo);

    imagem.alt = `Foto da moradia ${indice + 1}`;


    const remover = document.createElement("button");

    remover.type = "button";

    remover.className = "remove-photo";

    remover.textContent = "Remover";


    remover.addEventListener("click", () => {

      fotosSelecionadas.splice(indice, 1);

      atualizarPreview();

    });


    item.appendChild(imagem);

    item.appendChild(remover);

    previewFotos.appendChild(item);

  });

}


// ENVIAR QUESTIONÁRIO
form.addEventListener("submit", (evento) => {

  evento.preventDefault();


  if (!validarEtapa(2)) {

    return;

  }


  // Guardar respostas das perguntas.
  const respostas = {};


  form.querySelectorAll('input[type="radio"]:checked').forEach(input => {

    respostas[input.name] = input.value;

  });


  // Guardar informações da moradia.
  respostas.cep = document.getElementById("cep").value.trim();

  respostas.cidade = document.getElementById("cidade").value.trim();

  respostas.estado = document.getElementById("estado").value.trim();

  respostas.endereco = document.getElementById("endereco").value.trim();

  respostas.numero = document.getElementById("numero").value.trim();

  respostas.nomeRepublica = document.getElementById("nomeRepublica").value.trim();


  // Exibir informações no console.
  console.log("Respostas do questionário:", respostas);

  console.log("Fotos selecionadas:", fotosSelecionadas);


  alert(
    "Questionário preenchido! As respostas e fotos estão prontas para serem enviadas ao sistema."
  );

});

// RECOLHER E EXPANDIR A SIDEBAR

const sidebar = document.querySelector(".sidebar");
const layout = document.querySelector(".layout");

// Criar botão da seta
const botaoSidebar = document.createElement("button");

botaoSidebar.type = "button";
botaoSidebar.className = "sidebar-toggle";
botaoSidebar.setAttribute("aria-label", "Recolher menu");
botaoSidebar.setAttribute("aria-expanded", "true");
botaoSidebar.title = "Recolher menu";

botaoSidebar.innerHTML = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
`;

// Adicionar botão no menu lateral
sidebar.insertBefore(botaoSidebar, sidebar.firstChild);

// Alternar entre aberto e recolhido
botaoSidebar.addEventListener("click", () => {

  const recolhida = sidebar.classList.toggle("collapsed");

  layout.classList.toggle("sidebar-collapsed", recolhida);

  botaoSidebar.setAttribute("aria-expanded", String(!recolhida));

  if (recolhida) {

    botaoSidebar.setAttribute("aria-label", "Expandir menu");
    botaoSidebar.title = "Expandir menu";

    botaoSidebar.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    `;

  } else {

    botaoSidebar.setAttribute("aria-label", "Recolher menu");
    botaoSidebar.title = "Recolher menu";

    botaoSidebar.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    `;

  }

});
// INICIAR NA PRIMEIRA ETAPA
mostrarEtapa(0);