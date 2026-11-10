// URL da API para o nginx ou para o Live Server.
const API_BASE = location.port === "8080" ? "/api" : "http://localhost:8081/api";

async function chamarApi(caminho, { metodo = "GET", corpo } = {}) {
    const cabecalhos = {
        "Content-Type": "application/json"
    };
    const token = armazenamento().getItem("token");

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

function armazenamento() {
    return sessionStorage.getItem("token") ? sessionStorage : localStorage;
}

function salvarSessao({ token, usuarioId, perfil }, lembrar = false) {
    limparSessao();
    const destino = lembrar ? localStorage : sessionStorage;
    destino.setItem("token", token);
    destino.setItem("usuarioId", usuarioId);
    destino.setItem("perfil", perfil);
}

function obterSessao() {
    const origem = armazenamento();
    const token = origem.getItem("token");
    const usuarioId = origem.getItem("usuarioId");
    const perfil = origem.getItem("perfil");
    if (!token || !usuarioId || !perfil) return null;
    return { token, usuarioId, perfil };
}

function limparSessao() {
    for (const origem of [localStorage, sessionStorage]) {
        origem.removeItem("token");
        origem.removeItem("usuarioId");
        origem.removeItem("perfil");
    }
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
        DADOS_INVALIDOS: "O servidor retornou respostas inválidas.",
        SEM_CONEXAO: "Não foi possível conectar ao servidor."
    };

    return mensagens[erro && erro.codigo] || (erro && erro.mensagem) || "Algo deu errado. Tente novamente.";
}
