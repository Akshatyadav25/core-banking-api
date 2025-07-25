module.exports = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal Server Error' });
}; 