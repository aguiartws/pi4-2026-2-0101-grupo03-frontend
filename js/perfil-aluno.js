document.addEventListener('DOMContentLoaded', () => {
  const sobreMimText = document.getElementById('sobreMimText');

  // Tenta recuperar os dados salvos no questionário
  const dadosSalvos = localStorage.getItem('finduhouse_perfil_aluno');

  if (dadosSalvos) {
    try {
      const dados = JSON.parse(dadosSalvos);
      
      // Se o usuário escreveu algo no "Sobre mim", exibe
      if (dados.sobreMim && dados.sobreMim.trim() !== '') {
        sobreMimText.textContent = dados.sobreMim;
      } else {
        sobreMimText.textContent = "Você ainda não escreveu nada sobre você.";
      }
    } catch (e) {
      console.error("Erro ao ler os dados", e);
      sobreMimText.textContent = "Você ainda não escreveu nada sobre você.";
    }
  } else {
    sobreMimText.textContent = "Você ainda não escreveu nada sobre você.";
  }
});