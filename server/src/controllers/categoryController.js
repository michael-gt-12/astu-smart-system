const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

// Get all categories
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json({
            success: true,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

// Create category (Admin)
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({ name, description });
        res.status(201).json({
            success: true,
            message: 'Category created successfully.',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

// Update category (Admin)
exports.updateCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully.',
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

// Delete category (Admin)
exports.deleteCategory = async (req, res, next) => {
    try {
        // Check if any complaints use this category
        const complaintCount = await Complaint.countDocuments({ category: req.params.id });
        if (complaintCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${complaintCount} complaint(s) are using it.`,
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};
