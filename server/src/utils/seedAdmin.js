const User = require('../models/User');
const { ROLES } = require('../constants');
const logger = require('../config/logger');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: ROLES.ADMIN });
    
    if (adminExists) {
      logger.info('Admin user already exists, skipping seed');
      return;
    }

    // Create admin user directly without triggering pre-save hooks
    const adminData = {
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@school.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: ROLES.ADMIN,
    };

    await User.create(adminData);
    logger.info(`Default admin user created: ${adminData.email}`);
  } catch (error) {
    // If admin still doesn't exist after error, try direct MongoDB insertion
    try {
      const adminExists = await User.findOne({ role: ROLES.ADMIN });
      if (!adminExists) {
        logger.error(`Error seeding admin via Mongoose: ${error.message}`);
        logger.info('Attempting direct MongoDB insertion...');
        
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('Admin@123456', 12);
        
        await User.collection.insertOne({
          name: process.env.ADMIN_NAME || 'Super Admin',
          email: process.env.ADMIN_EMAIL || 'admin@school.com',
          password: hashedPassword,
          role: ROLES.ADMIN,
          isActive: true,
          avatar: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0,
        });
        
        logger.info('Default admin user created via direct MongoDB insertion');
      }
    } catch (directError) {
      logger.error(`Failed to seed admin user: ${directError.message}`);
    }
  }
};

module.exports = { seedAdmin };
