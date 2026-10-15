const router = require('express').Router();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const Registration = require('../models/Registration');
const { ApiError, wrap } = require('../utils/ApiError');
const { validIds } = require('../middleware/validate');

const ACTIVE = ['Confirmed', 'CheckedIn'];

// POST /api/v1/registrations  { eventId, participantId }
// Confirms a seat if one is free, otherwise puts the participant on the waitlist.
router.post('/', wrap(async (req, res) => {
  const { eventId, participantId } = req.body || {};
  if (!mongoose.isValidObjectId(eventId) || !mongoose.isValidObjectId(participantId)) {
    throw new ApiError(400, 'eventId and participantId must be valid ids');
  }

  const [event, participant] = await Promise.all([Event.findById(eventId), Participant.findById(participantId)]);
  if (!event) throw new ApiError(404, 'Event not found');
  if (!participant) throw new ApiError(404, 'Participant not found');
  if (event.status === 'Cancelled') throw new ApiError(410, 'Event has been cancelled');
  if (new Date() > event.registrationCloses) throw new ApiError(403, 'Registration for this event has closed');

  const taken = await Registration.countDocuments({ event: event._id, status: { $in: ACTIVE } });
  let status = 'Confirmed';
  let waitlistPosition = null;
  if (taken >= event.capacity) {
    const last = await Registration.findOne({ event: event._id, status: 'Waitlisted' }).sort({ waitlistPosition: -1 });
    status = 'Waitlisted';
    waitlistPosition = last ? last.waitlistPosition + 1 : 1;
  }

  // The partial unique index rejects a second active registration with error 11000 -> 409
  const reg = await Registration.create({ event: event._id, participant: participant._id, status, waitlistPosition });
  res.status(201).json({
    ok: true,
    message: status === 'Confirmed' ? 'Seat confirmed' : `Event full, added to waitlist at position ${waitlistPosition}`,
    item: reg
  });
}));

router.get('/:id', validIds('id'), wrap(async (req, res) => {
  const item = await Registration.findById(req.params.id)
    .populate('event', 'title startsAt venue')
    .populate('participant', 'rollNo name');
  if (!item) throw new ApiError(404, 'Registration not found');
  res.json({ ok: true, item });
}));

// PATCH /api/v1/registrations/:id/cancel
// Frees the seat and moves the first person on the waitlist up to Confirmed.
router.patch('/:id/cancel', validIds('id'), wrap(async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) throw new ApiError(404, 'Registration not found');
  if (reg.status === 'Cancelled') throw new ApiError(409, 'Already cancelled');
  if (reg.status === 'CheckedIn') throw new ApiError(409, 'Cannot cancel after check-in');

  const wasConfirmed = reg.status === 'Confirmed';
  const oldPosition = reg.waitlistPosition;
  reg.status = 'Cancelled';
  reg.active = false;
  reg.cancelledAt = new Date();
  reg.waitlistPosition = null;
  await reg.save();

  let promoted = null;
  if (wasConfirmed) {
    promoted = await Registration.findOneAndUpdate(
      { event: reg.event, status: 'Waitlisted' },
      { status: 'Confirmed', waitlistPosition: null },
      { sort: { waitlistPosition: 1 }, new: true }
    );
    if (promoted) {
      await Registration.updateMany({ event: reg.event, status: 'Waitlisted' }, { $inc: { waitlistPosition: -1 } });
    }
  } else if (oldPosition) {
    // Someone left the waitlist: everyone behind them moves up one place
    await Registration.updateMany(
      { event: reg.event, status: 'Waitlisted', waitlistPosition: { $gt: oldPosition } },
      { $inc: { waitlistPosition: -1 } }
    );
  }

  res.json({ ok: true, message: promoted ? 'Cancelled; next person on the waitlist confirmed' : 'Cancelled', item: reg, promoted });
}));

// PATCH /api/v1/registrations/:id/check-in
router.patch('/:id/check-in', validIds('id'), wrap(async (req, res) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) throw new ApiError(404, 'Registration not found');
  if (reg.status !== 'Confirmed') throw new ApiError(409, `Only confirmed registrations can check in (status is ${reg.status})`);
  reg.status = 'CheckedIn';
  reg.checkedInAt = new Date();
  await reg.save();
  res.json({ ok: true, item: reg });
}));

module.exports = router;
