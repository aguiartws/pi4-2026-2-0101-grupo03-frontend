(function configurarBarraLateral() {
    if (!exigirLogin("estudante")) return;

    const appLayout = document.getElementById("appLayout");
    const sidebarToggle = document.getElementById("sidebarToggle");

    if (!appLayout || !sidebarToggle) {
        return;
    }

    sidebarToggle.addEventListener("click", () => {
        appLayout.classList.toggle("collapsed");

        const recolhida = appLayout.classList.contains("collapsed");
        sidebarToggle.setAttribute(
            "aria-label",
            recolhida ? "Expandir menu" : "Recolher menu"
        );
    });
})();

const TIPO_USUARIO = "aluno";

const API_PERFIL = `${API_BASE}/usuario/perfil`;

const form = document.getElementById("formConfiguracoes");
const fotoInput = document.getElementById("fotoPerfil");
const fotoPreview = document.getElementById("fotoPreview");
const removerFoto = document.getElementById("removerFoto");
const erroFoto = document.getElementById("erroFoto");
const erroSenha = document.getElementById("erroSenha");
const mensagem = document.getElementById("mensagem");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");
const telefoneInput = document.getElementById("telefone");
const nomeInput = document.getElementById("nome");
const nomeExibicao = document.getElementById("nomeExibicao");
const tipoExibicao = document.getElementById("tipoExibicao");

const FOTO_PADRAO = "../imagens/avatar-padrao.png";
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

let fotoSelecionada = null;
let removerFotoSelecionada = false;
let urlFotoTemporaria = null;
// Última versão do perfil confirmada pelo servidor (usada pelo botão Descartar).
let perfilSalvo = null;


// Formata o telefone no padrão (00) 00000-0000
function formatarTelefone(valor) {
    let numeros = String(valor || "").replace(/\D/g, "").slice(0, 11);

    if (numeros.length > 10) {
        return numeros.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    }
    if (numeros.length > 6) {
        return numeros.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    }
    if (numeros.length > 2) {
        return numeros.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    }
    if (numeros.length > 0) {
        return numeros.replace(/^(\d*)/, "($1");
    }
    return "";
}

// Preenche a tela com os dados do perfil (fonte única para carregar, salvar e descartar).
function preencherFormulario(perfil) {
    if (nomeInput) nomeInput.value = perfil.nome || "";

    const emailEl = document.getElementById("email");
    if (emailEl) emailEl.value = perfil.email || "";

    if (telefoneInput) telefoneInput.value = formatarTelefone(perfil.telefone);

    const cidadeEl = document.getElementById("cidade");
    if (cidadeEl) cidadeEl.value = perfil.cidade || "";

    const cursoEl = document.getElementById("curso");
    if (cursoEl) cursoEl.value = perfil.curso || "";

    if (fotoPreview) {
        fotoPreview.src = urlImagemSegura(perfil.fotoPerfilUrl, FOTO_PADRAO);
    }

    if (nomeExibicao) {
        nomeExibicao.textContent = perfil.nome || "Seu perfil";
    }
}

// Descarta tudo o que foi alterado na tela e não foi salvo.
function limparAlteracoesPendentes() {
    if (urlFotoTemporaria) {
        URL.revokeObjectURL(urlFotoTemporaria);
        urlFotoTemporaria = null;
    }

    fotoSelecionada = null;
    removerFotoSelecionada = false;

    if (fotoInput) fotoInput.value = "";
    if (novaSenha) novaSenha.value = "";
    if (confirmarSenha) confirmarSenha.value = "";

    if (erroFoto) erroFoto.textContent = "";
    if (erroSenha) erroSenha.textContent = "";
    if (mensagem) {
        mensagem.textContent = "";
        mensagem.className = "form-feedback";
    }
}

// atualiza o nome mostrado no cartão de perfil.
if (nomeInput && nomeExibicao) {
    nomeInput.addEventListener("input", () => {
        nomeExibicao.textContent = nomeInput.value.trim() || "Seu perfil";
    });
}

// Máscara de telefone
if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
        e.target.value = formatarTelefone(e.target.value);
    });
}

// mostra a foto escolhida antes do envio ao servidor.
if (fotoInput && fotoPreview) {
    fotoInput.addEventListener("change", () => {
        if (erroFoto) erroFoto.textContent = "";

        const arquivo = fotoInput.files[0];

        if (!arquivo) {
            return;
        }

        if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
            if (erroFoto) erroFoto.textContent = mensagemDeErro({ codigo: "ARQUIVO_INVALIDO" });
            fotoInput.value = "";
            fotoSelecionada = null;
            return;
        }

        if (arquivo.size === 0 || arquivo.size > TAMANHO_MAXIMO_FOTO) {
            if (erroFoto) erroFoto.textContent = mensagemDeErro({ codigo: "ARQUIVO_INVALIDO" });
            fotoInput.value = "";
            fotoSelecionada = null;
            return;
        }

        if (urlFotoTemporaria) {
            URL.revokeObjectURL(urlFotoTemporaria);
        }

        fotoSelecionada = arquivo;
        removerFotoSelecionada = false;
        urlFotoTemporaria = URL.createObjectURL(arquivo);
        fotoPreview.src = urlFotoTemporaria;
    });
}

