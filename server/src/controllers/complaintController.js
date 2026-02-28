const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendComplaintSubmittedEmail, sendStatusUpdateEmail } = require('../services/emailService');

// Create complaint (Student)
exports.createComplaint = async (req, res, next) => {
    try {
        const { title, description, category } = req.body;

        const complaintData = {
            title,
            description,
            category,
            studentId: req.user._id,
        };

        if (req.file) {
            complaintData.fileUrl = `/uploads/${req.file.filename}`;
        }

        const complaint = await Complaint.create(complaintData);
        const populated = await complaint.populate([
            { path: 'category', select: 'name' },
            { path: 'studentId', select: 'name email' },
        ]);

        // Send email notification
        sendComplaintSubmittedEmail(req.user.email, complaint, req.user.name);

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully.',
            data: { complaint: populated },
        });
    } catch (error) {
        next(error);
    }
};

// Get my complaints (Student)
exports.getMyComplaints = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { studentId: req.user._id };
        if (status) query.status = status;

        const complaints = await Complaint.find(query)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(query);

        res.json({
            success: true,
            data: {
                complaints,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single complaint
exports.getComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('category', 'name')
            .populate('studentId', 'name email');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found.',
            });
        }

        // Ownership/role check
        const isOwner = complaint.studentId._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        const isCategoryStaff = req.user.role === 'category_staff' &&
            complaint.category._id.toString() === req.user.assignedCategory?.toString();

        if (!isOwner && !isAdmin && !isCategoryStaff) {
            return res.status(403).json({
                success: false,
                message: 'Access denied.',
            });
        }

        res.json({
            success: true,
            data: { complaint },
        });
    } catch (error) {
        next(error);
    }
};

// Get all complaints (Admin)
exports.getAllComplaints = async (req, res, next) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        const complaints = await Complaint.find(query)
            .populate('category', 'name')
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(query);

        res.json({
            success: true,
            data: {
                complaints,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get assigned complaints (Staff)
exports.getAssignedComplaints = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        // Staff can only see complaints in their assigned category
        const query = { category: req.user.assignedCategory };
        if (status) query.status = status;

        const complaints = await Complaint.find(query)
            .populate('category', 'name')
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(query);

        res.json({
            success: true,
            data: {
                complaints,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update complaint (Staff/Admin)
exports.updateComplaint = async (req, res, next) => {
    try {
        const { status, remarks } = req.body;

        const complaint = await Complaint.findById(req.params.id)
            .populate('studentId', 'name email')
            .populate('category', 'name');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found.',
            });
        }

        // Category isolation for staff
        if (req.user.role === 'category_staff' &&
            complaint.category._id.toString() !== req.user.assignedCategory?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This complaint belongs to a different category.',
            });
        }

        // Role-based status transition validation
        if (status && status !== complaint.status) {
            if (req.user.role === 'category_staff') {
                const allowedTransitions = ['In Progress', 'Pending Student Verification'];
                if (!allowedTransitions.includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: `Staff can only set status to: ${allowedTransitions.join(', ')}`,
                    });
                }
            }
        }

        const oldStatus = complaint.status;

        if (status) complaint.status = status;
        if (remarks !== undefined) complaint.remarks = remarks;

        await complaint.save();

        const updated = await Complaint.findById(complaint._id)
            .populate('category', 'name')
            .populate('studentId', 'name email');

        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io && status && status !== oldStatus) {
            // Notify student
            io.to(`user_${complaint.studentId._id}`).emit('complaintUpdated', {
                complaintId: complaint._id,
                status: complaint.status,
                remarks: complaint.remarks,
                updatedAt: complaint.updatedAt,
            });

            // Notify admin
            io.to('admin_room').emit('complaintUpdated', {
                complaintId: complaint._id,
                status: complaint.status,
            });

            // Send email notification
            sendStatusUpdateEmail(
                complaint.studentId.email,
                complaint,
                complaint.studentId.name,
                status,
                remarks
            );
        }

        res.json({
            success: true,
            message: 'Complaint updated successfully.',
            data: { complaint: updated },
        });
    } catch (error) {
        next(error);
    }
};

// Confirm completion (Student)
exports.confirmCompletion = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('studentId', 'name email')
            .populate('category', 'name staffUserId');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found.',
            });
        }

        // Check ownership
        if (complaint.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only confirm your own complaints.',
            });
        }

        // Check status
        if (complaint.status !== 'Pending Student Verification') {
            return res.status(400).json({
                success: false,
                message: 'Only complaints pending your verification can be confirmed.',
            });
        }

        complaint.status = 'Resolved';
        await complaint.save();

        // Emit socket events
        const io = req.app.get('io');
        if (io) {
            // Notify relevant category staff
            if (complaint.category.staffUserId) {
                io.to(`user_${complaint.category.staffUserId}`).emit('complaintUpdated', {
                    complaintId: complaint._id,
                    status: 'Resolved',
                });
            }
            // Notify admin
            io.to('admin_room').emit('complaintUpdated', {
                complaintId: complaint._id,
                status: 'Resolved',
            });
        }

        res.json({
            success: true,
            message: 'Complaint marked as resolved. Thank you for your feedback.',
            data: { complaint },
        });
    } catch (error) {
        next(error);
    }
};

