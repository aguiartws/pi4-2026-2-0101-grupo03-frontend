const TIPO_USUARIO = "aluno";
const API_PERFIL = "/api/usuario/perfil";
const form = document.getElementById("formConfiguracoes");
const fotoInput = document.getElementById("fotoPerfil");
const fotoPreview = document.getElementById("fotoPreview");
const erroFoto = document.getElementById("erroFoto");
const mensagem = document.getElementById("mensagem");
const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");
const erroSenha = document.getElementById("erroSenha");
const FOTO_PADRAO = "../imagens/avatar-padrao.png"; 
let fotoSelecionada = null;
let removerFotoSelecionada = false;

if (TIPO_USUARIO === "proprietario") {
  document.getElementById("grupoCurso").hidden = true;
  document.getElementById("curso").disabled = true;
  document.getElementById("labelCidade").textContent = "Cidade onde fica a moradia";
  document.getElementById("cidade").placeholder = "Digite a cidade da moradia";
} else {
  document.getElementById("curso").required = true;
}

fotoInput.addEventListener("change", () => {
  erroFoto.textContent = "";
  const arquivo = fotoInput.files[0];
  if (!arquivo) return;
  const permitidos = ["image/jpeg", "image/png", "image/webp"];
  if (!permitidos.includes(arquivo.type)) {
    erroFoto.textContent = "Escolha uma imagem JPG, PNG ou WEBP.";
    fotoInput.value = "";
    fotoSelecionada = null;
    return;
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    erroFoto.textContent = "A imagem deve ter no máximo 5 MB.";
    fotoInput.value = "";
    fotoSelecionada = null;
    return;
  }
  fotoSelecionada = arquivo;
  removerFotoSelecionada = false;
  fotoPreview.src = URL.createObjectURL(arquivo);
});

document.getElementById("removerFoto").addEventListener("click", () => {
  fotoInput.value = "";
  fotoSelecionada = null;
  removerFotoSelecionada = true;
  fotoPreview.src = FOTO_PADRAO;
  erroFoto.textContent = "";
});

document.querySelectorAll(".toggle-password").forEach((botao) => {
  botao.addEventListener("click", () => {
    const campo = document.getElementById(botao.dataset.target);
    const icone = botao.querySelector("i");
    const mostrar = campo.type === "password";
    campo.type = mostrar ? "text" : "password";
    icone.classList.toggle("fa-eye", !mostrar);
    icone.classList.toggle("fa-eye-slash", mostrar);
    botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
  });
});

confirmarSenha.addEventListener("input", () => erroSenha.textContent = "");
form.addEventListener("reset", () => {
  setTimeout(() => {
    fotoInput.value = "";
    fotoSelecionada = null;
    removerFotoSelecionada = false;
    fotoPreview.src = FOTO_PADRAO;
    erroFoto.textContent = "";
    erroSenha.textContent = "";
    mensagem.textContent = "";
    mensagem.className = "form-feedback";
  }, 0);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  mensagem.textContent = "";
  mensagem.className = "form-feedback";
  erroSenha.textContent = "";

  if (novaSenha.value || confirmarSenha.value) {
    if (novaSenha.value.length < 8) {
      erroSenha.textContent = "A senha deve ter pelo menos 8 caracteres.";
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
  if (!fotoSelecionada) dados.delete("fotoPerfil");

  try {
    const resposta = await fetch(API_PERFIL, {
      method: "PUT",
      body: dados,
      credentials: "include"
    });
    if (!resposta.ok) throw new Error("Não foi possível salvar as alterações.");
    const resultado = await resposta.json();
    if (resultado.fotoPerfilUrl) fotoPreview.src = resultado.fotoPerfilUrl;
    mensagem.textContent = "Alterações salvas com sucesso!";
    mensagem.classList.add("success");
    fotoSelecionada = null;
    removerFotoSelecionada = false;
    fotoInput.value = "";
    novaSenha.value = "";
    confirmarSenha.value = "";
  } catch (erro) {
    mensagem.textContent = erro.message || "Ocorreu um erro ao salvar. Tente novamente.";
    mensagem.classList.add("error");
  }
});

