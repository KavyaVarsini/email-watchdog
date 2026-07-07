const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gmailMessageId: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: ''
  },
  snippet: {
    type: String,
    default: ''
  },
  receivedAt: {
    type: Date,
    required: true
  },
  notified: {
    type: Boolean,
    default: false
  },
  processed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a message is unique per user
EmailSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });

module.exports = mongoose.model('Email', EmailSchema);
