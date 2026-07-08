const axios = require('axios');

const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  if (!url) {
    console.log('[Keep-Alive] No RENDER_EXTERNAL_URL or BACKEND_URL configured. Self-ping skipped.');
    return;
  }

  // Ping every 10 minutes (600,000 ms) to keep the Render free tier service awake (15-min idling limit)
  const interval = 10 * 60 * 1000;
  
  console.log(`[Keep-Alive] Initializing self-ping to ${url} every 10 minutes...`);
  
  // Set up periodic ping
  setInterval(async () => {
    try {
      console.log(`[Keep-Alive] Sending self-ping to ${url}...`);
      const response = await axios.get(url);
      console.log(`[Keep-Alive] Self-ping successful! Status: ${response.status}`);
    } catch (err) {
      console.error('[Keep-Alive] Self-ping failed:', err.message);
    }
  }, interval);
};

module.exports = keepAlive;
