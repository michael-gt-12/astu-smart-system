const multer = require('multer');
const path = require('path');

// Blocked file extensions (security)
const BLOCKED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jsx',
    '.msi', '.dll', '.com', '.scr', '.pif', '.hta', '.cpl', '.msc',
    '.inf', '.reg', '.ws', '.wsf', '.wsc', '.wsh',
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (BLOCKED_EXTENSIONS.includes(ext)) {
        return cb(new Error('File type not allowed. Executable and script files are rejected.'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    },
});

module.exports = upload;
