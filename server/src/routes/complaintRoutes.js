const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, createComplaintSchema, updateComplaintSchema } = require('../middlewares/validate');
const upload = require('../config/multer');

// Rate limiter for complaint submission
const submitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many complaints submitted. Please try again later.' },
});

// Student routes
router.post(
    '/',
    authenticate,
    authorize('student'),
    submitLimiter,
    upload.single('file'),
    validate(createComplaintSchema),
    complaintController.createComplaint
);

router.get(
    '/my',
    authenticate,
    authorize('student'),
    complaintController.getMyComplaints
);

// Staff routes
router.get(
    '/assigned',
    authenticate,
    authorize('category_staff'),
    complaintController.getAssignedComplaints
);

// Admin routes
router.get(
    '/all',
    authenticate,
    authorize('admin'),
    complaintController.getAllComplaints
);

// Shared routes
router.get(
    '/:id',
    authenticate,
    complaintController.getComplaint
);

router.put(
    '/:id',
    authenticate,
    authorize('category_staff', 'admin'),
    validate(updateComplaintSchema),
    complaintController.updateComplaint
);

router.patch(
    '/:id/status',
    authenticate,
    authorize('category_staff', 'admin'),
    complaintController.updateComplaint
);

router.post(
    '/:id/confirm',
    authenticate,
    authorize('student'),
    complaintController.confirmCompletion
);

// Shared routes
router.get(
    '/:id',
    authenticate,
    complaintController.getComplaint
);

module.exports = router;
