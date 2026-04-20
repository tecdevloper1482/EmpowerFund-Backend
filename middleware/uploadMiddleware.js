const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, uploadsDir);
	},
	filename: (_, file, cb) => {
		const extension = path.extname(file.originalname);
		const safeBaseName = path
			.basename(file.originalname, extension)
			.replace(/[^a-zA-Z0-9-_]/g, '-')
			.slice(0, 60);
		const uniqueName = `${Date.now()}-${safeBaseName || 'project-image'}${extension}`;
		cb(null, uniqueName);
	},
});

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
