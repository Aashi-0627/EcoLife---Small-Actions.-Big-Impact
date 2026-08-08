export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Something went wrong on the server.";
  if (status >= 500) {
    console.error("[EcoLife API Error]", err);
  }
  res.status(status).json({ error: message });
}
