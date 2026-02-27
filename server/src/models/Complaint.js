const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: 5000,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Pending Student Verification', 'Resolved'],
            default: 'Open',
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileUrl: {
            type: String,
            default: null,
        },
        remarks: {
            type: String,
            default: '',
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
complaintSchema.index({ studentId: 1, status: 1 });
complaintSchema.index({ category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
