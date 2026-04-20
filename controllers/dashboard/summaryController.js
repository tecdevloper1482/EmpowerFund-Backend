const Project = require('../../models/Project');
const Investment = require('../../models/Investment');

exports.getSummary = async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user._id });
    const projectIds = projects.map((project) => project._id);

    const uniqueBackerIds = projectIds.length
      ? await Investment.distinct('user', { project: { $in: projectIds } })
      : [];

    const totalRaised = projects.reduce((acc, project) => acc + Number(project.currentAmount || 0), 0);
    const activeBackers = uniqueBackerIds.length;
    const fundingGoal = projects.reduce((acc, project) => acc + Number(project.goalAmount || 0), 0);
    const pageViews = projects.reduce((acc, project) => acc + Number(project.views || 0), 0);

    res.json({
      totalRaised,
      activeBackers,
      fundingGoal,
      pageViews,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
