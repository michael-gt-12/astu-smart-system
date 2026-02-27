const Complaint = require('../models/Complaint');

// Get analytics data (Admin)
exports.getAnalytics = async (req, res, next) => {
    try {
        // Total complaints
        const totalComplaints = await Complaint.countDocuments();

        // Status counts
        const statusCounts = await Complaint.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const statusMap = {};
        statusCounts.forEach((s) => {
            statusMap[s._id] = s.count;
        });

        // Resolution rate
        const resolved = statusMap['Resolved'] || 0;
        const resolutionRate = totalComplaints > 0
            ? Math.round((resolved / totalComplaints) * 100)
            : 0;

        // Complaints per category
        const categoryStats = await Complaint.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo',
                },
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$categoryInfo.name',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // Recent complaints (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = await Complaint.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
        });

        res.json({
            success: true,
            data: {
                totalComplaints,
                resolved,
                inProgress: statusMap['In Progress'] || 0,
                open: statusMap['Open'] || 0,
                resolutionRate,
                recentCount,
                categoryStats: categoryStats.map((c) => ({
                    name: c._id,
                    count: c.count,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
};
