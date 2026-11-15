(function configurarBarraLateral() {
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

const TIPO_USUARIO = "proprietario";

// ajustar a rota para o endpoint 
const API_PERFIL = "/api/usuario/perfil";

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

// atualiza o nome mostrado no cartão de perfil.
if (nomeInput && nomeExibicao) {
    nomeInput.addEventListener("input", () => {
        nomeExibicao.textContent = nomeInput.value.trim() || "Seu perfil";
    });
}

// Máscara de telefone
if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        
        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }

        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (valor.length > 6) {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
        } else if (valor.length > 0) {
            valor = valor.replace(/^(\d*)/, "($1");
        }

        e.target.value = valor;
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
            if (erroFoto) erroFoto.textContent = "Escolha uma imagem JPG, PNG ou WEBP.";
            fotoInput.value = "";
            fotoSelecionada = null;
            return;
        }

        if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
            if (erroFoto) erroFoto.textContent = "A imagem deve ter no máximo 5 MB.";
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

// reset
if (form) {
    form.addEventListener("reset", () => {
        setTimeout(() => {
            if (fotoInput) fotoInput.value = "";
            fotoSelecionada = null;
            removerFotoSelecionada = false;

            if (fotoPreview) fotoPreview.src = FOTO_PADRAO;

            if (nomeExibicao && nomeInput) {
                nomeExibicao.textContent = nomeInput.value.trim() || "Seu perfil";
            }

            if (erroFoto) erroFoto.textContent = "";
            if (erroSenha) erroSenha.textContent = "";
            if (mensagem) {
                mensagem.textContent = "";
                mensagem.className = "form-feedback";
            }

            if (urlFotoTemporaria) {
                URL.revokeObjectURL(urlFotoTemporaria);
                urlFotoTemporaria = null;
            }
        }, 0);
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
        dados.append("tipoUsuario", TIPO_USUARIO);
        dados.append("removerFoto", String(removerFotoSelecionada));

        if (!fotoSelecionada) {
            dados.delete("fotoPerfil");
        }

        try {
            const resposta = await fetch(API_PERFIL, {
                method: "PUT",
                body: dados,
                credentials: "include"
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível salvar as alterações.");
            }

            const resultado = await resposta.json();

            if (resultado.fotoPerfilUrl && fotoPreview) {
                fotoPreview.src = resultado.fotoPerfilUrl;
            }

            if (resultado.nome && nomeInput && nomeExibicao) {
                nomeInput.value = resultado.nome;
                nomeExibicao.textContent = resultado.nome;
            }

            if (mensagem) {
                mensagem.textContent = "Alterações salvas com sucesso!";
                mensagem.classList.add("success");
            }

            fotoSelecionada = null;
            removerFotoSelecionada = false;

            if (fotoInput) fotoInput.value = "";
            if (novaSenha) novaSenha.value = "";
            if (confirmarSenha) confirmarSenha.value = "";

        } catch (erro) {
            if (mensagem) {
                mensagem.textContent = erro.message || "Ocorreu um erro ao salvar. Tente novamente.";
                mensagem.classList.add("error");
            }
        }
    });
}

// carregar perfil
async function carregarPerfil() {
    try {
        const resposta = await fetch(API_PERFIL, {
            method: "GET",
            credentials: "include"
        });

        if (!resposta.ok) {
            return;
        }

        const perfil = await resposta.json();

        if (nomeInput) nomeInput.value = perfil.nome || "";

        const emailEl = document.getElementById("email");
        if (emailEl) emailEl.value = perfil.email || "";

        const telefoneSalvo = perfil.telefone || "";
        let telefoneFormatado = telefoneSalvo.replace(/\D/g, "");

        if (telefoneFormatado.length > 10) {
            telefoneFormatado = telefoneFormatado.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (telefoneFormatado.length > 6) {
            telefoneFormatado = telefoneFormatado.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (telefoneFormatado.length > 2) {
            telefoneFormatado = telefoneFormatado.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
        } else if (telefoneFormatado.length > 0) {
            telefoneFormatado = telefoneFormatado.replace(/^(\d*)/, "($1");
        }

        const telefoneEl = document.getElementById("telefone");
        if (telefoneEl) telefoneEl.value = telefoneFormatado;

        const cidadeEl = document.getElementById("cidade");
        if (cidadeEl) cidadeEl.value = perfil.cidade || "";

        if (perfil.fotoPerfilUrl && fotoPreview) {
            fotoPreview.src = perfil.fotoPerfilUrl;
        }

        if (nomeExibicao) {
            nomeExibicao.textContent = perfil.nome || "Seu perfil";
        }

    } catch (erro) {
        console.error("Não foi possível carregar o perfil:", erro);
    }
}

configurarTipoUsuario();
carregarPerfil();