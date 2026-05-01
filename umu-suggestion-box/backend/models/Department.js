const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['BAM', 'SASS', 'SCIENCE', 'AGRIC', 'FOBE', 'EDUC', 'LAW'],
    unique: true,
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  categories: {
    type: [String],
    default: ['Lecturing', 'Welfare', 'Meals', 'Sports', 'Hostels', 'ICT', 'Security', 'Library'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Department', departmentSchema);
