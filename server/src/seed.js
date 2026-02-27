require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing categories and staff to ensure clean state
        await Category.deleteMany({});
        await User.deleteMany({ role: { $in: ['admin', 'category_staff'] } });
        console.log('🧹 Cleaned existing categories and staff/admin accounts.');

        // 1. Create default admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@astu.edu.et',
            password: 'Admin@123',
            role: 'admin',
        });
        console.log('✅ Default admin created: admin@astu.edu.et / Admin@123');

        // 2. Define the 8 predefined categories
        const categoriesData = [
            { name: 'Dormitory Issues', description: 'Issues related to student dormitories, housing, and residential facilities.', email: 'staff.dorm@astu.edu.et' },
            { name: 'Laboratory Equipment', description: 'Problems with lab equipment, chemicals, computers, and safety concerns.', email: 'staff.lab@astu.edu.et' },
            { name: 'Internet & Network', description: 'Wi-Fi connectivity, network access, bandwidth, and internet service issues.', email: 'staff.network@astu.edu.et' },
            { name: 'Classroom Facilities', description: 'Classroom furniture, projectors, lighting, HVAC, and other facility issues.', email: 'staff.classroom@astu.edu.et' },
            { name: 'Library Services', description: 'Library access, book availability, study spaces, and related services.', email: 'staff.library@astu.edu.et' },
            { name: 'Cafeteria & Food', description: 'Food quality, cafeteria cleanliness, meal plans, and dining services.', email: 'staff.cafeteria@astu.edu.et' },
            { name: 'Transportation', description: 'Campus shuttle, parking, and transportation-related issues.', email: 'staff.transport@astu.edu.et' },
            { name: 'Other', description: 'General complaints and issues not covered by other categories.', email: 'staff.other@astu.edu.et' },
        ];

        // 3. Create categories and their staff accounts
        for (const data of categoriesData) {
            // Create the staff user first
            const staffUser = await User.create({
                name: `${data.name} Staff`,
                email: data.email,
                password: 'Staff@123', // Shared password for all category staff for demo
                role: 'category_staff',
            });

            // Create the category and link the staff user
            const category = await Category.create({
                name: data.name,
                description: data.description,
                staffUserId: staffUser._id,
            });

            // Update the staff user with their assigned category
            staffUser.assignedCategory = category._id;
            await staffUser.save();

            console.log(`✅ Created Category: ${data.name} | Staff Email: ${data.email}`);
        }

        console.log('\n🎉 Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedData();
