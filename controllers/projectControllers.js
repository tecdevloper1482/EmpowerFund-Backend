const Project = require('../models/Project');
const Investment = require('../models/Investment');
const fs = require('fs');

exports.createProject = async (req, res) => {
	try {
		const { title, description, goalAmount, category, deadline } = req.body;

		if (!title || !description || !goalAmount || !category || !deadline) {
			return res.status(400).json({ message: 'Please provide all required fields' });
		}

		let imageURLs = [];
		if (req.files && req.files['projectImages'] && req.files['projectImages'].length > 0) {
			imageURLs = req.files['projectImages'].map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
		} else if (req.body.imageURLs) {
			try {
				const parsed = JSON.parse(req.body.imageURLs);
				if (Array.isArray(parsed)) imageURLs = parsed;
			} catch {}
		}

		const project = await Project.create({
			title,
			description,
			goalAmount,
			category,
			deadline,
			imageURLs,
			creator: req.user._id,
		});

		return res.status(201).json(project);
	} catch (error) {
		if (req.files && req.files['projectImages']) {
			req.files['projectImages'].forEach(f => f.path && fs.unlink(f.path, () => {}));
		}

		return res.status(500).json({ message: 'Failed to create project', error: error.message });
	}
};

exports.getAllProjects = async (req, res) => {
	try {
		const { search = '', category = '' } = req.query;
		const query = {};

		if (search) {
			query.title = { $regex: search, $options: 'i' };
		}

		if (category && category !== 'All') {
			query.category = category;
		}

		const projects = await Project.find(query)
			.sort({ createdAt: -1 })
			.populate('creator', 'fullname email role');

		return res.status(200).json(projects);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
	}
};

exports.getProjectById = async (req, res) => {
	try {
		const project = await Project.findByIdAndUpdate(
			req.params.id,
			{ $inc: { views: 1 } },
			{ new: true }
		).populate(
			'creator',
			'fullname email role profileImage bio'
		);

		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}

		return res.status(200).json(project);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch project', error: error.message });
	}
};

exports.launchProject = async (req, res) => {
	try {
		const project = await Project.findOne({ _id: req.params.id, creator: req.user._id });
		if (!project) {
			return res.status(404).json({ message: 'Project not found or not authorized' });
		}

		project.status = 'launched';
		await project.save();
		return res.status(200).json(project);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to launch project', error: error.message });
	}
};

exports.deleteProject = async (req, res) => {
	try {
		const project = await Project.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
		if (!project) {
			return res.status(404).json({ message: 'Project not found or not authorized' });
		}

		return res.status(200).json({ message: 'Project deleted successfully' });
	} catch (error) {
		return res.status(500).json({ message: 'Failed to delete project', error: error.message });
	}
};

exports.investInProject = async (req, res) => {
	try {
		const amount = Number(req.body?.amount);

		if (!Number.isFinite(amount) || amount <= 0) {
			return res.status(400).json({ message: 'Please provide a valid investment amount' });
		}

		const project = await Project.findById(req.params.id);
		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}

		if (String(project.creator) === String(req.user._id)) {
			return res.status(400).json({ message: 'Creators cannot invest in their own project' });
		}

		project.currentAmount = Number(project.currentAmount || 0) + amount;
		await project.save();

		await Investment.create({
			user: req.user._id,
			project: project._id,
			amount,
		});

		return res.status(200).json({
			message: 'Investment successful',
			project,
		});
	} catch (error) {
		return res.status(500).json({ message: 'Failed to invest in project', error: error.message });
	}
};
