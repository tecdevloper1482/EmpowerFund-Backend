const Project = require('../../models/Project');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user._id }).select('title status goalAmount currentAmount deadline');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
