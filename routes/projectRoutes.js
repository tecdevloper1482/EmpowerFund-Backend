const express = require('express');
const {
	createProject,
	getAllProjects,
	getProjectById,
	launchProject,
	deleteProject,
	investInProject,
} = require('../controllers/projectControllers');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadProjectImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/').post(protect, authorizeRoles('Creator'), uploadProjectImages, createProject).get(getAllProjects);
router.get('/:id', getProjectById);
router.post('/:id/invest', protect, authorizeRoles('Investor', 'Creator'), investInProject);
router.put('/:id/launch', protect, authorizeRoles('Creator'), launchProject);
router.delete('/:id', protect, authorizeRoles('Creator'), deleteProject);

module.exports = router;
