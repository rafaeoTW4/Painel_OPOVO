// api/proxy.js
const axios = require('axios');

// A Vercel executará esta função para cada requisição que chegar em /api/proxy
export default async function handler(req, res) {
  // A URL do stream vem da query string, como antes
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL de destino é obrigatória.');
  }

  try {
    // Permite que o frontend (hospedado no mesmo domínio da Vercel) acesse esta API
    res.setHeader('Access-Control-Allow-Origin', '*'); // Pode ser mais restritivo se desejar
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Adiciona cabeçalhos para evitar cache agressivo da Vercel nas respostas do stream
    res.setHeader('Cache-Control', 'no-cache, s-maxage=0');


    const response = await axios({
      method: 'get',
      url: decodeURIComponent(url),
      responseType: 'stream'
    });

    // Define o tipo de conteúdo e transmite o stream para o cliente
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);

  } catch (error) {
    console.error('Erro no proxy:', error.message);
    res.status(502).send('Falha ao buscar o stream.'); // 502 Bad Gateway é mais apropriado aqui
  }
}