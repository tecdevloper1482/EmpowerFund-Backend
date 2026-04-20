const express = require('express');
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/profileControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUserProfile);
router.put('/', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
