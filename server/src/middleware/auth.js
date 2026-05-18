import jwt from 'jsonwebtoken';

/**
 * Verify JWT bearer token for protected admin routes.
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Please log in.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'Authentication is not configured on the server.' });
  }

  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Unauthorized access. Please log in again.';
    return res.status(401).json({ success: false, message });
  }
}
