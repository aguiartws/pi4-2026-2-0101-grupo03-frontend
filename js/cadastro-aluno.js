(() => {
  'use strict';

  const campo = document.getElementById('telefone');
  if (!campo) return;

  /* (19) 99999-9999 para celular (11 dígitos)
     (19) 9999-9999  para fixo    (10 dígitos) */
  function formatarTelefone(valor) {
    const d = valor.replace(/\D/g, '').slice(0, 11);

    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function aplicarMascara() {
    // guarda quantos dígitos havia antes do cursor
    const digitosAntes = campo.value
      .slice(0, campo.selectionStart)
      .replace(/\D/g, '').length;

    campo.value = formatarTelefone(campo.value);

    // devolve o cursor para depois do mesmo número de dígitos
    let posicao = 0;
    let contados = 0;
    while (posicao < campo.value.length && contados < digitosAntes) {
      if (/\d/.test(campo.value[posicao])) contados++;
      posicao++;
    }
    campo.setSelectionRange(posicao, posicao);
  }

  campo.addEventListener('input', aplicarMascara);

  // cobre preenchimento automático do navegador
  if (campo.value) campo.value = formatarTelefone(campo.value);
})();

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
                }
            });

            // Limpa a memória para garantir que ele faça o questionário agora
            localStorage.removeItem('finduhouse_perfil_aluno');

            // Vai direto para o questionário
            window.location.href = "questionario-aluno.html";
        } catch (erro) {
            mensagemErro.textContent = mensagemDeErro(erro);
        } finally {
            botaoEnvio.disabled = false;
        }
    });
});