const mongoose = require('mongoose');
const Dean = require('./models/Dean');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedDean = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const hashedPassword = await bcrypt.hash('DeanPassword123', 10);

    const dean = await Dean.findOneAndUpdate(
      { email: 'dean@stud.umu.ac.ug' },
      {
        email: 'dean@stud.umu.ac.ug',
        password: hashedPassword,
        fullName: 'Dr. Dean of Students',
        role: 'dean_of_students',
        permissions: {
          viewAllSuggestions: true,
          respondToAllSuggestions: true,
          approveDepartmentResponses: true,
          viewAnalytics: true,
          manageDepartmentHeads: true
        }
      },
      { upsert: true, new: true }
    );

    console.log('✓ Dean account created/updated');
    console.log('Email: dean@stud.umu.ac.ug');
    console.log('Password: DeanPassword123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding dean:', error);
    process.exit(1);
  }
};

seedDean();