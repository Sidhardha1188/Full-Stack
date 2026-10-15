const express = require('express');
const events = require('./routes/events');
const participants = require('./routes/participants');
const registrations = require('./routes/registrations');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.use(express.json({ limit: '50kb' }));

app.use((req, res, next) => {
  const t = Date.now();
  res.on('finish', () => console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - t}ms`));
  next();
});

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/v1/events', events);
app.use('/api/v1/participants', participants);
app.use('/api/v1/registrations', registrations);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
