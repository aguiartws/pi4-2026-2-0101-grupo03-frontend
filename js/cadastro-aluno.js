document.addEventListener("DOMContentLoaded", () => {
    const senha = document.getElementById("senha");
    const confirmarSenha = document.getElementById("confirmarSenha");
    const toggleSenha = document.getElementById("toggleSenha");
    const toggleConfirmarSenha = document.getElementById("toggleConfirmarSenha");
    const cadastroForm = document.getElementById("cadastroForm");
    const mensagemErro = document.getElementById("mensagemErro");
    const botaoEnvio = cadastroForm.querySelector("button[type='submit']");

    function configurarOlho(campo, botao) {
        botao.addEventListener("click", () => {
            const mostrandoSenha = campo.type === "password";
            campo.type = mostrandoSenha ? "text" : "password";
            botao.setAttribute("aria-label", mostrandoSenha ? "Ocultar senha" : "Mostrar senha");
            botao.setAttribute("aria-pressed", mostrandoSenha ? "true" : "false");
        });
    }

    configurarOlho(senha, toggleSenha);
    configurarOlho(confirmarSenha, toggleConfirmarSenha);

    cadastroForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        mensagemErro.textContent = "";

        if (senha.value !== confirmarSenha.value) {
            mensagemErro.textContent = "As senhas não coincidem.";
            confirmarSenha.focus();
            return;
        }

        botaoEnvio.disabled = true;

        try {
            await chamarApi("/estudantes", {
                metodo: "POST",
                corpo: {
                    nome: document.getElementById("nome").value.trim(),
                    email: document.getElementById("email").value.trim(),
                    telefone: document.getElementById("telefone").value.trim(),
                    senha: senha.value,
                    curso: document.getElementById("curso").value.trim()
                    // TODO: cidade ainda não é aceita pelo backend.
                }
            });

            window.location.href = "login-aluno.html";
        } catch (erro) {
            mensagemErro.textContent = mensagemDeErro(erro);
        } finally {
            botaoEnvio.disabled = false;
        }
    });
});