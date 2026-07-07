const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not defined.');
  }
  // Ensure the key is exactly 32 bytes
  if (Buffer.byteLength(key, 'utf8') !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long.');
  }
  return Buffer.from(key, 'utf8');
};

/**
 * Encrypt clear text
 * @param {string} text 
 * @returns {string} Encrypted string format "iv:encryptedData"
 */
const encrypt = (text) => {
  if (!text) return '';
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('[Encryption Utility Error]', err.message);
    throw err;
  }
};

/**
 * Decrypt cipher text
 * @param {string} encryptedText Format "iv:encryptedData"
 * @returns {string} Decrypted clear text
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[Decryption Utility Error]', err.message);
    throw err;
  }
};

module.exports = {
  encrypt,
  decrypt
};
