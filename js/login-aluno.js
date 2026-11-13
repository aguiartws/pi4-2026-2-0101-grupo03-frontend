document.addEventListener("DOMContentLoaded", () => {
    const emailSalvo = localStorage.getItem("emailLembrado");
    if (emailSalvo) {
        const inputEmail = document.getElementById("email");
        const checkLembrar = document.getElementById("lembrar");
        if (inputEmail) inputEmail.value = emailSalvo;
        if (checkLembrar) checkLembrar.checked = true;
    }

    const senha = document.getElementById("senha");
    const toggleSenha = document.getElementById("toggleSenha");
    const loginForm = document.getElementById("loginForm");
    const mensagemErro = document.getElementById("mensagemErro");
    const botaoEnvio = loginForm.querySelector("button[type='submit']");

    toggleSenha.addEventListener("click", () => {
        const mostrandoSenha = senha.type === "password";
        senha.type = mostrandoSenha ? "text" : "password";
        toggleSenha.setAttribute("aria-label", mostrandoSenha ? "Ocultar senha" : "Mostrar senha");
        toggleSenha.setAttribute("aria-pressed", mostrandoSenha ? "true" : "false");
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagemErro.textContent = "";
        botaoEnvio.disabled = true;

        try {
            const resposta = await chamarApi("/auth/login", {
                metodo: "POST",
                corpo: {
                    email: document.getElementById("email").value.trim(),
                    senha: senha.value,
                    lembrar: document.getElementById("lembrar").checked
                }
            });

            if (resposta.perfil !== "estudante") {
                mensagemErro.textContent = "Esta conta não é de estudante. Use o login correto.";
                return;
            }

            salvarSessao(resposta, document.getElementById("lembrar").checked);
            window.location.href = "questionario-aluno.html";
        } catch (erro) {
            mensagemErro.textContent = mensagemDeErro(erro);
        } finally {
            botaoEnvio.disabled = false;
        }
    });
});