const mongoose = require('mongoose');
const ContactInfo = require('./models/ContactInfo');
require('dotenv').config();

const seedContacts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const contacts = [
      {
        type: 'whatsapp',
        value: '+256706930650',
        displayName: 'WhatsApp Support',
        description: 'Chat with us on WhatsApp for quick responses',
        responseTime: '5-10 minutes',
        icon: '💚',
        color: '#25d366',
        instructions: 'Click to open WhatsApp chat'
      },
      {
        type: 'sms',
        value: '+256791042302',
        displayName: 'SMS Support',
        description: 'Send us an SMS and we\'ll respond shortly',
        responseTime: '15-30 minutes',
        icon: '📱',
        color: '#3498db',
        instructions: 'Your SMS will be received by our support team'
      },
      {
        type: 'email',
        value: 'infor-desk@umu.ac.ug',
        displayName: 'Email Support',
        description: 'Email our support team for detailed assistance',
        responseTime: '24 hours',
        icon: '✉️',
        color: '#e74c3c',
        instructions: 'Send an email with your issue details'
      },
      {
        type: 'phone',
        value: '+256791042302',
        displayName: 'Call Us',
        description: 'Talk directly with our support team',
        responseTime: 'Immediate',
        icon: '📞',
        color: '#f39c12',
        instructions: 'Click to call our support line'
      },
      {
        type: 'location',
        value: 'Office of the Dean of Students, UMU Nkozi Campus',
        displayName: 'Visit Us',
        description: 'Visit our office for in-person support',
        responseTime: 'During office hours',
        icon: '📍',
        color: '#9b59b6',
        instructions: 'Located in the main administration building'
      }
    ];

    for (const contact of contacts) {
      await ContactInfo.findOneAndUpdate(
        { type: contact.type },
        contact,
        { upsert: true, new: true }
      );
    }

    console.log('✓ Contact information seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding contacts:', error);
    process.exit(1);
  }
};

seedContacts();