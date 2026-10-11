# Fluxo do E10: Notificação por e-mail com link para o WhatsApp

**Feito quando:** O estudante clica em "Tenho interesse" em uma vaga, e ambos (estudante e responsável) recebem um e-mail com o nome e o e-mail um do outro e um link wa.me que abre a conversa no WhatsApp deles.

## Passos

1. O estudante clica no botão "Tenho interesse" na página do anúncio.
2. O Frontend envia a solicitação ao Backend pela operação `solicitarInteresse` (CT17).
3. O Backend consulta os dados e telefones do estudante (CT2) e do responsável pela vaga (CT4) no Banco de Dados.
4. O Banco de Dados devolve as informações de contato dos envolvidos.
5. O Backend monta as mensagens com os respectivos links `wa.me` diretos para conversa.
6. O Backend aciona a API externa de e-mail utilizando `enviarEmailNotificacao` (CT18).
7. O Serviço de E-mail dispara os e-mails para ambas as partes e confirma a entrega da requisição.
8. O Backend retorna a resposta positiva ao Frontend.
9. O Frontend avisa o estudante que o interesse foi registrado e que o e-mail com o link de contato foi enviado.

## Diagrama

```mermaid
sequenceDiagram
    actor Estudante
    participant Frontend
    participant Backend
    participant Banco
    participant ServiçoEmail as Serviço de E-mail (externo)

    Estudante->>Frontend: Clica no botão "Tenho interesse"
    Frontend->>Backend: CT17 solicitarInteresse
    Backend->>Banco: CT2 estudante & CT4 vaga (busca dados de contato)
    Banco-->>Backend: Retorna e-mails e telefones
    Backend->>Backend: Gera links no formato wa.me/numero
    Backend->>ServiçoEmail: CT18 enviarEmailNotificacao (dados + link wa.me)
    ServiçoEmail-->>Backend: Confirmação de envio aceito
    Backend-->>Frontend: Resposta do CT17 (Interesse registrado)
    Frontend-->>Estudante: Exibe confirmação na tela