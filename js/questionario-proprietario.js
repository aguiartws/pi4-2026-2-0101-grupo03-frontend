const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve só a pasta "public" (HTML, CSS, JS, imagens).
// Assim o server.js e o package.json NÃO ficam acessíveis pelo navegador.
app.use(express.static(path.join(__dirname, 'public')));

// Página inicial: por enquanto abre o questionário
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'questionario-proprietario.html'));
});

// Recebe as respostas da etapa 2 do questionário
app.post('/api/questionario-proprietario', (req, res) => {
  const { tipo, festas, pets, aceita } = req.body;

  if (!tipo || !festas || !pets || !aceita) {
    return res.status(400).json({ ok: false, erro: 'Preencha todas as perguntas.' });
  }

  // TODO: salvar no banco de dados
  console.log('Respostas recebidas:', { tipo, festas, pets, aceita });

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});