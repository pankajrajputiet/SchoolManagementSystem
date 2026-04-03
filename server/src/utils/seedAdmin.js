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

    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@school.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: ROLES.ADMIN,
    });

    logger.info('Default admin user created successfully');
  } catch (error) {
    logger.error(`Error seeding admin: ${error.message}`);
  }
};

module.exports = { seedAdmin };
