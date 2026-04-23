const cors = require('cors');

const parseOrigins = () => {
  const raw = process.env.CORS_ORIGINS || '';
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

const allowedOrigins = parseOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  credentials: true,
  maxAge: 86400,
};

module.exports = cors(corsOptions);
