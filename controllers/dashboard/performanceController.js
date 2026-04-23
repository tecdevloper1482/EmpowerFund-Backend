const Project = require('../../models/Project');
const Investment = require('../../models/Investment');

exports.getPerformance = async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user._id }).select('_id');
    const projectIds = projects.map((project) => project._id);

    if (!projectIds.length) {
      return res.json([]);
    }

    const investments = await Investment.find({ project: { $in: projectIds } })
      .select('amount investedAt')
      .sort({ investedAt: 1 });

    const totalInvested = investments.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // If nothing has been raised yet, return no points so UI can show empty state.
    if (totalInvested <= 0) {
      return res.json([]);
    }

    const numberOfWeeks = 4;
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (numberOfWeeks * 7 - 1));

    const weeklyTotals = Array(numberOfWeeks).fill(0);
    let baselineBeforeWindow = 0;

    investments.forEach((investment) => {
      const investedAt = new Date(investment.investedAt);
      const amount = Number(investment.amount || 0);

      if (investedAt < startDate) {
        baselineBeforeWindow += amount;
        return;
      }

      if (investedAt > endDate) {
        return;
      }

      const diffDays = Math.floor((investedAt - startDate) / millisecondsPerDay);
      const weekIndex = Math.floor(diffDays / 7);

      if (weekIndex >= 0 && weekIndex < numberOfWeeks) {
        weeklyTotals[weekIndex] += amount;
      }
    });

    let runningTotal = baselineBeforeWindow;
    const performanceData = weeklyTotals.map((amount, index) => {
      runningTotal += amount;
      return {
        week: `Week ${index + 1}`,
        revenue: Math.round(runningTotal),
      };
    });

    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
