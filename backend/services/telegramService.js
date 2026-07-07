const axios = require('axios');

const getBotToken = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is not defined.');
  }
  return token;
};

/**
 * Format date for message
 * @param {Date} date 
 * @returns {string} E.g., "10:34 AM" or formatted date
 */
const formatTime = (date) => {
  try {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return 'N/A';
  }
};

/**
 * Send a notification message for a newly received email
 * @param {string} chatId Telegram Chat ID
 * @param {object} email Email fields { sender, subject, receivedAt, snippet }
 * @returns {Promise<boolean>} Success status
 */
const sendTelegramNotification = async (chatId, email) => {
  if (!chatId) {
    throw new Error('No Telegram Chat ID configured.');
  }
  const token = getBotToken();
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const timeStr = formatTime(email.receivedAt);

  // Escape markdown characters slightly or rely on simple layout
  const cleanSender = email.sender.replace(/[_*`\[]/g, '\\$&');
  const cleanSubject = email.subject.replace(/[_*`\[]/g, '\\$&');
  const cleanSnippet = email.snippet.replace(/[_*`\[]/g, '\\$&');

  const text = `📩 *New Email Received*

*From:*
${cleanSender}

*Subject:*
${cleanSubject}

*Snippet:*
_${cleanSnippet}_

*Received:* ${timeStr}`;

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
    return response.data.ok === true;
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Telegram Service] Failed to send notification to ${chatId}:`, errorDetails);
    throw new Error(errorDetails);
  }
};

/**
 * Send a test notification to verify Chat ID and Bot connection
 * @param {string} chatId Telegram Chat ID
 * @returns {Promise<boolean>} Success status
 */
const sendTestNotification = async (chatId) => {
  if (!chatId) {
    throw new Error('No Telegram Chat ID provided.');
  }
  const token = getBotToken();
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const text = `🔔 *Test Notification Success!*
Your Email WatchDog is active and connected to this chat. You will now receive instant alerts for incoming Gmail messages.`;

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
    return response.data.ok === true;
  } catch (error) {
    const errorDetails = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Telegram Service] Test notification failed for ${chatId}:`, errorDetails);
    throw new Error(errorDetails);
  }
};

module.exports = {
  sendTelegramNotification,
  sendTestNotification
};
