/* =====================================================
   FindUHouse – Editar anúncio
   Usa as funções compartilhadas de api.js
   (chamarApi, exigirLogin, obterSessao, mensagemDeErro)
   ===================================================== */
const PAGINA_LISTA = 'suas-casas.html';

document.addEventListener('DOMContentLoaded', () => {
  if (!exigirLogin('proprietario')) return;
  iniciar();
});

const $ = (sel) => document.querySelector(sel);
const form = $('#formAnuncio');
const casaId = new URLSearchParams(location.search).get('id');

const campos = {
  titulo: $('#titulo'),
  descricao: $('#descricao'),
  regrasCasa: $('#regrasCasa'),
  preco: $('#preco'),
  numeroMoradores: $('#numeroMoradores'),
  endereco: $('#endereco'),
  latitude: $('#latitude'),
  longitude: $('#longitude')
};

const BOOLEANOS = [
  'aceitaAnimais', 'fuma', 'aceitaBarulhoDepoisDas22',
  'gostaReceberVisitas', 'gostaCozinhar', 'estudaEmCasa',
  'aceitaDividirTarefas', 'aceitaDividirQuarto', 'aceitaFestas',
  'comunicativo'
];

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, erro = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('error', erro);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ---------- Prévia ---------- */
const brl = (v) => Number(v || 0).toLocaleString('pt-BR');

function statusAtual() {
  const marcado = form.querySelector('input[name="status"]:checked');
  return marcado ? marcado.value : 'ativa';
}

function atualizarPrevia() {
  $('#pvTitulo').textContent = campos.titulo.value.trim() || 'Título do anúncio';
  $('#pvPreco').innerHTML = `R$ ${brl(campos.preco.value)}<span>/mês</span>`;
  $('#pvEndereco').textContent = campos.endereco.value.trim() || 'Endereço';

  const n = Number(campos.numeroMoradores.value || 0);
  $('#pvMeta').textContent = n ? `${n} ${n > 1 ? 'moradores' : 'morador'}` : '';

  const inativa = statusAtual() === 'inativa';
  const badge = $('#pvStatus');
  badge.textContent = inativa ? 'Inativa' : 'Ativa';
  badge.className = `status ${inativa ? 'badge-inactive' : 'badge-active'}`;
  document.querySelector('.preview').classList.toggle('is-inactive', inativa);
}

function atualizarContadores() {
  $('#contTitulo').textContent = campos.titulo.value.length;
  $('#contDescricao').textContent = campos.descricao.value.length;
}

/* ---------- Preencher com DetalheResponse ---------- */
function preencherFormulario(vaga) {
  campos.titulo.value = vaga.titulo ?? '';
  campos.descricao.value = vaga.descricao ?? '';
  campos.regrasCasa.value = vaga.regrasCasa ?? '';
  campos.preco.value = vaga.valorAluguel ?? '';
  campos.numeroMoradores.value = vaga.numeroMoradores ?? '';
  campos.endereco.value = vaga.endereco ?? '';
  campos.latitude.value = vaga.latitude ?? '';
  campos.longitude.value = vaga.longitude ?? '';

  // DetalheResponse aninha os booleanos em "regrasConvivencia"
  const regras = vaga.regrasConvivencia || {};
  BOOLEANOS.forEach((nome) => {
    const cb = form.querySelector(`input[name="${nome}"]`);
    if (!cb) return;
    const v = regras[nome];
    cb.checked = v === true || v === 'true';
  });

  // status já vem "ativa"/"inativa"/"em_analise" (@JsonProperty no enum)
  const st = String(vaga.status || 'ativa').toLowerCase();
  const radio = (st === 'inativa' || st === 'em_analise') ? 'inativa' : 'ativa';
  form.querySelector(`input[name="status"][value="${radio}"]`).checked = true;

  atualizarContadores();
  atualizarPrevia();
}

/* ---------- Carregar ---------- */
async function carregar() {
  atualizarPrevia();
  if (!casaId) {
    toast('Anúncio não encontrado.', true);
    return;
  }
  try {
    const resposta = await chamarApi(`/vagas/${encodeURIComponent(casaId)}`);
    const vaga = resposta && resposta.vaga ? resposta.vaga : resposta;
    preencherFormulario(vaga);
  } catch (err) {
    toast(mensagemDeErro(err), true);
    console.error('GET /vagas:', err);
  }
}

/* ---------- Salvar (PATCH /vagas/{id}) ----------
   O EdicaoRequest do backend aceita apenas:
     { responsavelId, valorAluguel }
   Os demais campos do formulário não têm endpoint de edição hoje.
------------------------------------------------- */
async function salvar(e) {
  e.preventDefault();

  const obrigatorios = ['preco'];
  let primeiroErro = null;
  obrigatorios.forEach((nome) => {
    const el = campos[nome];
    const vazio = !String(el.value).trim() || Number(el.value) <= 0;
    el.classList.toggle('invalid', vazio);
    if (vazio && !primeiroErro) primeiroErro = el;
  });
  if (primeiroErro) {
    primeiroErro.focus();
    toast('Informe um valor de aluguel válido.', true);
    return;
  }

  const sessao = obterSessao();
  const dados = {
    responsavelId: Number(sessao.usuarioId),
    valorAluguel: Number(campos.preco.value)
  };

  const btn = $('#btnSalvar');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    await chamarApi(`/vagas/${encodeURIComponent(casaId)}`, {
      method: 'PATCH',
      body: dados
    });
    toast('Anúncio atualizado!');
    setTimeout(() => (location.href = PAGINA_LISTA), 900);
  } catch (err) {
    toast(mensagemDeErro(err), true);
    console.error('PATCH /vagas:', err);
    btn.disabled = false;
    btn.textContent = 'Salvar alterações';
  }
}

/* ---------- Excluir ----------
   Não há DELETE no VagaController. Desativado até existir no backend.
------------------------------------------------- */
function configurarExcluir() {
  const dlg = $('#dlgExcluir');
  const btn = $('#btnExcluir');
  if (btn) {
    btn.addEventListener('click', () => {
      toast('Exclusão ainda não disponível.', true);
    });
  }
  // Se/quando o backend ganhar DELETE, troque o handler acima por:
  // btn.addEventListener('click', () => dlg.showModal());
  // dlg.addEventListener('close', async () => {
  //   if (dlg.returnValue !== 'confirm') return;
  //   try {
  //     await chamarApi(`/vagas/${encodeURIComponent(casaId)}`, { method: 'DELETE' });
  //     toast('Anúncio excluído.');
  //     setTimeout(() => (location.href = PAGINA_LISTA), 800);
  //   } catch (err) { toast(mensagemDeErro(err), true); }
  // });
}

/* ---------- Init ---------- */
function iniciar() {
  form.addEventListener('input', () => {
    atualizarContadores();
    atualizarPrevia();
    Object.values(campos).forEach((c) => c.classList.remove('invalid'));
  });
  form.addEventListener('change', atualizarPrevia);
  form.addEventListener('submit', salvar);
  configurarExcluir();
  carregar();
}