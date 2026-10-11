# Fluxo do E11: Denúncia de anúncio

**Feito quando:** O estudante clica em "denunciar" em uma vaga, escolhe um motivo e envia, e a vaga sai da lista pública até a moderação revisar.

## Passos

1. O estudante clica em "Denunciar vaga", escolhe o motivo da infração e clica em "Enviar denúncia".
2. O Frontend envia os detalhes da denúncia chamando a operação `denunciarVaga` (CT19).
3. O Backend salva a queixa na tabela `denuncia` no Banco de Dados (CT20).
4. O Banco de Dados confirma a gravação.
5. O Backend altera temporariamente o status da vaga para "em_analise" na tabela `vaga` do Banco de Dados (CT4).
6. O Banco de Dados confirma a alteração de status da vaga.
7. O Backend confirma o acolhimento da denúncia para o Frontend.
8. O Frontend informa ao estudante que a denúncia foi registrada e remove imediatamente a vaga denunciada da tela pública.

## Diagrama

```mermaid
sequenceDiagram
    actor Estudante
    participant Frontend
    participant Backend
    participant Banco

    Estudante->>Frontend: Seleciona motivo e clica em "Enviar denúncia"
    Frontend->>Backend: CT19 denunciarVaga
    Backend->>Banco: CT20 denuncia (registro do motivo)
    Banco-->>Backend: Confirmação de gravação
    Backend->>Banco: CT4 vaga (atualiza status para 'em_analise')
    Banco-->>Backend: Confirmação de alteração
    Backend-->>Frontend: Resposta do CT19 (Denúncia recebida)
    Frontend-->>Estudante: Oculta a vaga da tela e exibe aviso de denúncia enviada