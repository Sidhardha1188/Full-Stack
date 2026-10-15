const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'title is required'], trim: true, maxlength: 100 },
    type: { type: String, enum: { values: ['Workshop', 'Hackathon', 'Seminar', 'Cultural', 'Sports'], message: '{VALUE} is not a valid type' }, required: true },
    venue: { type: String, required: true },
    startsAt: { type: Date, required: true },
    registrationCloses: {
      type: Date,
      required: true,
      validate: { validator: function (v) { return v <= this.startsAt; }, message: 'registrationCloses must be before startsAt' }
    },
    capacity: { type: Number, required: true, min: [1, 'capacity must be at least 1'] },
    fee: { type: Number, default: 0, min: 0 },
    organiser: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Cancelled'], default: 'Open' }
  },
  { timestamps: true }
);

eventSchema.index({ startsAt: 1 });

module.exports = mongoose.model('Event', eventSchema);
