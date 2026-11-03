document.addEventListener("DOMContentLoaded", async () => {
    if (!exigirLogin("proprietario")) {
        return;
    }

    const gradeCasas = document.querySelector(".houses-grid");
    const estadoCasas = document.getElementById("estadoCasas");
    const sessao = obterSessao();

    try {
        const resposta = await chamarApi(`/responsaveis/${encodeURIComponent(sessao.usuarioId)}/vagas`);
        const vagas = Array.isArray(resposta && resposta.vagas) ? resposta.vagas : [];

        gradeCasas.textContent = "";

        if (vagas.length === 0) {
            estadoCasas.textContent = "Você ainda não cadastrou nenhuma casa.";
            gradeCasas.appendChild(estadoCasas);
            return;
        }

        vagas.forEach((vaga) => {
            gradeCasas.appendChild(criarCardCasa(vaga));
        });
    } catch (erro) {
        gradeCasas.textContent = "";
        estadoCasas.textContent = mensagemDeErro(erro);
        gradeCasas.appendChild(estadoCasas);
    }
});

function criarCardCasa(vaga) {
    const card = document.createElement("div");
    card.className = "house-card card";

    const cabecalho = document.createElement("div");
    cabecalho.className = "house-header";

    const status = document.createElement("span");
    status.className = "status";
    const statusInfo = {
        ativa: ["badge-active", "Ativa"],
        em_analise: ["badge-analysis", "Em Análise"],
        inativa: ["badge-inactive", "Inativa"]
    }[vaga.status] || ["badge-inactive", "Inativa"];
    status.classList.add(statusInfo[0]);
    status.textContent = statusInfo[1];

    const preco = document.createElement("div");
    preco.className = "price";
    preco.textContent = formatarPreco(vaga.valorAluguel);
    const sufixoPreco = document.createElement("span");
    sufixoPreco.textContent = "/mês";
    preco.appendChild(sufixoPreco);

    cabecalho.append(status, preco);

    const corpo = document.createElement("div");
    corpo.className = "house-body";

    const titulo = document.createElement("h3");
    titulo.textContent = vaga.titulo || "";
    const endereco = document.createElement("p");
    endereco.className = "address";
    endereco.textContent = vaga.endereco || "";
    corpo.append(titulo, endereco);

    const rodape = document.createElement("div");
    rodape.className = "house-footer";
    const botaoEditar = document.createElement("button");
    botaoEditar.className = "btn-edit";
    botaoEditar.type = "button";
    botaoEditar.textContent = "Editar anúncio";
    // TODO: implementar a edição do anúncio.
    rodape.appendChild(botaoEditar);

    card.append(cabecalho, corpo, rodape);
    return card;
}

function formatarPreco(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "R$ 0";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0
    });
}
