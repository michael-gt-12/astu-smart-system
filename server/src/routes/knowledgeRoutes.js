const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const { authenticate, authorize } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for knowledge docs (Memory storage for Cloudinary)
const storage = multer.memoryStorage();

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
