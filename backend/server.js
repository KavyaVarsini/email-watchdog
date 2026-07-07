const path = require('path');
const dotenv = require('dotenv');

// Load environment variables using absolute path relative to this file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Validate critical environment variables on startup
const requiredEnv = [
  'MONGO_URI',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'TELEGRAM_BOT_TOKEN'
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[Server Error] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initCron, watchEmails } = require('./jobs/emailWatcher');
const { protect } = require('./middleware/auth');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Diagnostic Check
app.get('/', (req, res) => {
  res.send('Email WatchDog API is running.');
});

// Manual trigger for email polling (excellent for instant testing and manual verification)
app.post('/api/test/poll-now', protect, async (req, res) => {
  try {
    console.log(`[Manual Trigger] Polling emails initiated by user: ${req.user.email}`);
    await watchEmails();
    res.status(200).json({ success: true, message: 'Email poll successfully executed.' });
  } catch (err) {
    console.error('[Manual Trigger Error] Failed to run watchEmails:', err.message);
    res.status(500).json({ success: false, message: `Failed to poll emails: ${err.message}` });
  }
});

// Global Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Email WatchDog API running on port ${PORT}`);
  
  // Initialize cron job
  initCron();
});
