const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const departments = ['BAM', 'SASS', 'SCIENCE', 'AGRIC', 'FOBE', 'EDUC', 'LAW'];
    
    for (const dept of departments) {
      await Department.updateOne(
        { name: dept },
        { name: dept },
        { upsert: true }
      );
    }
    
    console.log('✓ Departments seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
};

seedDepartments();