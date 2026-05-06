const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (_, file, cb) => {
	if (!file.mimetype || !file.mimetype.startsWith('image/')) {
		return cb(new Error('Only image files are allowed'));
	}

	cb(null, true);
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});

exports.uploadProjectImages = (req, res, next) => {
	upload.fields([
		{ name: 'projectImages', maxCount: 5 }
	])(req, res, (error) => {
		if (!error) {
			return next();
		}

		if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ message: 'Image size must be 5MB or less' });
		}

		return res.status(400).json({ message: error.message || 'Image upload failed' });
	});
};
