const axios = require('axios');
const { resolveServiceUrl } = require('./proxy');

const PUBLIC_PATHS = [
  /^\/api\/users\/(register|login)/,
  /^\/api\/products(\/?|\?.*)?$/,
  /^\/api\/products\/[0-9a-f-]{36}$/i,
  /^\/api\/products\/categories/,
  /^\/$/,
  /^\/health/,
  /^\/ready/,
  /^\/metrics/,
];

function isPublicPath(path) {
  return PUBLIC_PATHS.some((pattern) => pattern.test(path));
}

async function authMiddleware(req, res, next) {
  if (isPublicPath(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const userServiceUrl = await resolveServiceUrl('user-service');
    const { data } = await axios.post(
      `${userServiceUrl}/api/users/verify`,
      {},
      { headers: { Authorization: authHeader } }
    );

    if (!data.valid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { id: data.userId, email: data.email };
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { authMiddleware, isPublicPath };
