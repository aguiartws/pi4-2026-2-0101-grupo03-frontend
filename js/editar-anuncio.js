/* =====================================================
   FindUHouse – Editar anúncio (com logs de request/response)
   ===================================================== */
const PAGINA_LISTA = "suas-casas.html";
const LOG = "[editar-anuncio]";

document.addEventListener("DOMContentLoaded", () => {
  if (!exigirLogin("proprietario")) return;
  iniciar();
});

const $ = (sel) => document.querySelector(sel);
const form = $("#formAnuncio");
const casaId = new URLSearchParams(location.search).get("id");

const campos = {
  titulo: $("#titulo"),
  descricao: $("#descricao"),
  regrasCasa: $("#regrasCasa"),
  preco: $("#preco"),
  numeroMoradores: $("#numeroMoradores"),
  endereco: $("#endereco"),
  latitude: $("#latitude"),
  longitude: $("#longitude"),
};

const BOOLEANOS = [
  "aceitaAnimais",
  "fuma",
  "aceitaBarulhoDepoisDas22",
  "gostaReceberVisitas",
  "gostaCozinhar",
  "estudaEmCasa",
  "aceitaDividirTarefas",
  "aceitaDividirQuarto",
  "aceitaFestas",
  "comunicativo",
];

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, erro = false) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("error", erro);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}

/* ---------- Prévia ---------- */
const brl = (v) => Number(v || 0).toLocaleString("pt-BR");

function statusAtual() {
  const marcado = form.querySelector('input[name="status"]:checked');
  return marcado ? marcado.value : "ativa";
}

function atualizarPrevia() {
  $("#pvTitulo").textContent =
    campos.titulo.value.trim() || "Título do anúncio";
  $("#pvPreco").innerHTML = `R$ ${brl(campos.preco.value)}<span>/mês</span>`;
  $("#pvEndereco").textContent = campos.endereco.value.trim() || "Endereço";
  const n = Number(campos.numeroMoradores.value || 0);
  $("#pvMeta").textContent = n ? `${n} ${n > 1 ? "moradores" : "morador"}` : "";
  const inativa = statusAtual() === "inativa";
  const badge = $("#pvStatus");
  badge.textContent = inativa ? "Inativa" : "Ativa";
  badge.className = `status ${inativa ? "badge-inactive" : "badge-active"}`;
  document.querySelector(".preview").classList.toggle("is-inactive", inativa);
}

function atualizarContadores() {
  $("#contTitulo").textContent = campos.titulo.value.length;
  $("#contDescricao").textContent = campos.descricao.value.length;
}

/* ---------- Preencher ---------- */
function preencherFormulario(vaga) {
  console.log(`${LOG} preencherFormulario — JSON recebido do GET:`, vaga);
  campos.titulo.value = vaga.titulo ?? "";
  campos.descricao.value = vaga.descricao ?? "";
  campos.regrasCasa.value = vaga.regrasCasa ?? "";
  campos.preco.value = vaga.valorAluguel ?? "";
  campos.numeroMoradores.value = vaga.numeroMoradores ?? "";
  campos.endereco.value = vaga.endereco ?? "";
  campos.latitude.value = vaga.latitude ?? "";
  campos.longitude.value = vaga.longitude ?? "";

  const regras = vaga.regrasConvivencia || {};
  BOOLEANOS.forEach((nome) => {
    const cb = form.querySelector(`input[name="${nome}"]`);
    if (!cb) return;
    const v = regras[nome];
    cb.checked = v === true || v === "true";
  });

  const st = String(vaga.status || "ativa").toLowerCase();
  const radio = st === "inativa" || st === "em_analise" ? "inativa" : "ativa";
  form.querySelector(`input[name="status"][value="${radio}"]`).checked = true;

  atualizarContadores();
  atualizarPrevia();
}

/* ---------- Carregar ---------- */
async function carregar() {
  atualizarPrevia();
  if (!casaId) {
    toast("Anúncio não encontrado.", true);
    return;
  }
  try {
    const resposta = await chamarApi(`/vagas/${encodeURIComponent(casaId)}`);
    const vaga = resposta && resposta.vaga ? resposta.vaga : resposta;
    preencherFormulario(vaga);
  } catch (err) {
    toast(mensagemDeErro(err), true);
    console.error("GET /vagas:", err);
  }
}

async function salvar(e) {
  e.preventDefault();

  const el = campos.preco;
  const vazio = !String(el.value).trim() || Number(el.value) <= 0;
  el.classList.toggle("invalid", vazio);
  if (vazio) {
    el.focus();
    toast("Informe um valor de aluguel válido.", true);
    return;
  }

  const sessao = obterSessao();

  // Monta as regras de convivência
  const regras = {};
  BOOLEANOS.forEach((nome) => {
    const cb = form.querySelector(`input[name="${nome}"]`);
    regras[nome] = cb ? cb.checked : false;
  });

  const dados = {
    responsavelId: Number(sessao.usuarioId),
    titulo: campos.titulo.value.trim(),
    descricao: campos.descricao.value.trim(),
    endereco: campos.endereco.value.trim(),
    valorAluguel: Number(campos.preco.value),
    numeroMoradores: Number(campos.numeroMoradores.value),
    regrasCasa: campos.regrasCasa.value.trim(),
    latitude: Number(campos.latitude.value),
    longitude: Number(campos.longitude.value),
    status: statusAtual(),
    regrasConvivencia: regras,
  };

  const url = `/vagas/${encodeURIComponent(casaId)}`;

  console.log(`[editar-anuncio] ▶ PATCH ${url}`);
  console.log(`[editar-anuncio] Payload:`, dados);

  const btn = $("#btnSalvar");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    // Declarando a variável 'resposta' corretamente
    const resposta = await chamarApi(url, {
      metodo: "PATCH",
      corpo: dados,
    });

    console.log(`[editar-anuncio] ✔ PATCH respondeu:`, resposta);
    toast("Anúncio atualizado!");

    // Reativa o botão e aguarda 1 segundo para voltar para a lista
    btn.disabled = false;
    btn.textContent = "Salvar alterações";
    setTimeout(() => (location.href = PAGINA_LISTA), 1000);
  } catch (err) {
    console.error(`[editar-anuncio] ✖ PATCH falhou:`, err);
    toast(mensagemDeErro(err), true);
    btn.disabled = false;
    btn.textContent = "Salvar alterações";
  }
}

/* ---------- Excluir ---------- */
function configurarExcluir() {
  const btn = $("#btnExcluir");
  if (btn) {
    btn.addEventListener("click", () => {
      toast("Exclusão ainda não disponível.", true);
    });
  }
}

/* ---------- Init ---------- */
function iniciar() {
  form.addEventListener("input", () => {
    atualizarContadores();
    atualizarPrevia();
    Object.values(campos).forEach((c) => c.classList.remove("invalid"));
  });
  form.addEventListener("change", atualizarPrevia);
  form.addEventListener("submit", salvar);
  configurarExcluir();
  carregar();
}
