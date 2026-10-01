const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet());

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

app.get('/', (req, res) => {
  const q = req.query.q || '';
  res.type('html').send(`
    <html>
      <body>
        <h1>GoFood — laboratório DAST</h1>
        <form>
          <input name="q">
          <button>Pesquisar</button>
        </form>
        <p>Resultado para: ${escapeHtml(q)}</p>
      </body>
    </html>
  `);
});

app.get('/api/user', (req, res) => {
  res.json({ id: 1, email: 'aluno@example.com' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(3000, () => console.log('Corrigido: http://localhost:3000'));
