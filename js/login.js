
document.addEventListener('DOMContentLoaded', () => {
  const botoesPerfil = document.querySelectorAll('.profile');

  const paginas = {
    aluno: 'login-aluno.html',
    proprietario: 'login-proprietario.html'
  };

  botoesPerfil.forEach((botao) => {
    botao.addEventListener('click', () => {
      const perfil = botao.dataset.perfil;
      const destino = paginas[perfil];

      if (!destino) {
        return;
      }

      window.location.href = destino;
    });
  });
});
