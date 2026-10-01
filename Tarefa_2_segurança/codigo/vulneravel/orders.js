const router = express.Router();

router.get('/orders/:id', authMiddleware, async (req, res) => {
  const order = await db.query(
    `SELECT * FROM orders WHERE id = ${req.params.id}`
  );
  res.json(order);
});

router.post('/orders', authMiddleware, async (req, res) => {
  const { items, address, couponCode } = req.body;
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  await db.query(`INSERT INTO orders (user_id, items, total, address)
    VALUES (${req.user.userId}, '${JSON.stringify(items)}', ${total},
    '${address}')`);

  res.json({ success: true });
});

router.get('/admin/orders', authMiddleware, async (req, res) => {
  const orders = await db.query('SELECT * FROM orders');
  res.json(orders);
});
