const User = require('../models/User');
const School = require('../models/School');
const { ROLES } = require('../constants');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

const seedAdmin = async () => {
  try {
    // Check if super admin exists
    const superAdminExists = await User.findOne({ role: ROLES.SUPER_ADMIN });
    
    if (superAdminExists) {
      logger.info('Super Admin user already exists, skipping seed');
      return;
    }

    // Create default school
    let school = await School.findOne({ code: 'DEMO' });
    
    if (!school) {
      school = await School.create({
        name: process.env.SCHOOL_NAME || 'Demo School',
        code: 'DEMO',
        address: {
          street: '123 Education Street',
          city: 'Learning City',
          state: 'Knowledge State',
          country: 'India',
          postalCode: '110001',
        },
        phone: process.env.SCHOOL_PHONE || '+919876543210',
        email: 'info@demosschool.com',
        adminContact: {
          name: 'School Admin',
          phone: process.env.SCHOOL_PHONE || '+919876543210',
          email: 'admin@demosschool.com',
        },
        principalName: 'Dr. Principal',
        establishedYear: 2000,
        affiliatedBoard: 'CBSE',
        schoolType: 'private',
        isActive: true,
        academicYear: '2024-2025',
        settings: {
          smsEnabled: false,
          emailEnabled: true,
          autoAttendance: false,
          gradingScale: 'percentage',
        },
      });
      logger.info(`Default school created: ${school.name} (Code: ${school.code})`);
    }

    // Create Super Admin (not tied to any school)
    const superAdminData = {
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@schoolmanagement.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: ROLES.SUPER_ADMIN,
      isSuperAdmin: true,
      schoolId: null,
      phone: '+919999999999',
      isActive: true,
    };

    let superAdmin = await User.findOne({ email: superAdminData.email });
    
    if (!superAdmin) {
      // Hash password manually to avoid double-hashing from pre-save hook
      const hashedPassword = await bcrypt.hash(superAdminData.password, 12);
      
      await User.collection.insertOne({
        ...superAdminData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });
      
      logger.info(`Super Admin created: ${superAdminData.email}`);
    }

    // Create School Admin for default school
    const schoolAdminData = {
      name: process.env.SCHOOL_ADMIN_NAME || 'School Admin',
      email: process.env.SCHOOL_ADMIN_EMAIL || 'admin@demosschool.com',
      password: process.env.SCHOOL_ADMIN_PASSWORD || 'SchoolAdmin@123',
      role: ROLES.SCHOOL_ADMIN,
      schoolId: school._id,
      isSuperAdmin: false,
      phone: process.env.SCHOOL_PHONE || '+919876543210',
      isActive: true,
    };

    let schoolAdmin = await User.findOne({ email: schoolAdminData.email, schoolId: school._id });
    
    if (!schoolAdmin) {
      const hashedPassword = await bcrypt.hash(schoolAdminData.password, 12);
      
      await User.collection.insertOne({
        ...schoolAdminData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });
      
      logger.info(`School Admin created for ${school.name}: ${schoolAdminData.email}`);
    }

    logger.info('Seeding completed successfully');
  } catch (error) {
    logger.error(`Error seeding admin users: ${error.message}`);
    logger.error(`Stack: ${error.stack}`);
  }
};

module.exports = { seedAdmin };
