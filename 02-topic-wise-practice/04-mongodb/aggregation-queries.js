// Aggregation on semester exam results: $unwind, $group, $bucket, $lookup, $facet, $addFields, $cond
const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fsdPracticeNS";

const Student = mongoose.model("Student", new mongoose.Schema({ roll: String, name: String, section: String }));
const Result = mongoose.model("Result", new mongoose.Schema({
  roll: String,
  semester: Number,
  marks: [{ subject: String, score: Number }]
}));

const students = [
  { roll: "R01", name: "Anil", section: "A" }, { roll: "R02", name: "Bhavya", section: "A" },
  { roll: "R03", name: "Charan", section: "B" }, { roll: "R04", name: "Deepika", section: "B" },
  { roll: "R05", name: "Eswar", section: "B" }
];
const results = [
  { roll: "R01", semester: 3, marks: [{ subject: "FSD", score: 78 }, { subject: "OS", score: 65 }, { subject: "ML", score: 82 }] },
  { roll: "R02", semester: 3, marks: [{ subject: "FSD", score: 91 }, { subject: "OS", score: 88 }, { subject: "ML", score: 94 }] },
  { roll: "R03", semester: 3, marks: [{ subject: "FSD", score: 35 }, { subject: "OS", score: 52 }, { subject: "ML", score: 47 }] },
  { roll: "R04", semester: 3, marks: [{ subject: "FSD", score: 67 }, { subject: "OS", score: 38 }, { subject: "ML", score: 71 }] },
  { roll: "R05", semester: 3, marks: [{ subject: "FSD", score: 84 }, { subject: "OS", score: 79 }, { subject: "ML", score: 58 }] }
];
const PASS = 40;

(async () => {
  await mongoose.connect(MONGO_URL);
  await Promise.all([Student.deleteMany({}), Result.deleteMany({})]);
  await Student.insertMany(students);
  await Result.insertMany(results);

  // 1. $unwind + $group: average, highest and lowest per subject
  console.log("1. Subject statistics:", await Result.aggregate([
    { $unwind: "$marks" },
    { $group: { _id: "$marks.subject", average: { $avg: "$marks.score" }, highest: { $max: "$marks.score" }, lowest: { $min: "$marks.score" } } },
    { $project: { average: { $round: ["$average", 1] }, highest: 1, lowest: 1 } },
    { $sort: { _id: 1 } }
  ]));

  // 2. $addFields + $lookup: total and percentage per student, joined with the student's name
  console.log("2. Rank list:", await Result.aggregate([
    { $addFields: { total: { $sum: "$marks.score" }, failedIn: { $size: { $filter: { input: "$marks", cond: { $lt: ["$$this.score", PASS] } } } } } },
    { $addFields: { percent: { $round: [{ $divide: ["$total", { $multiply: [{ $size: "$marks" }, 100] }] }, 3] } } },
    { $lookup: { from: "students", localField: "roll", foreignField: "roll", as: "student" } },
    { $unwind: "$student" },
    { $project: { _id: 0, name: "$student.name", section: "$student.section", total: 1, percent: { $multiply: ["$percent", 100] }, result: { $cond: [{ $eq: ["$failedIn", 0] }, "PASS", "FAIL"] } } },
    { $sort: { total: -1 } }
  ]));

  // 3. $bucket: how many subject scores fall in each grade band
  console.log("3. Grade bands:", await Result.aggregate([
    { $unwind: "$marks" },
    { $bucket: { groupBy: "$marks.score", boundaries: [0, 40, 60, 75, 90, 101], default: "other", output: { count: { $sum: 1 } } } }
  ]));

  // 4. $facet: two different summaries from one pipeline
  const [facet] = await Result.aggregate([
    { $unwind: "$marks" },
    { $facet: {
        failures: [{ $match: { "marks.score": { $lt: PASS } } }, { $project: { _id: 0, roll: 1, subject: "$marks.subject", score: "$marks.score" } }],
        toppers: [{ $sort: { "marks.score": -1 } }, { $group: { _id: "$marks.subject", topRoll: { $first: "$roll" }, topScore: { $first: "$marks.score" } } }, { $sort: { _id: 1 } }]
    } }
  ]);
  console.log("4. Failures:", facet.failures, "\n   Toppers:", facet.toppers);

  // 5. Section-wise average using $lookup then $group
  console.log("5. Section averages:", await Result.aggregate([
    { $lookup: { from: "students", localField: "roll", foreignField: "roll", as: "s" } },
    { $unwind: "$s" },
    { $group: { _id: "$s.section", avgTotal: { $avg: { $sum: "$marks.score" } }, students: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]));

  await mongoose.disconnect();
})().catch(err => { console.error("Could not run:", err.message); process.exit(1); });
