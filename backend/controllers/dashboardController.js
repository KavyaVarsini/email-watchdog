const Email = require('../models/Email');
const User = require('../models/User');

/**
 * Fetch overview statistics for the current user
 * GET /api/dashboard/stats
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalEmails = await Email.countDocuments({ userId });
    const notifiedEmails = await Email.countDocuments({ userId, notified: true });
    const failedEmails = await Email.countDocuments({ userId, notified: false });

    // Check if monitoring is operational
    const user = await User.findById(userId);
    const monitoringActive = user ? !!user.refreshToken : false;

    res.status(200).json({
      success: true,
      stats: {
        totalEmails,
        notifiedEmails,
        failedEmails,
        monitoringActive,
        telegramChatId: user ? user.telegramChatId : ''
      }
    });
  } catch (err) {
    console.error('[Dashboard Controller] Error fetching stats:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard stats' });
  }
};

/**
 * Aggregate email frequency counts for the last 7 days to display in visual charts
 * GET /api/dashboard/activity
 */
const getActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    // Set timeline bounds for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Reset hours to start of day for alignment
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activity = await Email.aggregate([
      {
        $match: {
          userId: userId,
          receivedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$receivedAt" }
          },
          count: { $sum: 1 },
          notified: { $sum: { $cond: [{ $eq: ["$notified", true] }, 1, 0] } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format the last 7 days explicitly to handle days with zero emails gracefully
    const formattedActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const match = activity.find(a => a._id === dateStr);
      formattedActivity.push({
        date: dateStr,
        count: match ? match.count : 0,
        notified: match ? match.notified : 0
      });
    }

    res.status(200).json({ success: true, activity: formattedActivity });
  } catch (err) {
    console.error('[Dashboard Controller] Error fetching activity:', err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving activity data' });
  }
};

module.exports = {
  getStats,
  getActivity
};
