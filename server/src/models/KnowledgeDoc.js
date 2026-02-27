const mongoose = require('mongoose');

const knowledgeDocSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        chunkCount: {
            type: Number,
            default: 0,
        },
        pineconeIds: [{
            type: String,
        }],
        fileSize: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
