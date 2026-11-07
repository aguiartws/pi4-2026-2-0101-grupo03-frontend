document.addEventListener("DOMContentLoaded", () => {
    if (!exigirLogin("estudante")) {
        return;
    }

    // 1. Inicializar o Mapa (Focado na PUC-Campinas Campus 1)
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

    // 2. Função para buscar os favoritos no Backend
    async function carregarFavoritosNoMapa() {
        try {
            const estudanteId = obterSessao().usuarioId;
            
            const dados = await chamarApi(`/favoritos?estudanteId=${encodeURIComponent(estudanteId)}`);

            // 3. Verifica se tem favoritos e os adiciona no mapa
            if (dados.favoritos && dados.favoritos.length > 0) {
                dados.favoritos.forEach(casa => {
                    const precoFormatado = casa.valorAluguel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    const popupContent = `
                        <div class="popup-vaga">
                            <h3>${casa.titulo}</h3>
                            <p class="endereco">${casa.endereco}</p>
                            <p class="preco">${precoFormatado}</p>
                            <a href="detalhes-vaga.html?id=${casa.id}" class="btn-detalhes">Ver detalhes da vaga</a>
                        </div>
                    `;

                    // Usa as coordenadas vindas do banco de dados
                    L.marker([casa.latitude, casa.longitude])
                        .addTo(map)
                        .bindPopup(popupContent);
                });
            } else {
                console.log("Este aluno ainda não tem vagas favoritas.");
            }

        } catch (erro) {
            console.error("Falha de comunicação com o backend:", erro);
            const mensagemErro = document.getElementById("mensagemErro");
            if (mensagemErro) {
                mensagemErro.textContent = mensagemDeErro(erro);
            }
        }
    }

    // 4. Executa a busca assim que a página carregar
    carregarFavoritosNoMapa();
});