# Fluxo do E2: Cadastro de vaga pela república

**Feito quando:** O responsável cadastra uma vaga com endereço, valor do aluguel, número de moradores e regras da casa, salva, e a vaga aparece na lista de vagas ativas.

## Passos

1. O responsável pela moradia preenche o formulário da vaga e clica em "Cadastrar vaga".
2. O Frontend envia as informações da vaga para o Backend pela operação `cadastrarVaga` (CT3).
3. O Backend valida as informações do imóvel e o valor.
4. O Backend grava o novo anúncio no Banco de Dados na tabela `vaga` (CT4).
5. O Banco de Dados confirma a persistência da vaga.
6. O Backend retorna a resposta de sucesso para o Frontend.
7. O Frontend exibe a nova vaga cadastrada na lista de vagas ativas do responsável.

## Diagrama

```mermaid
sequenceDiagram
    actor Responsavel as Responsável
    participant Frontend
    participant Backend
    participant Banco

    Responsavel->>Frontend: Preenche dados da vaga e clica em "Cadastrar vaga"
    Frontend->>Backend: CT3 cadastrarVaga
    Backend->>Backend: Valida dados da vaga
    Backend->>Banco: CT4 vaga (gravação)
    Banco-->>Backend: Confirmação de gravação
    Backend-->>Frontend: Resposta do CT3 (Vaga criada)
    Frontend-->>Responsavel: Exibe vaga na lista de vagas ativas