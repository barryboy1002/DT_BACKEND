function validateCategory(req, res, next) {
  const name = req.body?.name;
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  req.body.name = name.trim();
  next();
}

export { validateCategory };
