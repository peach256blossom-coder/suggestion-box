const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  contactMethod: {
    type: String,
    enum: ['whatsapp', 'sms', 'email', 'phone', 'web'],
    default: 'web'
  },
  status: {
    type: String,
    enum: ['new', 'open', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['account', 'technical', 'suggestion', 'general', 'bug', 'feature_request'],
    default: 'general'
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'admin', 'system'],
      default: 'user'
    },
    message: String,
    timestamp: { type: Date, default: Date.now },
    attachments: [String]
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sendToDean: {
    type: Boolean,
    default: false
  },
  sentToDean: {
    type: Boolean,
    default: false
  },
  deanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dean'
  },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Update timestamps
supportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Support', supportSchema);