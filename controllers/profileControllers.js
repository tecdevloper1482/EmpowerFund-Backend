const Project = require('../models/Project');
const User = require('../models/users');
const Investment = require('../models/Investment');

exports.getUserProfile = async (req, res) => {
	try {
		const userPayload = {
			_id: req.user._id,
			fullname: req.user.fullname,
			email: req.user.email,
			role: req.user.role,
		};

		if (req.user.role === 'Creator') {
			const projects = await Project.find({ creator: req.user._id }).sort({ createdAt: -1 });
			return res.json({
				user: userPayload,
				projects,
				investments: [],
			});
		}

		const rawInvestments = await Investment.find({ user: req.user._id })
			.sort({ investedAt: -1 })
			.populate('project', 'title goalAmount currentAmount deadline status');

		const investments = rawInvestments.map((item) => {
			const goalAmount = Number(item.project?.goalAmount || 0);
			const currentAmount = Number(item.project?.currentAmount || 0);
			const fundingProgress = goalAmount > 0 ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0;

			let projectStatus = 'Active';
			if (fundingProgress >= 100) {
				projectStatus = 'Completed';
			} else if (item.project?.deadline && new Date(item.project.deadline) < new Date()) {
				projectStatus = 'Failed';
			}

			return {
				_id: item._id,
				projectId: item.project?._id,
				projectTitle: item.project?.title || 'Unknown project',
				amount: Number(item.amount || 0),
				investedAt: item.investedAt,
				projectStatus,
				fundingProgress,
			};
		});

		res.json({
			user: userPayload,
			projects: [],
			investments,
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error while fetching user profile' });
	}
};

exports.updateUserProfile = async (req, res) => {
	try {
		const { fullname } = req.body;

		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (fullname && !fullname.trim()) {
			return res.status(400).json({ message: 'Full name cannot be empty' });
		}

		if (typeof fullname === 'string') {
			user.fullname = fullname.trim();
		}

		await user.save();

		return res.json({
			message: 'Profile updated successfully',
			user: {
				_id: user._id,
				fullname: user.fullname,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		return res.status(500).json({ message: 'Server error while updating profile' });
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		if (!oldPassword || !newPassword || !confirmNewPassword) {
			return res.status(400).json({ message: 'All password fields are required' });
		}

		if (newPassword !== confirmNewPassword) {
			return res.status(400).json({ message: 'New password and confirm password must match' });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'New password must be at least 6 characters long' });
		}

		const user = await User.findById(req.user._id).select('+password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const isMatch = await user.matchPassword(oldPassword);
		if (!isMatch) {
			return res.status(400).json({ message: 'Old password is incorrect' });
		}

		user.password = newPassword;
		await user.save();

		return res.json({ message: 'Password changed successfully' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error while changing password' });
	}
};
