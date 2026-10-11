# Fluxo do E5: Busca com filtros de preço e distância

**Feito quando:** O estudante define preço máximo e distância máxima até o campus, aplica os filtros, e a lista mostra apenas as vagas que respeitam os dois limites ao mesmo tempo.

## Passos

1. O estudante ajusta o preço máximo e a distância máxima e clica em "Aplicar filtros".
2. O Frontend envia os parâmetros selecionados ao Backend utilizando a operação `buscarVagas` (CT9).
3. O Backend monta a consulta considerando ambos os critérios simultaneamente.
4. O Backend executa a busca filtrada na tabela `vaga` do Banco de Dados (CT4).
5. O Banco de Dados retorna as vagas que satisfazem os dois filtros.
6. O Backend devolve a lista filtrada para o Frontend.
7. O Frontend atualiza a tela exibindo apenas as vagas correspondentes aos filtros aplicados.

## Diagrama

```mermaid
sequenceDiagram
    actor Estudante
    participant Frontend
    participant Backend
    participant Banco

    Estudante->>Frontend: Define preço máximo, distância e clica em "Aplicar filtros"
    Frontend->>Backend: CT9 buscarVagas
    Backend->>Banco: CT4 vaga (busca com filtros WHERE)
    Banco-->>Backend: Retorna lista de vagas filtradas
    Backend-->>Frontend: Resposta do CT9 (Lista de vagas)
    Frontend-->>Estudante: Exibe vagas que atendem aos dois limites