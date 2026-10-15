const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true, unique: true, uppercase: true, match: [/^[A-Z]\d{11}$/, 'rollNo must look like A24126552177'] },
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'email is not valid'] },
    phone: { type: String, match: [/^[6-9]\d{9}$/, 'phone must be a 10-digit Indian mobile number'] },
    branch: { type: String, required: true, enum: ['CSE', 'CSM', 'CSD', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'] },
    year: { type: Number, required: true, min: 1, max: 4 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Participant', participantSchema);
