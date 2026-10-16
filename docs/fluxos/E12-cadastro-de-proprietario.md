# Fluxo do E12: Cadastro de perfil do proprietário

**Feito quando:** O proprietário preenche nome, e-mail, número de telefone, salva, e o perfil aparece na tela "Meu perfil" com os dados que ele digitou.

## Passos

1. O proprietário preenche o formulário de perfil e clica em "Salvar".
2. O Frontend envia os dados do perfil para o Backend através da operação `cadastrarProprietario` (CT21).
3. O Backend valida os dados recebidos (campos obrigatórios e formatos).
4. O Backend grava as informações no Banco de Dados na tabela `proprietario` (CT22).
5. O Backend grava o acesso do proprietário (e-mail, senha criptografada e perfil) na tabela `usuario` do Banco de Dados (CT8).
6. O Banco de Dados confirma a gravação.
7. O Backend responde ao Frontend confirmando o cadastro do perfil.
8. O Frontend redireciona o proprietário e exibe a tela "Meu perfil" com os dados atualizados.

## Diagrama

```mermaid
sequenceDiagram
    actor Proprietário
    participant Frontend
    participant Backend
    participant Banco as Banco de Dados

    Proprietário->>Frontend: Preenche dados do perfil e clica em "Salvar"
    Frontend->>Backend: CT21 cadastrarProprietario
    Backend->>Backend: Valida dados do formulário
    Backend->>Banco: CT22 proprietario (gravação)
    Banco-->>Backend: Confirmação de gravação
    Backend->>Banco: CT8 usuario (gravação do acesso)
    Banco-->>Backend: Confirmação de gravação
    Backend-->>Frontend: Resposta do CT21 (Perfil criado)
    Frontend-->>Proprietário: Exibe tela "Meu perfil" com os dados salvos
```

**Contratos usados:** CT21 cadastrarProprietario, CT22 proprietario, CT8 usuario