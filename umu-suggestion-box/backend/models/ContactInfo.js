const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['whatsapp', 'sms', 'email', 'phone', 'location'],
    required: true,
    unique: true
  },
  value: {
    type: String,
    required: true
  },
  displayName: String,
  isActive: { type: Boolean, default: true },
  description: String,
  responseTime: String,
  icon: String,
  color: String,
  instructions: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactInfo', contactInfoSchema);