const { ApiError } = require('../utils/ApiError');

function notFound(req, res, next) {
  next(new ApiError(404, `No route ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: 'Request body is not valid JSON' });
  }
  if (err.name === 'ValidationError') {
    const details = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return res.status(422).json({ ok: false, message: 'Validation failed', details });
  }
  if (err.code === 11000) {
    return res.status(409).json({ ok: false, message: `Duplicate value for ${Object.keys(err.keyValue).join(', ')}` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ ok: false, message: `Invalid ${err.path}` });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ ok: false, message: status === 500 ? 'Internal server error' : err.message });
}

module.exports = { notFound, errorHandler };
