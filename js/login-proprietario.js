document.addEventListener("DOMContentLoaded", () => {
    // Recupera o e-mail salvo anteriormente se a opção "Lembrar de mim" foi usada
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

    if (!loginForm) return;

    const botaoEnvio = loginForm.querySelector("button[type='submit']");

    if (toggleSenha && senha) {
        toggleSenha.addEventListener("click", () => {
            const mostrandoSenha = senha.type === "password";
            senha.type = mostrandoSenha ? "text" : "password";
            toggleSenha.setAttribute("aria-label", mostrandoSenha ? "Ocultar senha" : "Mostrar senha");
            toggleSenha.setAttribute("aria-pressed", mostrandoSenha ? "true" : "false");
        });
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (mensagemErro) mensagemErro.textContent = "";
        botaoEnvio.disabled = true;

        try {
            const lembrarCheckbox = document.getElementById("lembrar");
            const lembrarChecked = lembrarCheckbox ? lembrarCheckbox.checked : false;

            const resposta = await chamarApi("/auth/login", {
                metodo: "POST",
                corpo: {
                    email: document.getElementById("email").value.trim(),
                    senha: senha.value,
                    lembrar: lembrarChecked
                }
            });

            if (resposta.perfil !== "proprietario") {
                if (mensagemErro) mensagemErro.textContent = "Esta conta não é de proprietário. Use o login correto.";
                return;
            }

            salvarSessao(resposta, lembrarChecked);
            window.location.href = "perfil-proprietario.html";
        } catch (erro) {
            if (mensagemErro) mensagemErro.textContent = mensagemDeErro(erro);
        } finally {
            botaoEnvio.disabled = false;
        }
    });
});