const express = require('express');
const { getSummary } = require('../../controllers/dashboard/summaryController');
const { getPerformance } = require('../../controllers/dashboard/performanceController');
const { getBackers } = require('../../controllers/dashboard/backersController');
const { getProjects } = require('../../controllers/dashboard/projectsController');
const { protect, authorizeRoles } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, authorizeRoles('Creator'), getSummary);
router.get('/performance', protect, authorizeRoles('Creator'), getPerformance);
router.get('/backers', protect, authorizeRoles('Creator'), getBackers);
router.get('/projects', protect, authorizeRoles('Creator'), getProjects);

module.exports = router;
