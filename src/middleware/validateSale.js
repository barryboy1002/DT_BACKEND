function validateSale(req, res, next) {
  const { items, paymentMethod } = req.body;
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    return res.status(400).json({ success: false, error: 'paymentMethod is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'items array is required' });
  }
  for (const it of items) {
    const pid = it.productId || it.productID;
    if (!pid || !Number.isInteger(Number(pid))) {
      return res.status(400).json({ success: false, error: 'each item must have a valid product_id' });
    }
    if (!it.quantity || isNaN(Number(it.quantity))) {
      return res.status(400).json({ success: false, error: 'each item must have a valid quantity' });
    }
    if (it.unitPrice == null || isNaN(Number(it.unitPrice))) {
      return res.status(400).json({ success: false, error: 'each item must have a valid unitPrice' });
    }
  }
  next();
}

export { validateSale };
