document.addEventListener("DOMContentLoaded", async () => {
  if (!exigirLogin("proprietario")) return;

  const gradeCasas = document.querySelector(".houses-grid");
  const sessao = obterSessao();

  try {
    const resposta = await chamarApi(`/vagas/responsavel/${encodeURIComponent(sessao.usuarioId)}`);
    const vagas = Array.isArray(resposta && resposta.vagas) ? resposta.vagas : [];

    gradeCasas.textContent = "";

    if (vagas.length === 0) {
      // Se não tiver casas, mostra a mensagem direto na grade
      gradeCasas.innerHTML = "<p style='color: #666; font-style: italic;'>Você ainda não cadastrou nenhuma casa.</p>";
      return;
    }

    vagas.forEach((vaga) => {
      gradeCasas.appendChild(criarCardCasa(vaga));
    });
  } catch (erro) {
    gradeCasas.textContent = "";
    // Se der erro, mostra a mensagem direto na grade
    gradeCasas.innerHTML = `<p style='color: #e53935; font-style: italic;'>${mensagemDeErro(erro)}</p>`;
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
    inativa: ["badge-inactive", "Inativa"],
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
  botaoEditar.addEventListener("click", () => {
    window.location.href = `editar-anuncio.html?id=${encodeURIComponent(vaga.id)}`;
  });
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
    maximumFractionDigits: 0,
  });
}
