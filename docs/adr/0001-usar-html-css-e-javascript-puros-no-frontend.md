# ADR 0001: Usar HTML, CSS e JavaScript puros no frontend

**Status:** aceito

**Contexto:** O findUhouse é uma plataforma web para estudantes universitários encontrarem moradia coletiva, com páginas de cadastro, perfis, busca com filtros e chat. A equipe está em fase de aprendizado e precisa de tecnologias com boa documentação e grande comunidade, para facilitar o desenvolvimento e a manutenção. O frontend precisa ser interativo (filtros, envio de mensagens) e se comunicar com o backend.

**Decisão:** Construir o frontend com HTML para estrutura, CSS para estilo e responsividade e JavaScript para interatividade e comunicação com o backend, sem framework de interface.

**Alternativas consideradas:**
- React: descartada porque adiciona uma camada de conceitos (componentes, estado, build) que aumenta a curva de aprendizado da equipe sem que o escopo atual exija tamanha complexidade.
- Angular: descartada porque é um framework completo e pesado, desproporcional ao tamanho do projeto e ao tempo disponível.
- Vue.js: descartada pelo mesmo motivo do React: exigiria aprender a ferramenta antes de entregar as telas básicas.

**Consequências:**
- Positivas: toda a equipe já domina ou aprende rápido as três tecnologias, que têm ampla documentação; não há etapa de build nem dependências de framework, o que simplifica a configuração do ambiente e a hospedagem das páginas.
- Negativas: sem framework, o estado da interface (filtros, lista de resultados, mensagens do chat) é gerenciado manualmente, o que tende a gerar código repetitivo e mais difícil de manter conforme o sistema cresce; reaproveitamento de componentes fica a cargo da disciplina da equipe; uma futura migração para framework exigirá reescrita parcial.
