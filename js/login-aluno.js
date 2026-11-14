document.addEventListener("DOMContentLoaded", () => {
    const senha = document.getElementById("senha");
    const toggleSenha = document.getElementById("toggleSenha");
    const loginForm = document.getElementById("loginForm");
    const mensagemErro = document.getElementById("mensagemErro");
    
    // Se não houver formulário na tela, encerra o script para não dar erro
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
            // 1. Chama a API de verdade para pegar o Token
            const resposta = await chamarApi("/auth/login", {
                metodo: "POST",
                corpo: {
                    email: document.getElementById("email").value.trim(),
                    senha: senha.value,
                    lembrar: document.getElementById("lembrar") ? document.getElementById("lembrar").checked : false
                }
            });

            if (resposta.perfil !== "estudante") {
                if (mensagemErro) mensagemErro.textContent = "Esta conta não é de aluno. Use o login correto.";
                return;
            }

            // 2. Salva a sessão (Token e ID) no navegador
            salvarSessao(resposta, document.getElementById("lembrar") ? document.getElementById("lembrar").checked : false);

            // 3. Lógica para saber se vai pro questionário ou pro perfil
            const respostasSalvas = localStorage.getItem('finduhouse_perfil_aluno');

            if (respostasSalvas) {
                window.location.href = "perfil-aluno.html";
            } else {
                window.location.href = "questionario-aluno.html";
            }
            
        } catch (erro) {
            if (mensagemErro) mensagemErro.textContent = mensagemDeErro(erro);
        } finally {
            botaoEnvio.disabled = false;
        }
    });
});