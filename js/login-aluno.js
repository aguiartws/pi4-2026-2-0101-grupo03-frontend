(() => {
  'use strict';

  const API_URL = '/api/login';                 // rota de login do back
  const DESTINO_APOS_LOGIN = 'home-aluno.html'; // página após entrar
  const DOMINIOS_PERMITIDOS = ['puccampinas.edu.br']; // só aceita e-mails institucionais puc

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const lembrarInput = document.getElementById('lembrar');
  const emailErro = document.getElementById('emailErro');
  const senhaErro = document.getElementById('senhaErro');
  const formErro = document.getElementById('formErro');
  const btnEntrar = document.getElementById('btnEntrar');
  const toggleSenha = document.getElementById('toggleSenha');

  toggleSenha.addEventListener('click', () => {
    const mostrando = senhaInput.type === 'text';
    senhaInput.type = mostrando ? 'password' : 'text';
    toggleSenha.setAttribute('aria-pressed', String(!mostrando));
    toggleSenha.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Ocultar senha');
  });

  function mostrarErroCampo(input, elementoErro, mensagem) {
    input.closest('.input').classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    elementoErro.textContent = mensagem; // textContent: nunca interpreta HTML
    elementoErro.hidden = false;
  }

  function limparErroCampo(input, elementoErro) {
    input.closest('.input').classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    elementoErro.textContent = '';
    elementoErro.hidden = true;
  }

  function mostrarErroGeral(mensagem) {
    formErro.textContent = mensagem;
    formErro.hidden = false;
  }

  function limparErroGeral() {
    formErro.textContent = '';
    formErro.hidden = true;
  }

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validarEmail() {
    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
      mostrarErroCampo(emailInput, emailErro, 'Informe seu e-mail institucional.');
      return false;
    }
    if (!REGEX_EMAIL.test(email)) {
      mostrarErroCampo(emailInput, emailErro, 'Digite um e-mail válido.');
      return false;
    }
    if (!DOMINIOS_PERMITIDOS.some((dominio) => email.endsWith(dominio))) {
      mostrarErroCampo(emailInput, emailErro, 'Use o e-mail institucional da sua faculdade.');
      return false;
    }

    limparErroCampo(emailInput, emailErro);
    return true;
  }

  function validarSenha() {
    if (!senhaInput.value) {
      mostrarErroCampo(senhaInput, senhaErro, 'Informe sua senha.');
      return false;
    }
    limparErroCampo(senhaInput, senhaErro);
    return true;
  }

  // valida ao sair do campo e limpa o erro assim que a pessoa volta a digitar
  emailInput.addEventListener('blur', () => {
    if (emailInput.value) validarEmail();
  });
  emailInput.addEventListener('input', () => {
    limparErroCampo(emailInput, emailErro);
    limparErroGeral();
  });
  senhaInput.addEventListener('input', () => {
    limparErroCampo(senhaInput, senhaErro);
    limparErroGeral();
  });

=  function definirCarregando(carregando) {
    btnEntrar.disabled = carregando;
    btnEntrar.textContent = carregando ? 'Entrando...' : 'Entrar';
  }

=  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErroGeral();

    const emailOk = validarEmail();
    const senhaOk = validarSenha();

    if (!emailOk) {
      emailInput.focus();
      return;
    }
    if (!senhaOk) {
      senhaInput.focus();
      return;
    }

    definirCarregando(true);

    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // necessário se o back usar cookie de sessão
        body: JSON.stringify({
          email: emailInput.value.trim().toLowerCase(),
          senha: senhaInput.value,
          lembrar: lembrarInput.checked,
        }),
      });

      if (resposta.ok) {
        window.location.href = DESTINO_APOS_LOGIN;
        return;
      }

      // mensagens por status. no login, o back deve responder igual para
      // "e-mail não existe" e "senha errada" (401), para não revelar quem tem conta.
      if (resposta.status === 401) {
        mostrarErroGeral('E-mail ou senha incorretos.');
      } else if (resposta.status === 400 || resposta.status === 422) {
        mostrarErroGeral('Confira os dados informados e tente novamente.');
      } else if (resposta.status === 403) {
        mostrarErroGeral('Sua conta não tem permissão para entrar. Fale com o suporte.');
      } else if (resposta.status === 429) {
        mostrarErroGeral('Muitas tentativas. Aguarde um pouco e tente de novo.');
      } else {
        mostrarErroGeral('Não foi possível entrar agora. Tente novamente em instantes.');
      }
    } catch (erro) {
      // sem internet ou servidor fora do ar
      mostrarErroGeral('Sem conexão com o servidor. Verifique sua internet e tente de novo.');
    } finally {
      definirCarregando(false);
    }
  });
})();