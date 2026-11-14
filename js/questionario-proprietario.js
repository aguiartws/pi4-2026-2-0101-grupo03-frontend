
const form = document.getElementById('formQuestionario');

const etapa1 = document.getElementById('etapa1');
const etapa2 = document.getElementById('etapa2');

const btnProximo = document.getElementById('btnProximo');
const btnVoltar = document.getElementById('btnVoltar');

const inputFotos = document.getElementById('fotosMoradia');
const previewFotos = document.getElementById('previewFotos');

const inputEndereco = document.getElementById('endereco');

let fotosSelecionadas = [];


// ---------- VALIDAR ENDEREÇO ----------

function validarEndereco() {

  if (inputEndereco.value.trim() === '') {

    alert('Por favor, informe o endereço da sua residência.');

    inputEndereco.focus();

    inputEndereco.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    return false;
  }

  return true;
}


// ---------- VALIDAR PERGUNTAS ----------

function validarEtapa(etapa) {

  const grupos = etapa.querySelectorAll('fieldset');

  for (const grupo of grupos) {

    const radios = grupo.querySelectorAll('input[type="radio"]');

    let respondida = false;

    radios.forEach(radio => {
      if (radio.checked) {
        respondida = true;
      }
    });

    if (!respondida) {

      alert('Por favor, responda todas as perguntas antes de continuar.');

      grupo.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      return false;
    }
  }

  return true;
}


// ---------- IR PARA A ETAPA 2 ----------

btnProximo.addEventListener('click', function () {

  // Primeiro verifica se o endereço foi preenchido
  if (!validarEndereco()) {
    return;
  }

  // Depois verifica se as perguntas da etapa 1 foram respondidas
  if (!validarEtapa(etapa1)) {
    return;
  }

  etapa1.hidden = true;
  etapa2.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

});


// ---------- VOLTAR PARA A ETAPA 1 ----------

btnVoltar.addEventListener('click', function () {

  etapa2.hidden = true;
  etapa1.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

});


// ---------- SELECIONAR FOTOS ----------

inputFotos.addEventListener('change', function () {

  const novasFotos = Array.from(inputFotos.files);

  if (fotosSelecionadas.length + novasFotos.length > 5) {

    alert('Você pode adicionar no máximo 5 fotos.');

    inputFotos.value = '';
    return;
  }

  for (const foto of novasFotos) {

    if (!foto.type.startsWith('image/')) {
      alert('Selecione somente arquivos de imagem.');
      continue;
    }

    fotosSelecionadas.push(foto);
  }

  inputFotos.value = '';

  mostrarFotos();

});


// ---------- MOSTRAR PRÉVIA DAS FOTOS ----------

function mostrarFotos() {

  // Libera as URLs das imagens que estavam na prévia anterior
  previewFotos.querySelectorAll('img').forEach(imagem => {
    URL.revokeObjectURL(imagem.src);
  });

  previewFotos.innerHTML = '';

  fotosSelecionadas.forEach((foto, indice) => {

    const container = document.createElement('div');
    container.classList.add('photo-item');

    const imagem = document.createElement('img');

    imagem.src = URL.createObjectURL(foto);
    imagem.alt = 'Foto da moradia ' + (indice + 1);

    const botaoRemover = document.createElement('button');

    botaoRemover.type = 'button';
    botaoRemover.classList.add('remove-photo');
    botaoRemover.textContent = '×';
    botaoRemover.setAttribute('aria-label', 'Remover foto');

    botaoRemover.addEventListener('click', function () {

      fotosSelecionadas.splice(indice, 1);

      mostrarFotos();

    });

    container.appendChild(imagem);
    container.appendChild(botaoRemover);

    previewFotos.appendChild(container);

  });

}


// ---------- ENVIAR QUESTIONÁRIO ----------

form.addEventListener('submit', function (event) {

  event.preventDefault();

  // Verifica novamente o endereço
  if (!validarEndereco()) {
    return;
  }

  // Verifica as perguntas da segunda etapa
  if (!validarEtapa(etapa2)) {
    return;
  }

  const respostas = {};

  // Guarda o endereço preenchido
  respostas.endereco = inputEndereco.value.trim();

  // Guarda todas as respostas das perguntas
  const campos = form.querySelectorAll('input[type="radio"]:checked');

  campos.forEach(campo => {
    respostas[campo.name] = campo.value;
  });

  // Mostra os dados no console
  console.log('Respostas do questionário:', respostas);
  console.log('Fotos selecionadas:', fotosSelecionadas);

  alert(
    'As respostas e fotos foram preparadas! Na próxima etapa vamos conectar o formulário ao servidor para realizar o envio definitivo.'
  );

});
