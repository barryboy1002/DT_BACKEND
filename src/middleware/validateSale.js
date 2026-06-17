function validateSale(req, res, next) {
  const { items, payment_method } = req.body;
  if (!payment_method || typeof payment_method !== 'string') {
    return res.status(400).json({ success: false, error: 'payment_method is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array is required' });
  }
  for (const it of items) {
    const pid = it.product_id || it.productID;
    if (!pid || !Number.isInteger(Number(pid))) {
      return res.status(400).json({ success: false, error: 'each item must have a valid product_id' });
    }
    if (!it.quantity || isNaN(Number(it.quantity))) {
      return res.status(400).json({ success: false, error: 'each item must have a valid quantity' });
    }
    if (it.unit_price == null || isNaN(Number(it.unit_price))) {
      return res.status(400).json({ success: false, error: 'each item must have a valid unit_price' });
    }
  }
  next();
}

export { validateSale };
