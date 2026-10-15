const router = require('express').Router();
const Participant = require('../models/Participant');
const Registration = require('../models/Registration');
const { ApiError, wrap } = require('../utils/ApiError');
const { validIds, pick } = require('../middleware/validate');

const FIELDS = ['rollNo', 'name', 'email', 'phone', 'branch', 'year'];

router.get('/', wrap(async (req, res) => {
  const filter = {};
  if (req.query.branch) filter.branch = req.query.branch;
  if (req.query.year) filter.year = Number(req.query.year);
  const items = await Participant.find(filter).sort({ rollNo: 1 });
  res.json({ ok: true, count: items.length, items });
}));

router.post('/', pick(...FIELDS), wrap(async (req, res) => {
  const item = await Participant.create(req.body);
  res.status(201).json({ ok: true, item });
}));

router.get('/:id', validIds('id'), wrap(async (req, res) => {
  const item = await Participant.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Participant not found');
  res.json({ ok: true, item });
}));

router.patch('/:id', validIds('id'), pick('name', 'email', 'phone', 'branch', 'year'), wrap(async (req, res) => {
  const item = await Participant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, 'Participant not found');
  res.json({ ok: true, item });
}));

router.delete('/:id', validIds('id'), wrap(async (req, res) => {
  const active = await Registration.exists({ participant: req.params.id, status: { $in: ['Confirmed', 'Waitlisted'] } });
  if (active) throw new ApiError(409, 'Participant has active registrations');
  const item = await Participant.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Participant not found');
  res.status(204).end();
}));

// GET /api/v1/participants/:id/registrations - every event this person registered for
router.get('/:id/registrations', validIds('id'), wrap(async (req, res) => {
  const items = await Registration.find({ participant: req.params.id })
    .populate('event', 'title type startsAt venue status')
    .sort({ createdAt: -1 });
  res.json({ ok: true, count: items.length, items });
}));

module.exports = router;
