const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

// Get all categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().populate('staffUserId', 'email').sort({ name: 1 });
        res.json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};
