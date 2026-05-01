const mongoose = require('mongoose');

const deanSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['dean_of_students'], default: 'dean_of_students' },
  fullName: { type: String, required: true },
  department: { type: String, default: 'Office of the Dean of Students' },
  permissions: {
    viewAllSuggestions: { type: Boolean, default: true },
    respondToAllSuggestions: { type: Boolean, default: true },
    approveDepartmentResponses: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    manageDepartmentHeads: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dean', deanSchema);