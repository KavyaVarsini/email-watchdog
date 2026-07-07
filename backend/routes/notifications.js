const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const telegramService = require('../services/telegramService');

/**
 * Fetch notification execution history logs
 * GET /api/notifications
 */
router.get('/', protect, async (req, res) => {
  try {
    const logs = await Notification.find({ userId: req.user._id })
      .populate('emailId', 'sender subject receivedAt')
      .sort({ sentAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, logs });
  } catch (err) {
    console.error('[Notification Route] Error fetching logs:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving logs' });
  }
});

/**
 * Dispatch test notification to verify integration
 * POST /api/notifications/test
 */
router.post('/test', protect, async (req, res) => {
  const { telegramChatId } = req.body;
  
  // Use user's saved ID if none is supplied in the request body
  const targetUser = await User.findById(req.user._id);
  const chatId = (telegramChatId && telegramChatId.trim() !== '') ? telegramChatId.trim() : (targetUser ? targetUser.telegramChatId : '');

  if (!chatId) {
    return res.status(400).json({ success: false, message: 'Please provide a valid Telegram Chat ID' });
  }

  try {
    const result = await telegramService.sendTestNotification(chatId);
    if (result) {
      return res.status(200).json({ success: true, message: 'Test notification sent successfully!' });
    } else {
      return res.status(500).json({ success: false, message: 'Telegram dispatch returned failure' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: `Failed to send: ${err.message}` });
  }
});

/**
 * Save user's Telegram Chat ID in preferences
 * POST /api/notifications/telegram-id
 */
router.post('/telegram-id', protect, async (req, res) => {
  const { telegramChatId } = req.body;

  if (telegramChatId === undefined) {
    return res.status(400).json({ success: false, message: 'telegramChatId field is required' });
  }

  try {
    const user = await User.findById(req.user._id);
    user.telegramChatId = telegramChatId.trim();
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Telegram Chat ID updated successfully',
      telegramChatId: user.telegramChatId
    });
  } catch (err) {
    console.error('[Notification Route] Error saving Chat ID:', err.message);
    res.status(500).json({ success: false, message: 'Server error updating Telegram chat ID' });
  }
});

module.exports = router;
