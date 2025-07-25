module.exports = function (req, res, next) {
  // API Key auth (for demo; use OAuth2.0 in production)
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(401).json({ errorCode: 'ERR_UNAUTHORIZED', message: 'Missing API key' });
  }
  if (apiKey === 'FORBIDDENKEY') {
    return res.status(403).json({ errorCode: 'ERR_FORBIDDEN', message: 'Not authorized to access this resource' });
  }
  if (apiKey !== validApiKey) {
    return res.status(403).json({ errorCode: 'ERR_FORBIDDEN', message: 'Invalid API key' });
  }
  // TODO: Add OAuth2.0 support
  next();
}; 