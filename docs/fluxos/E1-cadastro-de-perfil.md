# Fluxo do E1: Cadastro de perfil do estudante

**Feito quando:** O estudante preenche nome, e-mail, curso, faixa de orçamento e distância máxima do campus, salva, e o perfil aparece na tela "Meu perfil" com os dados que ele digitou.

## Passos

1. O estudante preenche o formulário de perfil e clica em "Salvar".
2. O Frontend envia os dados do perfil para o Backend através da operação `cadastrarPerfil` (CT1).
3. O Backend valida os dados recebidos (campos obrigatórios e formatos).
4. O Backend grava as informações no Banco de Dados na tabela `estudante` (CT2).
5. O Banco de Dados confirma a gravação.
6. O Backend responde ao Frontend confirmando o cadastro do perfil.
7. O Frontend redireciona o estudante e exibe a tela "Meu perfil" com os dados atualizados.

## Diagrama

```mermaid
sequenceDiagram
    actor Estudante
    participant Frontend
    participant Backend
    participant Banco

    Estudante->>Frontend: Preenche dados do perfil e clica em "Salvar"
    Frontend->>Backend: CT1 cadastrarPerfil
    Backend->>Backend: Valida dados do formulário
    Backend->>Banco: CT2 estudante (gravação)
    Banco-->>Backend: Confirmação de gravação
    Backend-->>Frontend: Resposta do CT1 (Perfil criado)
    Frontend-->>Estudante: Exibe tela "Meu perfil" com os dados salvos