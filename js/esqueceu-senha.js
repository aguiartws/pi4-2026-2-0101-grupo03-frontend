
// API_BASE vem de api.js (mesmo endereço usado pelo resto do app)
const API_NOVA_SENHA = `${API_BASE}/auth/redefinir-senha`;

const novaSenhaForm = document.getElementById("novaSenhaForm");
if (novaSenhaForm) {
  const senhaInput = document.getElementById("novaSenha");
  const confirmarInput = document.getElementById("confirmarSenha");
  const mensagem = document.getElementById("mensagem");
  const botao = document.getElementById("salvarSenha");

  document.querySelectorAll("[data-toggle]").forEach((controle) => {
    controle.addEventListener("click", () => {
      const campo = document.getElementById(controle.dataset.toggle);
      const mostrar = campo.type === "password";
      campo.type = mostrar ? "text" : "password";
      controle.setAttribute("aria-pressed", String(mostrar));
      controle.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
    });
  });

  novaSenhaForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensagem.textContent = "";
    mensagem.classList.remove("success");
    senhaInput.classList.remove("is-invalid");
    confirmarInput.classList.remove("is-invalid");

    const token = new URLSearchParams(window.location.search).get("token")
      || sessionStorage.getItem("tokenRecuperacao");

    if (!token) {
      mensagem.textContent = "Sua sessão de recuperação não foi encontrada. Solicite um novo código.";
      return;
    }
   
    if (senhaInput.value !== confirmarInput.value) {
      confirmarInput.classList.add("is-invalid");
      mensagem.textContent = "As senhas não coincidem. Confira os dois campos.";
      confirmarInput.focus();
      return;
    }

    botao.disabled = true;
    botao.textContent = "Salvando...";
    try {
      const resposta = await fetch(API_NOVA_SENHA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenRecuperacao: token, novaSenha: senhaInput.value })
      });
      const resultado = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(resultado.mensagem || resultado.message || "Não foi possível alterar sua senha.");

      sessionStorage.removeItem("tokenRecuperacao");
      mensagem.textContent = "Senha alterada com sucesso! Redirecionando para o login...";
      mensagem.classList.add("success");
      novaSenhaForm.reset();
      const destinoLogin = sessionStorage.getItem("origemLogin") === "proprietario"
        ? "login-proprietario.html"
        : "login-aluno.html";
      sessionStorage.removeItem("origemLogin");
      setTimeout(() => { window.location.href = destinoLogin; }, 1600);
    } catch (erro) {
      mensagem.textContent = erro.message || "Ocorreu um erro. Tente novamente.";
    } finally {
      botao.disabled = false;
      botao.textContent = "Salvar nova senha";
    }
  });
}
