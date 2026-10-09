# ADR 0002: Usar Docker para padronizar o ambiente de desenvolvimento

**Status:** aceito

**Contexto:** O sistema reúne frontend (HTML, CSS e JavaScript), backend em Java com Spring Boot e banco de dados PostgreSQL. Cada integrante usa um computador com sistema e configurações diferentes, e instalar manualmente as mesmas versões de cada tecnologia gera erros de configuração, conflitos de versão e o problema do "funciona na minha máquina". A equipe também precisa integrar frontend, backend e banco de dados com facilidade e receber novos integrantes sem uma longa preparação de ambiente.

**Decisão:** Empacotar o frontend, o backend e o PostgreSQL em contêineres Docker, com as versões fixadas em arquivos versionados no repositório, para que todos executem o sistema no mesmo ambiente.

**Alternativas consideradas:**
- Instalação manual das ferramentas em cada máquina: descartada porque depende de cada pessoa seguir os mesmos passos e versões, o que reproduz os conflitos e o "funciona na minha máquina".
- Máquinas virtuais padronizadas: descartada porque consomem mais memória e disco e são mais lentas para iniciar e atualizar do que contêineres.
- Serviços na nuvem compartilhados para desenvolvimento (ex.: banco único para todos): descartada porque os integrantes passariam a interferir nos dados uns dos outros e dependeriam de internet e de custos externos.

**Consequências:**
- Positivas: todos trabalham com as mesmas versões de Java, Spring Boot e PostgreSQL; um novo integrante sobe o sistema completo com poucos comandos, sem instalar cada tecnologia; frontend, backend e banco de dados se integram na mesma configuração.
- Negativas: cada integrante precisa instalar e aprender o Docker, e o grupo passa a manter os arquivos de configuração (Dockerfile e compose); contêineres consomem memória e processamento, o que pesa em computadores mais fracos; erros de rede, volumes e permissões entre contêineres são mais difíceis de depurar do que em uma instalação local.
