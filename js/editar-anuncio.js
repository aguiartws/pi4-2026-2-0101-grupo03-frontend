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

/* ---------- Estado das fotos ---------- */
let fotosSelecionadas = []; // File[] novos, ainda não enviados
let fotosAtuais = []; // [{ id, url }] vindas do servidor
let fotosParaRemover = []; // ids marcados para exclusão ao salvar
let blobUrls = []; // object URLs das prévias

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_FOTOS = 5;

const fotosAtuaisVisiveis = () =>
  fotosAtuais.filter((f) => !fotosParaRemover.includes(f.id));
const totalFotos = () => fotosAtuaisVisiveis().length + fotosSelecionadas.length;

// Aceita objetos { id, url } (formato atual da API)
function extrairFotos(vaga) {
  const lista = Array.isArray(vaga.fotos) ? vaga.fotos : [];
  return lista.filter((f) => f && typeof f === "object" && f.id != null && f.url);
}

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
  $("#pvPreco").innerHTML = `R$ ${escaparHtml(brl(campos.preco.value))}<span>/mês</span>`;
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

/* ---------- Fotos da moradia (até 5) ---------- */
function configurarFotosMoradia() {
  const inputFotos = $("#inputFotosMoradia");
  const erroFotos = $("#erroFotosVaga");
  if (!inputFotos) return;

  inputFotos.addEventListener("change", (e) => {
    erroFotos.textContent = "";
    const novos = Array.from(e.target.files);

    if (totalFotos() + novos.length > MAX_FOTOS) {
      erroFotos.textContent = mensagemDeErro({ codigo: "LIMITE_FOTOS_EXCEDIDO" });
      inputFotos.value = "";
      return;
    }

    for (const arquivo of novos) {
      if (
        !TIPOS_PERMITIDOS.includes(arquivo.type) ||
        arquivo.size === 0 ||
        arquivo.size > TAMANHO_MAXIMO_FOTO
      ) {
        erroFotos.textContent = mensagemDeErro({ codigo: "ARQUIVO_INVALIDO" });
        inputFotos.value = "";
        return;
      }
    }

    fotosSelecionadas.push(...novos);
    inputFotos.value = "";
    renderizarPreviewsFotos();
  });
}

function criarMiniatura(src, alt, nova, aoRemover) {
  const div = document.createElement("div");
  div.style.cssText =
    "position:relative;width:110px;height:110px;flex-shrink:0;border-radius:8px;overflow:hidden;" +
    `border:1px ${nova ? "dashed" : "solid"} var(--border);`;

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
  img.onerror = () => console.error(`${LOG} Não foi possível carregar a foto:`, src);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "×";
  btn.title = "Remover foto";
  btn.setAttribute("aria-label", "Remover foto");
  btn.style.cssText =
    "position:absolute;top:5px;right:5px;width:24px;height:24px;border:none;border-radius:50%;" +
    "background:rgba(0,0,0,.7);color:#fff;font-size:18px;line-height:1;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;";
  btn.addEventListener("click", aoRemover);

  div.append(img, btn);
  return div;
}

function renderizarPreviewsFotos() {
  const container = $("#containerPreviewFotos");
  if (!container) return;

  blobUrls.forEach((u) => URL.revokeObjectURL(u));
  blobUrls = [];
  container.innerHTML = "";

  // Fotos já salvas (as marcadas para remoção somem da tela)
  fotosAtuaisVisiveis().forEach((foto, i) => {
    const url = urlImagemSegura(foto.url, "");
    console.log(`${LOG} Foto ${i + 1}:`, foto, url);
    if (!url) return;
    container.appendChild(
      criarMiniatura(url, `Foto da moradia ${i + 1}`, false, () => {
        fotosParaRemover.push(foto.id);
        $("#erroFotosVaga").textContent = "";
        renderizarPreviewsFotos();
      }),
    );
  });

  // Fotos novas, ainda não enviadas
  fotosSelecionadas.forEach((arquivo, i) => {
    const u = URL.createObjectURL(arquivo);
    blobUrls.push(u);
    container.appendChild(
      criarMiniatura(u, `Nova foto ${i + 1}`, true, () => {
        fotosSelecionadas.splice(i, 1);
        renderizarPreviewsFotos();
      }),
    );
  });
}

