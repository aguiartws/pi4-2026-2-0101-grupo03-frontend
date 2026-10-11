# Fluxo do E4: Login com e-mail institucional

**Feito quando:** O usuário entra com e-mail e senha; senha errada mostra mensagem de erro; e-mail fora do domínio institucional não conclui o cadastro.

## Passos

1. O usuário digita o e-mail institucional e a senha no formulário e clica em "Entrar".
2. O Frontend envia os dados de acesso para o Backend através da operação `autenticarUsuario` (CT7).
3. O Backend verifica se o e-mail possui o domínio institucional permitido (ex: `@puc-campinas.edu.br`).
4. O Backend lê o registro correspondente no Banco de Dados na tabela `usuario` (CT8).
5. O Banco de Dados retorna o hash da senha e o perfil do usuário.
6. O Backend compara as credenciais e valida a autenticação.
7. O Backend responde ao Frontend retornando o token de acesso (ou o código de erro em caso de dados inválidos).
8. O Frontend autoriza a sessão ou exibe a mensagem de erro apropriada na tela.

## Diagrama

```mermaid
sequenceDiagram
    actor Usuario as Usuário
    participant Frontend
    participant Backend
    participant Banco

    Usuario->>Frontend: Digita e-mail e senha e clica em "Entrar"
    Frontend->>Backend: CT7 autenticarUsuario
    Backend->>Backend: Valida se e-mail pertence ao domínio institucional
    Backend->>Banco: CT8 usuario (consulta)
    Banco-->>Backend: Retorna dados e hash de senha
    Backend->>Backend: Valida senha digitada
    Backend-->>Frontend: Resposta do CT7 (Token de acesso / Erro)
    Frontend-->>Usuario: Libera acesso ao sistema ou exibe mensagem de erro