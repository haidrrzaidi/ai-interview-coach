const TTL = parseInt(process.env.SESSION_TTL_MS, 10) || 60 * 60 * 1000;

const sessions = new Map();

const sweep = () => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.updatedAt > TTL) sessions.delete(id);
  }
};

setInterval(sweep, Math.min(TTL, 5 * 60 * 1000)).unref();

const create = (id, data) => {
  const now = Date.now();
  const session = {
    id,
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  sessions.set(id, session);
  return session;
};

const get = (id) => {
  const session = sessions.get(id);
  if (!session) return null;
  if (Date.now() - session.updatedAt > TTL) {
    sessions.delete(id);
    return null;
  }
  return session;
};

const update = (id, patch) => {
  const existing = get(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  sessions.set(id, updated);
  return updated;
};

const remove = (id) => sessions.delete(id);

const size = () => sessions.size;

module.exports = { create, get, update, remove, size };
