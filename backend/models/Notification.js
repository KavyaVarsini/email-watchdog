const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: String,
    default: 'telegram'
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  errorMessage: {
    type: String,
    default: ''
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
