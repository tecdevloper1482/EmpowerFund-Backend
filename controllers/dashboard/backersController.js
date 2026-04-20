const Project = require('../../models/Project');

// Mock data for demonstration
const generateMockBackers = () => {
  const names = ['James Dalton', 'Sarah Alvi', 'Robert King', 'Elena Meyer'];
  const backers = [];
  for (let i = 0; i < 4; i++) {
    backers.push({
      id: i + 1,
      name: names[i],
      time: `${Math.floor(Math.random() * 59) + 1} mins ago`,
      amount: Math.floor(Math.random() * 1000) + 50,
    });
  }
  return backers;
};

exports.getBackers = async (req, res) => {
  try {
    // In a real app, you would fetch this from your database
    const recentBackers = generateMockBackers();
    res.json(recentBackers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
