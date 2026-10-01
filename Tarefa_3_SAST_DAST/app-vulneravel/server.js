const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Laboratório deliberadamente vulnerável.
// NÃO usar em produção.

app.get('/', (req, res) => {
  const q = req.query.q || '';
  res.send(`
    <html>
      <body>
        <h1>GoFood — laboratório DAST</h1>
        <form>
          <input name="q">
          <button>Pesquisar</button>
        </form>
        <p>Resultado para: ${q}</p>
      </body>
    </html>
  `);
});

app.get('/api/user', (req, res) => {
  res.json({
    id: 1,
    email: 'aluno@example.com',
    role: 'admin'
  });
});

app.get('/error', (req, res) => {
  throw new Error('Erro interno: database password=supersecret');
});

app.listen(3000, () => console.log('Vulnerável: http://localhost:3000'));
