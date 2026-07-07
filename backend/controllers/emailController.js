const Email = require('../models/Email');

/**
 * Fetch all tracked emails for the logged-in user with pagination, search, and filters.
 * GET /api/emails
 */
const getEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, search = '', notified } = req.query;

    const query = { userId };

    // Regex text matching on sender, subject, or snippet
    if (search) {
      query.$or = [
        { sender: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { snippet: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by notified status
    if (notified !== undefined) {
      query.notified = notified === 'true';
    }

    const count = await Email.countDocuments(query);
    const emails = await Email.find(query)
      .sort({ receivedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json({
      success: true,
      emails,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('[Email Controller] Error fetching emails:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving emails' });
  }
};

/**
 * Fetch top 5 recent emails for dashboard widgets
 * GET /api/emails/recent
 */
const getRecentEmails = async (req, res) => {
  try {
    const emails = await Email.find({ userId: req.user._id })
      .sort({ receivedAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, emails });
  } catch (err) {
    console.error('[Email Controller] Error fetching recent emails:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving recent emails' });
  }
};

/**
 * Fetch a single email record by ID
 * GET /api/emails/:id
 */
const getEmailById = async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.user._id });
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email record not found' });
    }
    res.status(200).json({ success: true, email });
  } catch (err) {
    console.error('[Email Controller] Error fetching email details:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving email details' });
  }
};

module.exports = {
  getEmails,
  getRecentEmails,
  getEmailById
};
