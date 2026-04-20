const Project = require('../../models/Project');

// Mock data for demonstration
const generateMockPerformanceData = () => {
  const data = [];
  let value = 1000;
  for (let i = 4; i > 0; i--) {
    value += Math.random() * 5000;
    data.push({ week: `Week ${5 - i}`, revenue: Math.floor(value) });
  }
  return data;
};

exports.getPerformance = async (req, res) => {
  try {
    // In a real app, you would aggregate this data from your database
    const performanceData = generateMockPerformanceData();
    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
