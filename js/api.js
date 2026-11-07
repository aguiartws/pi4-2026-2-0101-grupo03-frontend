// URL da API para o nginx ou para o Live Server.
const API_BASE = location.port === "8080" ? "/api" : "http://localhost:8081/api";

async function chamarApi(caminho, { metodo = "GET", corpo } = {}) {
    const cabecalhos = {
        "Content-Type": "application/json"
    };
    const token = localStorage.getItem("token");

    if (token) {
        cabecalhos.Authorization = `Bearer ${token}`;
    }

    let resposta;

    try {
        resposta = await fetch(`${API_BASE}${caminho}`, {
            method: metodo,
            headers: cabecalhos,
            body: corpo === undefined ? undefined : JSON.stringify(corpo)
        });
    } catch (erro) {
        throw {
            codigo: "SEM_CONEXAO",
            mensagem: "Não foi possível conectar ao servidor."
        };
    }

    let dados = null;
    const textoResposta = await resposta.text();

    if (textoResposta) {
        try {
            dados = JSON.parse(textoResposta);
        } catch (erro) {
            dados = null;
        }
    }

    if (!resposta.ok) {
        const erroApi = {
            codigo: dados && dados.codigo,
            mensagem: dados && dados.mensagem,
            status: resposta.status
        };

        if (erroApi.codigo === "TOKEN_INVALIDO") {
            limparSessao();
            window.location.href = "login.html";
        }

        throw erroApi;
    }

    return dados;
}

function salvarSessao({ token, usuarioId, perfil }) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuarioId", usuarioId);
    localStorage.setItem("perfil", perfil);
}

function obterSessao() {
    const token = localStorage.getItem("token");
    const usuarioId = localStorage.getItem("usuarioId");
    const perfil = localStorage.getItem("perfil");

    if (!token || !usuarioId || !perfil) {
        return null;
    }

    return { token, usuarioId, perfil };
}

function limparSessao() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("perfil");
}

function exigirLogin(perfilEsperado) {
    const sessao = obterSessao();

    if (!sessao || sessao.perfil !== perfilEsperado) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}

function mensagemDeErro(erro) {
    const mensagens = {
        EMAIL_JA_EXISTE: "Este e-mail já está cadastrado.",
        EMAIL_INSTITUCIONAL_INVALIDO: "Use um e-mail institucional válido (ex.: @puccampinas.edu.br).",
        CREDENCIAIS_INVALIDAS: "E-mail ou senha incorretos.",
        DADOS_OBRIGATORIOS: "Preencha todos os campos corretamente.",
        SEM_CONEXAO: "Não foi possível conectar ao servidor."
    };

    return mensagens[erro && erro.codigo] || "Algo deu errado. Tente novamente.";
}
