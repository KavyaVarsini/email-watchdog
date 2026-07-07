const { google } = require('googleapis');
const { decrypt, encrypt } = require('../utils/encryption');
const User = require('../models/User');

const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

const getAuthUrl = () => {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Demands refresh token
    prompt: 'consent', // Required to force Google to return the refresh token on subsequent logins
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  });
};

const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

const getUserInfo = async (accessToken) => {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const response = await oauth2.userinfo.get();
  return response.data;
};

/**
 * Returns an OAuth2 client configured with user's credentials.
 * Automatically hooks token refresh events to update the User database record.
 */
const getClientForUser = async (user) => {
  const oauth2Client = getOAuthClient();
  const decAccessToken = decrypt(user.accessToken);
  const decRefreshToken = decrypt(user.refreshToken);

  oauth2Client.setCredentials({
    access_token: decAccessToken,
    refresh_token: decRefreshToken
  });

  oauth2Client.on('tokens', async (tokens) => {
    try {
      const updates = {};
      if (tokens.access_token) {
        updates.accessToken = encrypt(tokens.access_token);
      }
      if (tokens.refresh_token) {
        updates.refreshToken = encrypt(tokens.refresh_token);
      }
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates);
        console.log(`[Gmail Service] Refreshed credentials saved for user: ${user.email}`);
      }
    } catch (err) {
      console.error('[Gmail Service] Failed to save auto-refreshed tokens:', err.message);
    }
  });

  return oauth2Client;
};

const fetchRecentEmails = async (user) => {
  try {
    const oauth2Client = await getClientForUser(user);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Poll the latest 10 messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10
    });
    
    return response.data.messages || [];
  } catch (err) {
    console.error(`[Gmail Service] Error fetching recent messages list for ${user.email}:`, err.message);
    throw err;
  }
};

const getEmailDetails = async (user, messageId) => {
  try {
    const oauth2Client = await getClientForUser(user);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    const message = response.data;
    const payload = message.payload;
    const headers = payload ? payload.headers : [];
    
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    const sender = getHeader('from') || 'Unknown Sender';
    const subject = getHeader('subject') || '(No Subject)';
    const dateStr = getHeader('date');
    const receivedAt = dateStr ? new Date(dateStr) : new Date(parseInt(message.internalDate));
    
    return {
      gmailMessageId: message.id,
      sender,
      subject,
      snippet: message.snippet || '',
      receivedAt
    };
  } catch (err) {
    console.error(`[Gmail Service] Error fetching details for message ${messageId} of user ${user.email}:`, err.message);
    throw err;
  }
};

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  getUserInfo,
  getClientForUser,
  fetchRecentEmails,
  getEmailDetails
};
