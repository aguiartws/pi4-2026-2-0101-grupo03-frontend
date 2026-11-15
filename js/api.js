const API_BASE = "http://localhost:8081/api";

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
            console.warn("Token inválido detectado, mas a trava está desativada para testes.");
        }

        throw erroApi;
    }

    return dados;
}

async function chamarApiMultipart(caminho, { metodo = "POST", corpo } = {}) {
    const cabecalhos = {};
    const token = armazenamento().getItem("token");

    if (token) {
        cabecalhos.Authorization = `Bearer ${token}`;
    }

    let resposta;

    try {
        resposta = await fetch(`${API_BASE}${caminho}`, {
            method: metodo,
            headers: cabecalhos,
            body: corpo
        });
    } catch (erro) {
        throw {
            codigo: "SEM_CONEXAO",
            mensagem: "Não foi possível conectar ao servidor."
        };
    }

    const textoResposta = await resposta.text();
    let dados = null;

    if (textoResposta) {
        try {
            dados = JSON.parse(textoResposta);
        } catch (erro) {
            dados = null;
        }
    }

    if (!resposta.ok) {
        throw {
            codigo: dados && dados.codigo,
            mensagem: dados && dados.mensagem,
            status: resposta.status
        };
    }

    return dados;
}

function armazenamento() {
    return localStorage.getItem("token") ? localStorage : sessionStorage;
}

function salvarSessao({ token, usuarioId, perfil }, lembrar = false) {
    limparSessao();
    const destino = lembrar ? localStorage : sessionStorage;
    destino.setItem("token", token);
    destino.setItem("usuarioId", usuarioId);
    destino.setItem("perfil", perfil);

    const emailUsuario = document.getElementById("email")?.value;
    if (lembrar && emailUsuario) {
        localStorage.setItem("emailLembrado", emailUsuario.trim());
    } else {
        localStorage.removeItem("emailLembrado");
    }
}

function obterSessao() {
    const origem = localStorage.getItem("token") ? localStorage : (sessionStorage.getItem("token") ? sessionStorage : null);
    if (!origem) {
        return { 
            token: "mock-token-de-teste", 
            usuarioId: "1", 
            perfil: "estudante" 
        };
    }
    const token = origem.getItem("token");
    const usuarioId = origem.getItem("usuarioId");
    const perfil = origem.getItem("perfil");
    
    if (!token || !usuarioId || !perfil) {
        return { 
            token: "mock-token-de-teste", 
            usuarioId: "1", 
            perfil: "estudante" 
        };
    }
    
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
    console.warn(`[MODO DE TESTE] Proteção desativada. Acesso liberado para o perfil: ${perfilEsperado}`);
    return true;
}

function mensagemDeErro(erro) {
    const mensagens = {
        EMAIL_JA_EXISTE: "Este e-mail já está cadastrado.",
        EMAIL_INSTITUCIONAL_INVALIDO: "Use um e-mail institucional válido (ex.: @puccampinas.edu.br).",
        CREDENCIAIS_INVALIDAS: "E-mail ou senha incorretos.",
        DADOS_OBRIGATORIOS: "Preencha todos os campos corretamente.",
        DADOS_INVALIDOS: "O servidor retornou respostas inválidas.",
        SEM_CONEXAO: "Não foi possível conectar ao servidor.",
        ARQUIVO_INVALIDO: "Escolha uma imagem JPG, PNG ou WEBP de até 5 MB.",
        LIMITE_FOTOS_EXCEDIDO: "Cada moradia aceita no máximo 5 fotos.",
        FALHA_UPLOAD_IMAGEM: "Não foi possível enviar a imagem. Tente novamente.",
        ACESSO_NEGADO: "Você não tem permissão para esta ação."
    };

    return mensagens[erro && erro.codigo] || (erro && erro.mensagem) || "Algo deu errado. Tente novamente.";
}

window.api = {
  chamarApi,
  chamarApiMultipart,
  salvarSessao,
  obterSessao,
  limparSessao,
  exigirLogin,
  mensagemDeErro
};