
document.addEventListener("DOMContentLoaded", () => {

    // CAMPOS DE SENHA
    const senha = document.getElementById("senha");
    const confirmarSenha = document.getElementById("confirmarSenha");

    // BOTÕES DOS ÍCONES DE OLHO
    const toggleSenha = document.getElementById("toggleSenha");
    const toggleConfirmarSenha = document.getElementById("toggleConfirmarSenha");


    // FUNÇÃO PARA MOSTRAR OU OCULTAR UMA SENHA
    function configurarOlho(campo, botao) {

        botao.addEventListener("click", () => {

            if (campo.type === "password") {
                campo.type = "text";

                botao.setAttribute("aria-label", "Ocultar senha");
                botao.setAttribute("aria-pressed", "true");

            } else {
                campo.type = "password";

                botao.setAttribute("aria-label", "Mostrar senha");
                botao.setAttribute("aria-pressed", "false");
            }

        });

    }


    // CONFIGURA OS DOIS ÍCONES
    configurarOlho(senha, toggleSenha);
    configurarOlho(confirmarSenha, toggleConfirmarSenha);


    // FORMULÁRIO DE CADASTRO
    const cadastroForm = document.getElementById("cadastroForm");
    const mensagemErro = document.getElementById("mensagemErro");


    cadastroForm.addEventListener("submit", (event) => {

        event.preventDefault();

        // VERIFICA SE AS SENHAS SÃO IGUAIS
        if (senha.value !== confirmarSenha.value) {

            mensagemErro.textContent = "As senhas não coincidem.";
            confirmarSenha.focus();

            return;
        }

        mensagemErro.textContent = "";

        // DADOS INFORMADOS NO CADASTRO
        const dadosCadastro = {
            perfil: "proprietario",
            email: document.getElementById("email").value,
            telefone: document.getElementById("telefone").value,
            cidade: document.getElementById("cidade").value
        };

        console.log("Dados do cadastro:", dadosCadastro);

        alert("Cadastro preenchido com sucesso! A integração com o servidor ainda precisa ser feita.");
        window.location.href = "login-proprietario.html";

    });

});
