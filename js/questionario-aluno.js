document.addEventListener('DOMContentLoaded', () => {

  const PERGUNTAS = [
    { icon: '🔊', texto: 'Você aceita barulho depois das 22h durante a semana?' },
    { icon: '🚬', texto: 'Você fuma?' },
    { icon: '🐶', texto: 'Você aceita animais de estimação?' },
    { icon: '🎉', texto: 'Você gosta de receber visitas em casa?' },
    { icon: '🍳', texto: 'Você gosta de cozinhar em casa?' },
    { icon: '📚', texto: 'Você costuma estudar em casa?' },
    { icon: '🧹', texto: 'Você aceita dividir as tarefas domésticas?' },
    { icon: '🛏️', texto: 'Você aceitaria dividir o quarto com outra pessoa?' },
    { icon: '🎶', texto: 'Você topa que a casa receba festas de vez em quando?' },
    { icon: '🤝', texto: 'Você é uma pessoa comunicativa com colegas?' },
  ];

  const LIMITE_ARRASTO = 100;
  const MIN_CARACTERES_SOBRE = 10;

  // ... (mantenha todo o código de referências do DOM e funções de criar cartões, arrastar, responder, mostrarSobreMim, atualizarContador, mostrarResultado, reiniciar que fizemos antes) ...

  // Apenas garanta que a parte final está assim:
  
  btnConfirmar.addEventListener('click', () => {
    const dadosFinais = {
      respostas: respostas,
      sobreMim: sobreMimTexto
    };

    // Salva no navegador
    localStorage.setItem('finduhouse_perfil_aluno', JSON.stringify(dadosFinais));

    // Redireciona para o perfil
    window.location.href = 'perfil-aluno.html';
  });

  criarCartoes();
});