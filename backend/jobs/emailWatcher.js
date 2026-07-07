const cron = require('node-cron');
const User = require('../models/User');
const Email = require('../models/Email');
const gmailService = require('../services/gmailService');
const telegramService = require('../services/telegramService');
const { logNotification } = require('../services/notificationService');

const watchEmails = async () => {
  console.log('[Cron Job] Executing scheduled email check...');
  
  try {
    const users = await User.find({ refreshToken: { $ne: '' } });
    
    if (users.length === 0) {
      console.log('[Cron Job] No users found with configured Gmail access.');
      return;
    }
    
    for (const user of users) {
      try {
        console.log(`[Cron Job] Checking emails for user: ${user.email}`);
        const messages = await gmailService.fetchRecentEmails(user);
        
        if (messages.length === 0) {
          console.log(`[Cron Job] No messages returned for user: ${user.email}`);
          continue;
        }

        // Process messages from oldest to newest in the chunk
        // Google returns them newest first (index 0 is newest), so we process in reverse order
        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i];
          
          // Check if email already processed
          const exists = await Email.findOne({ userId: user._id, gmailMessageId: msg.id });
          
          if (exists) {
            continue; // Skip already processed email
          }
          
          console.log(`[Cron Job] New email detected! Message ID: ${msg.id}. Fetching details...`);
          
          // Fetch full email details
          const emailDetails = await gmailService.getEmailDetails(user, msg.id);
          
          // Create Email record
          const emailRecord = new Email({
            userId: user._id,
            gmailMessageId: emailDetails.gmailMessageId,
            sender: emailDetails.sender,
            subject: emailDetails.subject,
            snippet: emailDetails.snippet,
            receivedAt: emailDetails.receivedAt,
            processed: true,
            notified: false
          });
          
          await emailRecord.save();
          
          // Try sending Telegram notification
          if (user.telegramChatId) {
            try {
              console.log(`[Telegram Service] Sending notification to chat ${user.telegramChatId} for: "${emailDetails.subject}"`);
              const success = await telegramService.sendTelegramNotification(user.telegramChatId, emailDetails);
              
              if (success) {
                emailRecord.notified = true;
                await emailRecord.save();
                
                await logNotification({
                  emailId: emailRecord._id,
                  userId: user._id,
                  channel: 'telegram',
                  status: 'success'
                });
              } else {
                await logNotification({
                  emailId: emailRecord._id,
                  userId: user._id,
                  channel: 'telegram',
                  status: 'failed',
                  errorMessage: 'Telegram sendMessage returned false status'
                });
              }
            } catch (teleErr) {
              await logNotification({
                emailId: emailRecord._id,
                userId: user._id,
                channel: 'telegram',
                status: 'failed',
                errorMessage: teleErr.message
              });
            }
          } else {
            console.log(`[Telegram Service] Skipped notification for ${user.email} (No Telegram Chat ID configured)`);
            await logNotification({
              emailId: emailRecord._id,
              userId: user._id,
              channel: 'telegram',
              status: 'failed',
              errorMessage: 'No Telegram Chat ID configured in settings'
            });
          }
        }
      } catch (userErr) {
        console.error(`[Cron Job Error] Failed to process emails for user ${user.email}:`, userErr.message);
      }
    }
  } catch (err) {
    console.error('[Cron Job Error] Error querying users in cron job:', err.message);
  }
};

const initCron = () => {
  // Run every 1 minute
  cron.schedule('*/1 * * * *', watchEmails);
  console.log('[Cron Job] Gmail Watcher Cron Job initialized. Polling interval: 1 minute.');
};

module.exports = {
  initCron,
  watchEmails // Exported for manual trigger testing
};
