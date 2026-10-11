# Fluxo do E6: Lista e mapa de vagas

**Feito quando:** O estudante abre a tela de vagas e vê a lista com endereço e valor, e o mapa mostra um marcador para cada vaga da lista.

## Passos

1. O estudante acessa a tela principal de exploração de vagas.
2. O Frontend requisita a listagem de vagas disponíveis ao Backend chamando `listarVagasMapa` (CT10).
3. O Backend lê as vagas ativas com endereço e coordenadas na tabela `vaga` no Banco de Dados (CT4).
4. O Banco de Dados devolve a lista de vagas cadastradas.
5. O Backend envia os dados estruturados de endereço, valor e coordenadas ao Frontend.
6. O Frontend renderiza a lista textual de vagas e plota os marcadores correspondentes no mapa iterativo.

## Diagrama

```mermaid
sequenceDiagram
    actor Estudante
    participant Frontend
    participant Backend
    participant Banco

    Estudante->>Frontend: Acessa a tela de vagas
    Frontend->>Backend: CT10 listarVagasMapa
    Backend->>Banco: CT4 vaga (leitura de vagas ativas)
    Banco-->>Backend: Retorna dados e coordenadas das vagas
    Backend-->>Frontend: Resposta do CT10 (Vagas com coordenadas)
    Frontend-->>Estudante: Renderiza lista e marcadores de vagas no mapa