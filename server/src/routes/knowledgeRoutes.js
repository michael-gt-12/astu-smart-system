const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const { authenticate, authorize } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for knowledge docs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/knowledge';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `knowledge-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
            return cb(new Error('Only PDF files are allowed for knowledge base.'));
        }
        cb(null, true);
    },
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Admin only routes
router.use(authenticate, authorize('admin'));

router.post('/', upload.single('file'), knowledgeController.uploadDocument);
router.get('/', knowledgeController.getDocuments);
router.delete('/:id', knowledgeController.deleteDocument);

module.exports = router;
