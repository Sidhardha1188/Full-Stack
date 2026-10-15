const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
    status: { type: String, enum: ['Confirmed', 'Waitlisted', 'Cancelled', 'CheckedIn'], required: true },
    waitlistPosition: { type: Number, default: null },
    active: { type: Boolean, default: true }, // false once cancelled; used by the unique index below
    cancelledAt: Date,
    checkedInAt: Date
  },
  { timestamps: true }
);

// One active registration per participant per event (cancelled ones don't count)
registrationSchema.index(
  { event: 1, participant: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

module.exports = mongoose.model('Registration', registrationSchema);
