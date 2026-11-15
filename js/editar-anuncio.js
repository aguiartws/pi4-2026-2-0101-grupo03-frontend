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

let fotosSelecionadas = [];

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

/* ---------- Configurar Upload de Fotos da Moradia (Até 5) ---------- */
function configurarFotosMoradia() {
  const inputFotos = $("#inputFotosMoradia");
  const containerPreview = $("#containerPreviewFotos");
  const erroFotos = $("#erroFotosVaga");

  if (!inputFotos) return;

  inputFotos.addEventListener("change", (e) => {
    erroFotos.textContent = "";
    const novosArquivos = Array.from(e.target.files);

    if (fotosSelecionadas.length + novosArquivos.length > 5) {
      erroFotos.textContent = "Você pode enviar no máximo 5 fotos por moradia.";
      return;
    }

    novosArquivos.forEach((arquivo) => {
      if (fotosSelecionadas.length < 5) {
        fotosSelecionadas.push(arquivo);
      }
    });

    renderizarPreviewsFotos();
  });
}

function renderizarPreviewsFotos() {
  const containerPreview = $("#containerPreviewFotos");
  containerPreview.innerHTML = "";

  fotosSelecionadas.forEach((arquivo, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.style.position = "relative";
      div.style.width = "80px";
      div.style.height = "80px";
      div.style.borderRadius = "6px";
      div.style.overflow = "hidden";
      div.style.border = "1px solid var(--border)";

      div.innerHTML = `
        <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
        <button type="button" data-index="${index}" class="btn-remover-foto" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">×</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        fotosSelecionadas.splice(index, 1);
        renderizarPreviewsFotos();
      });

      containerPreview.appendChild(div);
    };
    reader.readAsDataURL(arquivo);
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
    preencherFormulario(vaga);
  } catch (err) {
    toast(mensagemDeErro(err), true);
    console.error(`${LOG} Erro ao carregar GET /vagas:`, err);
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
  const btn = $("#btnSalvar");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    // 1. Atualiza os dados JSON da vaga
    await chamarApi(url, { metodo: "PATCH", corpo: dados });

    // 2. Se houver fotos selecionadas, envia via FormData para o endpoint de fotos da moradia
    if (fotosSelecionadas.length > 0) {
      const formData = new FormData();
      fotosSelecionadas.forEach((foto) => formData.append("fotos", foto));

      await fetch(`${API_BASE}/vagas/${casaId}/fotos`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${sessao.token}` },
        body: formData
      });
    }

    toast("Anúncio atualizado com sucesso!");
    btn.disabled = false;
    btn.textContent = "Salvar alterações";
    setTimeout(() => (location.href = PAGINA_LISTA), 1000);
  } catch (err) {
    toast(mensagemDeErro(err), true);
    console.error(`${LOG} Erro ao salvar PATCH /vagas:`, err);
    btn.disabled = false;
    btn.textContent = "Salvar alterações";
  }
}

/* ---------- Excluir ---------- */
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
      console.error(`[editar-anuncio] ✖ DELETE falhou:`, err);
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
function iniciar() {
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