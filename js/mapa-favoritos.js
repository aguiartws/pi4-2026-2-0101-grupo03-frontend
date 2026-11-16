document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. LÓGICA DA BARRA LATERAL RETRÁTIL
    // ==========================================
    const appLayout = document.getElementById('appLayout');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (sidebarToggle && appLayout) {
        sidebarToggle.addEventListener('click', () => {
            appLayout.classList.toggle('collapsed');
            const isCollapsed = appLayout.classList.contains('collapsed');
            sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
        });
    }

    if (!exigirLogin("estudante")) {
        return;
    }

    // Inicializar o Mapa (Focado na PUC-Campinas Campus 1)
    const map = L.map('mapaFavoritos').setView([-22.8343, -47.0523], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Ícone da PUC e Marcador base
    const iconeFaculdade = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    L.marker([-22.8343, -47.0523], { icon: iconeFaculdade })
        .addTo(map)
        .bindPopup('<b>PUC-Campinas</b><br>Campus 1')
        .openPopup();

    // Função para buscar os favoritos no Backend
    async function carregarFavoritosNoMapa() {
        try {
            const sessao = obterSessao();
            if (!sessao) return;
            const estudanteId = sessao.usuarioId;

            // Tenta chamar a API
            const dados = await chamarApi(`/favoritos?estudanteId=${encodeURIComponent(estudanteId)}`);

            // Verifica se tem favoritos e os adiciona no mapa
            if (dados && dados.favoritos && dados.favoritos.length > 0) {
                dados.favoritos.forEach(casa => {
                    const precoFormatado = casa.valorAluguel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    const popupContent = `
                        <div class="popup-vaga">
                            <h3>${escaparHtml(casa.titulo)}</h3>
                            <p class="endereco">${escaparHtml(casa.endereco)}</p>
                            <p class="preco">${escaparHtml(precoFormatado)}</p>
                            <a href="detalhes-vaga.html?id=${escaparHtml(casa.id)}" class="btn-detalhes">Ver detalhes da vaga</a>
                        </div>
                    `;

                    L.marker([casa.latitude, casa.longitude])
                        .addTo(map)
                        .bindPopup(popupContent);
                });
            } else {
                console.log("Este aluno ainda não tem vagas favoritas.");
            }

        } catch (erro) {
            // Se o servidor estiver desligado, não quebra o mapa.
            console.warn("Backend offline ou falhou, mas o mapa continuará visível para testes:", erro);
        }
    }

    // Executa a busca
    carregarFavoritosNoMapa();
});