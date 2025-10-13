const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL de destino é obrigatória.');
  }

  try {
    // Define o cabeçalho para permitir que qualquer origem acesse este proxy
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Faz a requisição para a URL do stream e transmite a resposta diretamente
    const response = await axios({
      method: 'get',
      url: decodeURIComponent(url),
      responseType: 'stream'
    });

    // Informa ao cliente o tipo de conteúdo do stream original
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);

  } catch (error) {
    console.error('Erro no proxy:', error.message);
    res.status(500).send('Falha ao buscar o stream.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
});