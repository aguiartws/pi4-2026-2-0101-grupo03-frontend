
const API_RECUPERACAO = {
  solicitar: "/api/auth/solicitar-recuperacao",
  verificar: "/api/auth/verificar-codigo"
};

const solicitarForm = document.getElementById("solicitarCodigoForm");
const verificarForm = document.getElementById("verificarCodigoForm");

if (solicitarForm && verificarForm) {
  const emailInput = document.getElementById("email");
  const emailDestino = document.getElementById("emailDestino");
  const mensagem = document.getElementById("mensagem");
  const codigoInputs = [...document.querySelectorAll(".code-input")];
  const reenviarButton = document.getElementById("reenviarCodigo");
  const contador = document.getElementById("contador");
  let emailAtual = "";
  let intervalo = null;

  function mostrarMensagem(texto, sucesso = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle("success", sucesso);
  }

  function iniciarContagem() {
    clearInterval(intervalo);
    let segundos = 60;
    reenviarButton.disabled = true;
    contador.textContent = `(${segundos}s)`;
    intervalo = setInterval(() => {
      segundos--;
      contador.textContent = `(${segundos}s)`;
      if (segundos <= 0) {
        clearInterval(intervalo);
        contador.textContent = "";
        reenviarButton.disabled = false;
      }
    }, 1000);
  }

  async function requisicao(url, dados) {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const resultado = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(resultado.mensagem || resultado.message || "Não foi possível concluir a solicitação.");
    return resultado;
  }

  solicitarForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarMensagem("");
    if (!emailInput.checkValidity()) {
      emailInput.focus();
      mostrarMensagem("Digite um endereço de e-mail válido.");
      return;
    }

    emailAtual = emailInput.value.trim();
    const botao = document.getElementById("enviarCodigo");
    botao.disabled = true;
    botao.textContent = "Enviando...";

    try {
      await requisicao(API_RECUPERACAO.solicitar, { email: emailAtual });
      emailDestino.textContent = emailAtual;
      solicitarForm.hidden = true;
      verificarForm.hidden = false;
      mostrarMensagem("Se o e-mail estiver cadastrado, você receberá um código de verificação.", true);
      iniciarContagem();
      codigoInputs[0].focus();
    } catch (erro) {
      mostrarMensagem(erro.message || "Não foi possível enviar o código. Tente novamente.");
    } finally {
      botao.disabled = false;
      botao.textContent = "Enviar código";
    }
  });

  codigoInputs.forEach((input, indice) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(-1);
      input.classList.remove("is-invalid");
      if (input.value && indice < codigoInputs.length - 1) codigoInputs[indice + 1].focus();
    });

    input.addEventListener("keydown", (evento) => {
      if (evento.key === "Backspace" && !input.value && indice > 0) codigoInputs[indice - 1].focus();
      if (evento.key === "ArrowLeft" && indice > 0) codigoInputs[indice - 1].focus();
      if (evento.key === "ArrowRight" && indice < codigoInputs.length - 1) codigoInputs[indice + 1].focus();
    });

    input.addEventListener("paste", (evento) => {
      const colado = (evento.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 4);
      if (!colado) return;
      evento.preventDefault();
      colado.split("").forEach((digito, posicao) => { if (codigoInputs[posicao]) codigoInputs[posicao].value = digito; });
      codigoInputs[Math.min(colado.length, 4) - 1].focus();
    });
  });

  verificarForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarMensagem("");
    const codigo = codigoInputs.map(input => input.value).join("");
    if (codigo.length !== 4) {
      codigoInputs.forEach(input => { if (!input.value) input.classList.add("is-invalid"); });
      mostrarMensagem("Digite os 4 números do código enviado ao seu e-mail.");
      codigoInputs.find(input => !input.value)?.focus();
      return;
    }

    const botao = verificarForm.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = "Verificando...";
    try {
      const resultado = await requisicao(API_RECUPERACAO.verificar, { email: emailAtual, codigo });
      if (!resultado.tokenRecuperacao) throw new Error("A resposta do servidor não retornou o token de recuperação.");
      sessionStorage.setItem("tokenRecuperacao", resultado.tokenRecuperacao);
      window.location.href = `nova-senha.html?token=${encodeURIComponent(resultado.tokenRecuperacao)}`;
    } catch (erro) {
      codigoInputs.forEach(input => { input.value = ""; input.classList.add("is-invalid"); });
      codigoInputs[0].focus();
      mostrarMensagem(erro.message || "Código inválido ou expirado. Confira e tente novamente.");
    } finally {
      botao.disabled = false;
      botao.textContent = "Verificar código";
    }
  });

  reenviarButton.addEventListener("click", async () => {
    mostrarMensagem("");
    reenviarButton.disabled = true;
    try {
      await requisicao(API_RECUPERACAO.solicitar, { email: emailAtual });
      mostrarMensagem("Se o e-mail estiver cadastrado, um novo código será enviado.", true);
      iniciarContagem();
    } catch (erro) {
      mostrarMensagem(erro.message || "Não foi possível reenviar o código.");
      reenviarButton.disabled = false;
    }
  });

  document.getElementById("trocarEmail").addEventListener("click", () => {
    clearInterval(intervalo);
    verificarForm.hidden = true;
    solicitarForm.hidden = false;
    codigoInputs.forEach(input => { input.value = ""; input.classList.remove("is-invalid"); });
    mostrarMensagem("");
    emailInput.focus();
  });
}
