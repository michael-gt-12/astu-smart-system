const KnowledgeDoc = require('../models/KnowledgeDoc');
const { ingestPdf, deletePdfFromIndex } = require('../services/chatbotService');
const path = require('path');
const fs = require('fs');

// Upload knowledge document (Admin)
exports.uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded.',
            });
        }

        const filePath = req.file.path;
        const originalName = req.file.originalname;

        const doc = await ingestPdf(filePath, originalName, req.user._id);

        res.status(201).json({
            success: true,
            message: 'Document uploaded and indexed successfully.',
            data: { doc },
        });
    } catch (error) {
        next(error);
    }
};

// Get all knowledge documents (Admin)
exports.getDocuments = async (req, res, next) => {
    try {
        const documents = await KnowledgeDoc.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { documents },
        });
    } catch (error) {
        next(error);
    }
};

// Delete knowledge document (Admin)
exports.deleteDocument = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deletePdfFromIndex(id);

        res.json({
            success: true,
            message: 'Document deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};
