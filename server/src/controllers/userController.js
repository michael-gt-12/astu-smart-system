const User = require('../models/User');

// Get all users (Admin)
exports.getUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
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

// Update user role (Admin)
exports.updateUser = async (req, res, next) => {
    try {
        const { role, name } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        if (role) user.role = role;
        if (name) user.name = name;
        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully.',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// Delete user (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account.',
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

// Get staff list (for complaint assignment)
exports.getStaffList = async (req, res, next) => {
    try {
        const staff = await User.find({ role: 'category_staff' })
            .select('name email assignedCategory')
            .populate('assignedCategory', 'name')
            .sort({ name: 1 });

        res.json({
            success: true,
            data: { staff },
        });
    } catch (error) {
        next(error);
    }
};
