const express = require('express');
const router = express.Router();
const { getEmails, getRecentEmails, getEmailById } = require('../controllers/emailController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getEmails);
router.get('/recent', protect, getRecentEmails);
router.get('/:id', protect, getEmailById);

module.exports = router;
