// Simple authentication middleware for local/dev usage.
// For now it accepts an `X-Business-Id` header and attaches `req.user`.
// Replace with real JWT verification in production.
function authenticate(req, res, next) {
  const biz = req.header('x-business-id');
  if (biz) {
    req.user = { businessId: biz };
    return next();
  }

  // In production you'd verify a JWT and set req.user accordingly.
  return res.status(401).json({ success: false, error: 'Unauthorized: missing business context (set X-Business-Id header)' });
}

export { authenticate };