/* ---------- Preencher ---------- */
function preencherFormulario(vaga) {
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
    console.log(`${LOG} Dados da vaga:`, vaga);
    console.log(`${LOG} Fotos recebidas:`, vaga.fotos);

    fotosAtuais = extrairFotos(vaga);
    preencherFormulario(vaga);
    renderizarPreviewsFotos();
  } catch (err) {
    toast(mensagemDeErro(err), true);
    console.error(`${LOG} Erro ao carregar GET /vagas:`, err);
  }
}

/* ---------- Salvar ---------- */
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

  const idSeguro = encodeURIComponent(casaId);
  const btn = $("#btnSalvar");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    // 1. Atualiza os dados da vaga
    await chamarApi(`/vagas/${idSeguro}`, { metodo: "PATCH", corpo: dados });

    // 2. Remove as fotos marcadas (antes de enviar, para liberar espaço no limite de 5)
    for (const fotoId of [...fotosParaRemover]) {
      await chamarApi(`/vagas/${idSeguro}/fotos/${encodeURIComponent(fotoId)}`, {
        metodo: "DELETE",
      });
      fotosAtuais = fotosAtuais.filter((f) => f.id !== fotoId);
      fotosParaRemover = fotosParaRemover.filter((id) => id !== fotoId);
    }

    // 3. Envia as fotos novas
    if (fotosSelecionadas.length > 0) {
      if (fotosAtuais.length + fotosSelecionadas.length > MAX_FOTOS) {
        throw { codigo: "LIMITE_FOTOS_EXCEDIDO" };
      }

      const formData = new FormData();
      fotosSelecionadas.forEach((foto) => formData.append("fotos", foto));

      const resultadoFotos = await chamarApiMultipart(`/vagas/${idSeguro}/fotos`, {
        corpo: formData,
      });
      if (!resultadoFotos || !Array.isArray(resultadoFotos.fotos)) {
        throw { codigo: "FALHA_UPLOAD_IMAGEM" };
      }
      fotosSelecionadas = [];
    }

    toast("Anúncio atualizado com sucesso!");
    btn.disabled = false;
    btn.textContent = "Salvar alterações";
    setTimeout(() => (location.href = PAGINA_LISTA), 1000);
  } catch (err) {
    toast(mensagemDeErro(err), true);
    console.error(`${LOG} Erro ao salvar:`, err);
    renderizarPreviewsFotos();
    btn.disabled = false;
    btn.textContent = "Salvar alterações";
  }
}

/* ---------- Excluir anúncio ---------- */
function configurarExcluir() {
  const btnExcluir = $("#btnExcluir");
  const dlg = $("#dlgExcluir");
  const btnConfirmar = $("#btnConfirmarExcluir");

  if (!btnExcluir || !dlg) return;

  btnExcluir.addEventListener("click", (e) => {
    e.preventDefault();
    dlg.showModal();
  });

  btnConfirmar.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!casaId) return;

    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.textContent = "Excluindo...";
    btnConfirmar.disabled = true;

    const url = `/vagas/${encodeURIComponent(casaId)}`;

    try {
      await chamarApi(url, { metodo: "DELETE" });
      dlg.close();
      toast("Anúncio excluído com sucesso!");
      setTimeout(() => {
        window.location.href = PAGINA_LISTA;
      }, 1500);
    } catch (err) {
      console.error(`${LOG} ✖ DELETE falhou:`, err);
      if (err.status === 401 || err.status === 403) {
        toast("Você não tem permissão para excluir este anúncio.", true);
      } else {
        toast(mensagemDeErro(err), true);
      }
      btnConfirmar.textContent = textoOriginal;
      btnConfirmar.disabled = false;
      dlg.close();
    }
  });
}

/* ---------- Init ---------- */
/* ---------- Barra lateral (recolher/expandir) ---------- */
function configurarSidebar() {
  const layout = $("#appLayout");
  const toggle = $("#sidebarToggle");
  if (!layout || !toggle) return;
  toggle.addEventListener("click", () => layout.classList.toggle("collapsed"));
}

function iniciar() {
  configurarSidebar();
  form.addEventListener("input", () => {
    atualizarContadores();
    atualizarPrevia();
    Object.values(campos).forEach((c) => c.classList.remove("invalid"));
  });
  form.addEventListener("change", atualizarPrevia);
  form.addEventListener("submit", salvar);
  configurarExcluir();
  configurarFotosMoradia();
  carregar();
}