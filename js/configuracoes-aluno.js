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

const TIPO_USUARIO = "aluno";

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
const nomeInput = document.getElementById("nome");
const nomeExibicao = document.getElementById("nomeExibicao");
const tipoExibicao = document.getElementById("tipoExibicao");

const FOTO_PADRAO = "../imagens/avatar-padrao.png";
const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

let fotoSelecionada = null;
let removerFotoSelecionada = false;
let urlFotoTemporaria = null;


// ajustar os campos exibidos de acordo com o tipo de conta
function configurarTipoUsuario() {
    const grupoCurso = document.getElementById("grupoCurso");
    const labelCidade = document.getElementById("labelCidade");
    const cidade = document.getElementById("cidade");

    if (TIPO_USUARIO === "proprietario") {
        grupoCurso.hidden = true;
        tipoExibicao.textContent = "Conta de proprietário";
        labelCidade.textContent = "Cidade onde fica a moradia";
        cidade.placeholder = "Digite a cidade da moradia";
        return;
    }

    tipoExibicao.textContent = "Conta de estudante";
    document.getElementById("curso").required = true;
}


// atualiza o nome mostrado no cartão de perfil.
nomeInput.addEventListener("input", () => {
    nomeExibicao.textContent = nomeInput.value.trim() || "Seu perfil";
});


// mostra a foto escolhida antes do envio ao servidor.
fotoInput.addEventListener("change", () => {
    erroFoto.textContent = "";

    const arquivo = fotoInput.files[0];

    if (!arquivo) {
        return;
    }

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
        erroFoto.textContent = "Escolha uma imagem JPG, PNG ou WEBP.";
        fotoInput.value = "";
        fotoSelecionada = null;
        return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
        erroFoto.textContent = "A imagem deve ter no máximo 5 MB.";
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


// remove a foto atual. a remoção só será efetivada após salvar
removerFoto.addEventListener("click", () => {
    fotoInput.value = "";
    fotoSelecionada = null;
    removerFotoSelecionada = true;
    fotoPreview.src = FOTO_PADRAO;
    erroFoto.textContent = "";

    if (urlFotoTemporaria) {
        URL.revokeObjectURL(urlFotoTemporaria);
        urlFotoTemporaria = null;
    }
});


// permite visualizar ou ocultar os campos de senha.
document.querySelectorAll(".toggle-password").forEach((botao) => {
    botao.addEventListener("click", () => {
        const campo = document.getElementById(botao.dataset.target);
        const icone = botao.querySelector("i");
        const mostrarSenha = campo.type === "password";

        campo.type = mostrarSenha ? "text" : "password";

        icone.classList.toggle("fa-eye", !mostrarSenha);
        icone.classList.toggle("fa-eye-slash", mostrarSenha);

        botao.setAttribute(
            "aria-label",
            mostrarSenha ? "Ocultar senha" : "Mostrar senha"
        );
    });
});


confirmarSenha.addEventListener("input", () => {
    erroSenha.textContent = "";
});


// restaura a pré-visualização e as mensagens ao descartar alterações.
form.addEventListener("reset", () => {
    setTimeout(() => {
        fotoInput.value = "";
        fotoSelecionada = null;
        removerFotoSelecionada = false;

        fotoPreview.src = FOTO_PADRAO;

        nomeExibicao.textContent =
            nomeInput.value.trim() || "Seu perfil";

        erroFoto.textContent = "";
        erroSenha.textContent = "";
        mensagem.textContent = "";
        mensagem.className = "form-feedback";

        if (urlFotoTemporaria) {
            URL.revokeObjectURL(urlFotoTemporaria);
            urlFotoTemporaria = null;
        }
    }, 0);
});


// envia os dados atualizados para o backend
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    mensagem.textContent = "";
    mensagem.className = "form-feedback";
    erroSenha.textContent = "";

    const senhaFoiPreenchida =
        novaSenha.value || confirmarSenha.value;

    if (senhaFoiPreenchida) {

        if (novaSenha.value.length < 8) {
            erroSenha.textContent =
                "A senha deve ter pelo menos 8 caracteres.";

            novaSenha.focus();
            return;
        }

        if (novaSenha.value !== confirmarSenha.value) {
            erroSenha.textContent = "As senhas não coincidem.";

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
            throw new Error(
                "Não foi possível salvar as alterações."
            );
        }

        const resultado = await resposta.json();

        if (resultado.fotoPerfilUrl) {
            fotoPreview.src = resultado.fotoPerfilUrl;
        }

        if (resultado.nome) {
            nomeInput.value = resultado.nome;
            nomeExibicao.textContent = resultado.nome;
        }

        mensagem.textContent =
            "Alterações salvas com sucesso!";

        mensagem.classList.add("success");

        fotoSelecionada = null;
        removerFotoSelecionada = false;

        fotoInput.value = "";
        novaSenha.value = "";
        confirmarSenha.value = "";

    } catch (erro) {
        mensagem.textContent =
            erro.message ||
            "Ocorreu um erro ao salvar. Tente novamente.";

        mensagem.classList.add("error");
    }
});


// carrega as informações atuais do perfil
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

        nomeInput.value = perfil.nome || "";

        document.getElementById("email").value =
            perfil.email || "";

        document.getElementById("telefone").value =
            perfil.telefone || "";

        document.getElementById("cidade").value =
            perfil.cidade || "";

        if (perfil.curso && TIPO_USUARIO === "aluno") {
            document.getElementById("curso").value =
                perfil.curso;
        }

        if (perfil.fotoPerfilUrl) {
            fotoPreview.src = perfil.fotoPerfilUrl;
        }

        nomeExibicao.textContent =
            perfil.nome || "Seu perfil";

    } catch (erro) {
        console.error(
            "Não foi possível carregar o perfil:",
            erro
        );
    }
}


configurarTipoUsuario();
carregarPerfil();

