const jwt = require('jsonwebtoken');
const User = require('../models/User');
const gmailService = require('../services/gmailService');
const { encrypt } = require('../utils/encryption');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Redirect user to Google OAuth Consent Page
 * GET /api/auth/google
 */
const googleAuth = (req, res) => {
  try {
    const url = gmailService.getAuthUrl();
    res.redirect(url);
  } catch (err) {
    console.error('[Auth Controller] Error generating Google Auth URL:', err.message);
    res.status(500).json({ success: false, message: 'Google Auth initiation failed' });
  }
};

/**
 * Handle Google OAuth redirection callback
 * GET /api/auth/google/callback
 */
const googleCallback = async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    console.error('[Auth Controller] Missing authorization code in callback');
    return res.redirect(`${frontendUrl}/login?error=missing_code`);
  }

  try {
    // Exchange code for tokens
    const tokens = await gmailService.getTokensFromCode(code);
    
    if (!tokens.access_token) {
      console.error('[Auth Controller] Access token not returned by Google');
      return res.redirect(`${frontendUrl}/login?error=no_access_token`);
    }

    // Get user info from Google
    const profile = await gmailService.getUserInfo(tokens.access_token);
    
    if (!profile.email) {
      console.error('[Auth Controller] Google profile missing email field');
      return res.redirect(`${frontendUrl}/login?error=no_email`);
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;

    // Check if user exists
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // Update access token
      user.accessToken = encryptedAccessToken;
      
      // Google only returns refresh token on first consent. If present in callback, update it.
      if (encryptedRefreshToken) {
        user.refreshToken = encryptedRefreshToken;
      }
      
      user.name = profile.name || user.name;
      user.email = profile.email || user.email;
      await user.save();
      console.log(`[Auth Controller] User logged in and updated: ${user.email}`);
    } else {
      // Create user
      if (!encryptedRefreshToken) {
        // This is a new user but no refresh token was provided. This shouldn't happen
        // if prompt='consent' is used, but we handle it just in case.
        console.error('[Auth Controller] Missing refresh token for new user registration.');
        return res.redirect(`${frontendUrl}/login?error=missing_refresh_token`);
      }

      user = new User({
        googleId: profile.id,
        name: profile.name || 'Google User',
        email: profile.email,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        telegramChatId: '' // Will be configured later
      });

      await user.save();
      console.log(`[Auth Controller] New user registered: ${user.email}`);
    }

    // Generate app JWT
    const jwtToken = generateToken(user._id);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend dashboard with token
    res.redirect(`${frontendUrl}/auth-callback?token=${jwtToken}`);
  } catch (err) {
    console.error('[Auth Controller] Error during Google Callback handling:', err.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=callback_failed`);
  }
};

/**
 * Get logged-in user profile info
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    // req.user is set by authentication middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        telegramChatId: req.user.telegramChatId,
        createdAt: req.user.createdAt
      }
    });
  } catch (err) {
    console.error('[Auth Controller] Error getting profile:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

/**
 * Logout action (Optional backend cleanup)
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  googleAuth,
  googleCallback,
  getProfile,
  logout
};
