const express = require('express');
const {
  getInvestorSummary,
  getInvestorInvestments,
  getInvestorRecentActivity,
  getInvestorNotifications,
  getInvestorTrend,
} = require('../../controllers/dashboard/investorController');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, authorizeRoles('Investor'), getInvestorSummary);
router.get('/investments', protect, authorizeRoles('Investor'), getInvestorInvestments);
router.get('/recent-activity', protect, authorizeRoles('Investor'), getInvestorRecentActivity);
router.get('/notifications', protect, authorizeRoles('Investor'), getInvestorNotifications);
router.get('/trend', protect, authorizeRoles('Investor'), getInvestorTrend);

module.exports = router;
