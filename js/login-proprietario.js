document.addEventListener("DOMContentLoaded", () => {

    // CAMPO DE SENHA
    const senha = document.getElementById("senha");

    // BOTÃO DO ÍCONE DE OLHO
    const toggleSenha = document.getElementById("toggleSenha");

    // MOSTRAR OU OCULTAR A SENHA
    toggleSenha.addEventListener("click", () => {

        if (senha.type === "password") {
            senha.type = "text";
            toggleSenha.setAttribute("aria-label", "Ocultar senha");
            toggleSenha.setAttribute("aria-pressed", "true");

        } else {
            senha.type = "password";
            toggleSenha.setAttribute("aria-label", "Mostrar senha");
            toggleSenha.setAttribute("aria-pressed", "false");
        }

    });

    // FORMULÁRIO DE LOGIN
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senhaDigitada = senha.value.trim();

        // VERIFICA SE OS CAMPOS ESTÃO PREENCHIDOS
        if (email === "" || senhaDigitada === "") {
            alert("Por favor, preencha o e-mail e a senha.");
            return;
        }

        // DIRECIONA PARA O PERFIL
        window.location.href = "perfil-proprietario.html";

    });

});