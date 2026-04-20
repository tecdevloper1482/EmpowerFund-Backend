const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
		},
		description: {
			type: String,
			required: [true, 'Description is required'],
			trim: true,
		},
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		goalAmount: {
			type: Number,
			required: [true, 'Goal amount is required'],
			min: [1, 'Goal amount must be greater than 0'],
		},
		currentAmount: {
			type: Number,
			default: 0,
			min: [0, 'Current amount cannot be negative'],
		},
		category: {
			type: String,
			enum: ['Tech', 'Social', 'Creative', 'Education', 'Health', 'Environment'],
			required: [true, 'Category is required'],
		},
		deadline: {
			type: Date,
			required: [true, 'Deadline is required'],
		},
		imageURLs: {
			type: [String],
			default: [],
		},
		status: {
			type: String,
			enum: ['draft', 'launched'],
			default: 'draft',
		},
		views: {
			type: Number,
			default: 0,
			min: [0, 'Views cannot be negative'],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

projectSchema.virtual('fundingPercentage').get(function fundingPercentage() {
	if (!this.goalAmount || this.goalAmount <= 0) {
		return 0;
	}

	return Math.min(100, Math.round((this.currentAmount / this.goalAmount) * 100));
});

module.exports = mongoose.model('Project', projectSchema);
