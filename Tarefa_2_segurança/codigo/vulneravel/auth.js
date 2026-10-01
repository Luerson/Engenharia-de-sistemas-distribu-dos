const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET = "gofood2024secret";

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const user = await db.query(query);

  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    SECRET
  );

  res.json({ token, userId: user.id, role: user.role });
});

function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}
