document.addEventListener("DOMContentLoaded", () => {
    const senha = document.getElementById("senha");
    const toggleSenha = document.getElementById("toggleSenha");

    if (toggleSenha && senha) {
        toggleSenha.addEventListener("click", () => {
            const mostrandoSenha = senha.type === "password";
            senha.type = mostrandoSenha ? "text" : "password";
            toggleSenha.setAttribute("aria-label", mostrandoSenha ? "Ocultar senha" : "Mostrar senha");
            toggleSenha.setAttribute("aria-pressed", mostrandoSenha ? "true" : "false");
        });
    }

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const senhaDigitada = senha.value.trim();

            if (email === "" || senhaDigitada === "") {
                alert("Por favor, preencha o e-mail e a senha.");
                return;
            }

            // LÓGICA DE REDIRECIONAMENTO
            const respostasSalvas = localStorage.getItem('finduhouse_perfil_aluno');

            if (respostasSalvas) {
                // Já respondeu -> Vai pro perfil
                window.location.href = "perfil-aluno.html";
            } else {
                // Primeira vez -> Vai pro questionário
                window.location.href = "questionario-aluno.html";
            }
        });
    }
});