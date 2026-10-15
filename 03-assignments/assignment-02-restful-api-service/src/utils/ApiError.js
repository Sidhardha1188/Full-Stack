// An Error that carries an HTTP status code
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const wrap = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

module.exports = { ApiError, wrap };
