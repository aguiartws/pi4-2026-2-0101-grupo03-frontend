document.addEventListener("DOMContentLoaded", () => {
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
                    senha: senha.value
                }
            });

            if (resposta.perfil !== "proprietario") {
                mensagemErro.textContent = "Esta conta não é de proprietário. Use o login correto.";
                return;
            }

            salvarSessao(resposta);
            window.location.href = "perfil-proprietario.html";
        } catch (erro) {
            mensagemErro.textContent = mensagemDeErro(erro);
        } finally {
            botaoEnvio.disabled = false;
        }
    });
});