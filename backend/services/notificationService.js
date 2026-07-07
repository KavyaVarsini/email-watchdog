const Notification = require('../models/Notification');

/**
 * Log notification dispatch results in MongoDB
 * @param {object} logDetails { emailId, userId, channel, status, errorMessage }
 */
const logNotification = async ({ emailId, userId, channel, status, errorMessage }) => {
  try {
    const log = new Notification({
      emailId,
      userId,
      channel: channel || 'telegram',
      status,
      errorMessage: errorMessage || ''
    });
    await log.save();
    return log;
  } catch (err) {
    console.error('[Notification Service Error] Failed to write notification log:', err.message);
  }
};

module.exports = {
  logNotification
};
