const router = require('express').Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { ApiError, wrap } = require('../utils/ApiError');
const { validIds, pick } = require('../middleware/validate');

const EVENT_FIELDS = ['title', 'type', 'venue', 'startsAt', 'registrationCloses', 'capacity', 'fee', 'organiser'];
const ACTIVE = ['Confirmed', 'CheckedIn'];

async function seatInfo(event) {
  const [taken, waitlisted] = await Promise.all([
    Registration.countDocuments({ event: event._id, status: { $in: ACTIVE } }),
    Registration.countDocuments({ event: event._id, status: 'Waitlisted' })
  ]);
  return { ...event.toObject(), seatsTaken: taken, seatsLeft: Math.max(0, event.capacity - taken), waitlisted };
}

// GET /api/v1/events?type=Workshop&upcoming=true&q=react&page=1&limit=10
router.get('/', wrap(async (req, res) => {
  const { type, upcoming, q } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const filter = {};
  if (type) filter.type = type;
  if (upcoming === 'true') filter.startsAt = { $gte: new Date() };
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const [items, total] = await Promise.all([
    Event.find(filter).sort({ startsAt: 1 }).skip((page - 1) * limit).limit(limit),
    Event.countDocuments(filter)
  ]);
  res.json({ ok: true, page, limit, total, items });
}));

router.post('/', pick(...EVENT_FIELDS), wrap(async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ ok: true, item: event });
}));

router.get('/:id', validIds('id'), wrap(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  res.json({ ok: true, item: await seatInfo(event) });
}));

router.patch('/:id', validIds('id'), pick(...EVENT_FIELDS), wrap(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (req.body.capacity !== undefined) {
    const taken = await Registration.countDocuments({ event: event._id, status: { $in: ACTIVE } });
    if (req.body.capacity < taken) throw new ApiError(409, `${taken} seats are already taken`);
  }
  event.set(req.body);
  await event.save();
  res.json({ ok: true, item: event });
}));

// POST /api/v1/events/:id/cancel - cancels the event and all its registrations
router.post('/:id/cancel', validIds('id'), wrap(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
  if (!event) throw new ApiError(404, 'Event not found');
  const { modifiedCount } = await Registration.updateMany(
    { event: event._id, status: { $ne: 'Cancelled' } },
    { status: 'Cancelled', active: false, cancelledAt: new Date(), waitlistPosition: null }
  );
  res.json({ ok: true, message: `Event cancelled, ${modifiedCount} registrations cancelled`, item: event });
}));

router.delete('/:id', validIds('id'), wrap(async (req, res) => {
  const used = await Registration.exists({ event: req.params.id });
  if (used) throw new ApiError(409, 'Event has registrations; cancel it instead of deleting');
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  res.status(204).end();
}));

// GET /api/v1/events/:id/registrations?status=Waitlisted
router.get('/:id/registrations', validIds('id'), wrap(async (req, res) => {
  const filter = { event: req.params.id };
  if (req.query.status) filter.status = req.query.status;
  const items = await Registration.find(filter)
    .populate('participant', 'rollNo name branch year')
    .sort({ status: 1, waitlistPosition: 1, createdAt: 1 });
  res.json({ ok: true, count: items.length, items });
}));

// GET /api/v1/events/:id/stats - registrations by branch and by status (aggregation)
router.get('/:id/stats', validIds('id'), wrap(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  const [byStatus, byBranch] = await Promise.all([
    Registration.aggregate([
      { $match: { event: event._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Registration.aggregate([
      { $match: { event: event._id, status: { $in: ACTIVE } } },
      { $lookup: { from: 'participants', localField: 'participant', foreignField: '_id', as: 'p' } },
      { $unwind: '$p' },
      { $group: { _id: '$p.branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);
  res.json({ ok: true, event: event.title, capacity: event.capacity, byStatus, byBranch });
}));

module.exports = router;
