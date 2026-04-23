const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message || err);

  if (err.status === 429 || err.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again later.',
    });
  }

  if (err.name === 'AuthenticationError' || err.status === 401) {
    return res.status(401).json({
      error: 'Authentication failed. Check your Claude API key.',
    });
  }

  if (err.name === 'ValidationError' || err.status === 400) {
    return res.status(400).json({
      error: err.message || 'Invalid request.',
    });
  }

  if (err.status === 404) {
    return res.status(404).json({ error: err.message || 'Not found' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
