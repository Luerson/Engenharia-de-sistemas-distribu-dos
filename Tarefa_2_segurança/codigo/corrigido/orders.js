const express = require('express');
const { z } = require('zod');
const router = express.Router();
const { authMiddleware } = require('./auth');

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.coerce.number().int().positive(),
      qty: z.coerce.number().int().positive().max(100)
    })
  ).min(1).max(50),
  address: z.string().trim().min(5).max(500)
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}

router.get('/orders/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await db.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    const order = result.rows[0];
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Ownership check no servidor.
    if (order.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    return res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/orders', authMiddleware, async (req, res, next) => {
  try {
    const parsed = orderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: parsed.error.flatten()
      });
    }

    const { items, address } = parsed.data;
    const productIds = items.map(item => item.productId);

    // Os preços são obtidos do catálogo; o cliente não informa o preço.
    const productsResult = await db.query(
      'SELECT id, price FROM products WHERE id = ANY($1::int[])',
      [productIds]
    );

    const products = new Map(
      productsResult.rows.map(product => [product.id, Number(product.price)])
    );

    if (products.size !== new Set(productIds).size) {
      return res.status(400).json({ error: 'Produto inválido' });
    }

    const total = items.reduce((sum, item) => {
      const price = products.get(item.productId);
      return sum + price * item.qty;
    }, 0);

    const result = await db.query(
      `INSERT INTO orders (user_id, items, total, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, items, total, address`,
      [req.user.userId, JSON.stringify(items), total, address]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/admin/orders',
  authMiddleware,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const result = await db.query('SELECT * FROM orders ORDER BY id DESC');
      return res.json(result.rows);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