// remove a foto atual
if (removerFoto) {
    removerFoto.addEventListener("click", () => {
        if (fotoInput) fotoInput.value = "";
        fotoSelecionada = null;
        removerFotoSelecionada = true;
        if (fotoPreview) fotoPreview.src = FOTO_PADRAO;
        if (erroFoto) erroFoto.textContent = "";

        if (urlFotoTemporaria) {
            URL.revokeObjectURL(urlFotoTemporaria);
            urlFotoTemporaria = null;
        }
    });
}

// visibilidade da senha
document.querySelectorAll(".toggle-password").forEach((botao) => {
    botao.addEventListener("click", () => {
        const campo = document.getElementById(botao.dataset.target);
        if (!campo) return;
        const icone = botao.querySelector("i");
        const mostrarSenha = campo.type === "password";

        campo.type = mostrarSenha ? "text" : "password";

        if (icone) {
            icone.classList.toggle("fa-eye", !mostrarSenha);
            icone.classList.toggle("fa-eye-slash", mostrarSenha);
        }

        botao.setAttribute(
            "aria-label",
            mostrarSenha ? "Ocultar senha" : "Mostrar senha"
        );
    });
});

if (confirmarSenha && erroSenha) {
    confirmarSenha.addEventListener("input", () => {
        erroSenha.textContent = "";
    });
}

// reset (botão Descartar): volta para o que está salvo no banco
if (form) {
    form.addEventListener("reset", (event) => {
        // Impede o reset nativo, que limparia os campos em vez de restaurá-los.
        event.preventDefault();

        limparAlteracoesPendentes();

        if (perfilSalvo) {
            preencherFormulario(perfilSalvo);
        }
    });

    // submit
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (mensagem) {
            mensagem.textContent = "";
            mensagem.className = "form-feedback";
        }
        if (erroSenha) erroSenha.textContent = "";

        const senhaFoiPreenchida = novaSenha?.value || confirmarSenha?.value;

        if (senhaFoiPreenchida) {
            if (novaSenha.value !== confirmarSenha.value) {
                if (erroSenha) erroSenha.textContent = "As senhas não coincidem.";
                confirmarSenha.focus();
                return;
            }
        }

        const dados = new FormData(form);

        dados.delete("confirmarSenha");
        dados.set("tipoUsuario", TIPO_USUARIO);
        dados.set("nome", nomeInput.value.trim());
        dados.set("email", document.getElementById("email").value.trim());
        dados.set("telefone", telefoneInput.value.trim());
        dados.set("cidade", document.getElementById("cidade").value.trim());
        dados.set("curso", document.getElementById("curso")?.value.trim() || "");
        dados.set("novaSenha", novaSenha?.value || "");
        dados.set("removerFoto", String(removerFotoSelecionada && !fotoSelecionada));

        if (!fotoSelecionada) {
            dados.delete("fotoPerfil");
        }

        try {
            const resultado = await chamarApiMultipart("/usuario/perfil", {
                metodo: "PUT",
                corpo: dados
            });
            perfilSalvo = resultado;
            preencherFormulario(perfilSalvo);

            if (mensagem) {
                mensagem.textContent = "Alterações salvas com sucesso!";
                mensagem.classList.add("success");
            }

            fotoSelecionada = null;
            removerFotoSelecionada = false;
            if (urlFotoTemporaria) {
                URL.revokeObjectURL(urlFotoTemporaria);
                urlFotoTemporaria = null;
            }

            if (fotoInput) fotoInput.value = "";
            if (novaSenha) novaSenha.value = "";
            if (confirmarSenha) confirmarSenha.value = "";

        } catch (erro) {
            if (mensagem) {
                mensagem.textContent = mensagemDeErro(erro);
                mensagem.classList.add("error");
            }
        }
    });
}

// carregar perfil
async function carregarPerfil() {
    try {
        const perfil = await chamarApi("/usuario/perfil");

        perfilSalvo = perfil;
        preencherFormulario(perfil);

    } catch (erro) {
        if (mensagem) {
            mensagem.textContent = mensagemDeErro(erro);
            mensagem.classList.add("error");
        }
    }
}

carregarPerfil();