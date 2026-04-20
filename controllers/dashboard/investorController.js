const Investment = require('../../models/Investment');

const getProjectLifecycleStatus = (project) => {
  if (!project) return 'Failed';

  const goal = Number(project.goalAmount || 0);
  const raised = Number(project.currentAmount || 0);
  const fundingPercent = goal > 0 ? (raised / goal) * 100 : 0;
  const isPastDeadline = project.deadline ? new Date(project.deadline) < new Date() : false;

  if (fundingPercent >= 100) return 'Completed';
  if (isPastDeadline) return 'Failed';
  return 'Active';
};

const getFundingProgress = (project) => {
  const goal = Number(project?.goalAmount || 0);
  const raised = Number(project?.currentAmount || 0);
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
};

exports.getInvestorSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).populate(
      'project',
      'goalAmount currentAmount deadline'
    );

    const totalAmountInvested = investments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const uniqueProjectIds = new Set(investments.map((item) => String(item.project?._id)).filter(Boolean));

    let activeInvestments = 0;
    let completedInvestments = 0;

    investments.forEach((item) => {
      const status = getProjectLifecycleStatus(item.project);
      if (status === 'Active') activeInvestments += 1;
      if (status === 'Completed') completedInvestments += 1;
    });

    return res.json({
      totalAmountInvested,
      totalProjectsInvested: uniqueProjectIds.size,
      activeInvestments,
      completedInvestments,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load investor summary' });
  }
};

exports.getInvestorInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .sort({ investedAt: -1 })
      .populate('project', 'title goalAmount currentAmount deadline status');

    const formatted = investments.map((item) => ({
      _id: item._id,
      projectId: item.project?._id,
      projectTitle: item.project?.title || 'Unknown project',
      amountInvested: item.amount,
      dateOfInvestment: item.investedAt,
      projectStatus: getProjectLifecycleStatus(item.project),
      fundingProgress: getFundingProgress(item.project),
      raisedAmount: Number(item.project?.currentAmount || 0),
      goalAmount: Number(item.project?.goalAmount || 0),
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load investments' });
  }
};

exports.getInvestorRecentActivity = async (req, res) => {
  try {
    const activities = await Investment.find({ user: req.user._id })
      .sort({ investedAt: -1 })
      .limit(6)
      .populate('project', 'title');

    return res.json(
      activities.map((item) => ({
        _id: item._id,
        type: 'Investment',
        description: `Invested Rs ${Number(item.amount || 0).toLocaleString()} in ${item.project?.title || 'a project'}`,
        amount: item.amount,
        createdAt: item.investedAt,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load recent activity' });
  }
};

exports.getInvestorNotifications = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .sort({ investedAt: -1 })
      .populate('project', 'title goalAmount currentAmount deadline');

    const notifications = investments.slice(0, 8).map((item) => {
      const project = item.project;
      const status = getProjectLifecycleStatus(project);
      const progress = getFundingProgress(project);

      let message = `${project?.title || 'Project'} is currently ${progress}% funded.`;
      if (status === 'Completed') {
        message = `${project?.title || 'Project'} has reached its funding goal.`;
      } else if (status === 'Failed') {
        message = `${project?.title || 'Project'} did not reach its goal before deadline.`;
      }

      return {
        _id: item._id,
        projectId: project?._id,
        message,
        status,
        createdAt: item.investedAt,
      };
    });

    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load notifications' });
  }
};

exports.getInvestorTrend = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ investedAt: 1 });

    const monthlyTotals = investments.reduce((acc, item) => {
      const date = new Date(item.investedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + Number(item.amount || 0);
      return acc;
    }, {});

    const trend = Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({ month, amount }));

    return res.json(trend);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load trend data' });
  }
};
