const KnowledgeDoc = require('../models/KnowledgeDoc');
const { ingestPdf, deletePdfFromIndex } = require('../services/chatbotService');
const { uploadBuffer } = require('../config/cloudinary');

// Upload knowledge document (Admin)
exports.uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded.',
            });
        }

        // 1. Upload to Cloudinary
        const cloudinaryResult = await uploadBuffer(req.file.buffer, 'knowledge');

        // 2. Ingest into RAG (Pinecone) using the buffer
        const doc = await ingestPdf(
            req.file.buffer,
            req.file.originalname,
            req.user._id,
            cloudinaryResult.secure_url
        );

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
