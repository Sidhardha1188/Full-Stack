require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Participant = require('./models/Participant');
const Registration = require('./models/Registration');

const day = n => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

(async () => {
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/eventRegistrationDB');
  await Promise.all([Event.deleteMany({}), Participant.deleteMany({}), Registration.deleteMany({})]);

  await Event.insertMany([
    { title: 'React Basics Workshop', type: 'Workshop', venue: 'Seminar Hall 2', startsAt: day(10), registrationCloses: day(8), capacity: 40, organiser: 'CSM Department' },
    { title: '24-Hour Hackathon', type: 'Hackathon', venue: 'Main Block Labs', startsAt: day(20), registrationCloses: day(15), capacity: 3, fee: 200, organiser: 'Coding Club' },
    { title: 'Careers in AI - Guest Talk', type: 'Seminar', venue: 'Auditorium', startsAt: day(5), registrationCloses: day(4), capacity: 300, organiser: 'Training & Placement' }
  ]);
  await Participant.insertMany([
    { rollNo: 'A24126552177', name: 'S. Guna Naveen Sidhardha', email: 'naveen@example.com', branch: 'CSM', year: 3 },
    { rollNo: 'A24126552101', name: 'K. Harika', email: 'harika@example.com', branch: 'CSM', year: 3 },
    { rollNo: 'A24126512045', name: 'P. Manoj', email: 'manoj@example.com', branch: 'CSE', year: 3 },
    { rollNo: 'A24126532019', name: 'T. Pavani', email: 'pavani@example.com', branch: 'ECE', year: 2 }
  ]);
  console.log('Seeded 3 events and 4 participants');
  await mongoose.disconnect();
})();
