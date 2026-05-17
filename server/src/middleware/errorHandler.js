/**
 * Central error handler — returns consistent JSON error responses.
 */
export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
}

/**
 * 404 handler for unknown routes.
 */
export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

/**
 * Async route wrapper to forward rejected promises to error middleware.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
