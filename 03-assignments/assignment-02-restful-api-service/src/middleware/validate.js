const mongoose = require('mongoose');
const { ApiError } = require('../utils/ApiError');

// Checks that route params named in "names" are valid ObjectIds
const validIds = (...names) => (req, res, next) => {
  for (const n of names) {
    if (!mongoose.isValidObjectId(req.params[n])) return next(new ApiError(400, `Invalid ${n}`));
  }
  next();
};

// Keeps only allowed fields in req.body so clients cannot set things like "seatsTaken"
const pick = (...allowed) => (req, res, next) => {
  req.body = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => allowed.includes(k)));
  next();
};

module.exports = { validIds, pick };
