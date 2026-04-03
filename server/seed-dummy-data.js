const School = require('./src/models/School');
const User = require('./src/models/User');
const Class = require('./src/models/Class');
const Subject = require('./src/models/Subject');
const Student = require('./src/models/Student');
const Teacher = require('./src/models/Teacher');
const FeeStructure = require('./src/models/FeeStructure');
const FeePayment = require('./src/models/FeePayment');
const bcrypt = require('bcryptjs');
const logger = require('./src/config/logger');

const seedDummyData = async () => {
  try {
    logger.info('Starting dummy data seeding...');

    // Create 3 dummy schools
    const schools = [
      {
        name: 'Springfield Academy',
        code: 'SPR001',
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'Illinois',
          country: 'USA',
          postalCode: '62701',
        },
        phone: '+12175551234',
        email: 'info@springfield-academy.edu',
        principalName: 'Dr. Sarah Johnson',
        establishedYear: 1985,
        affiliatedBoard: 'CBSE',
        schoolType: 'private',
        isActive: true,
        academicYear: '2024-2025',
      },
      {
        name: 'Greenfield International School',
        code: 'GRN002',
        address: {
          street: '789 Pine Road',
          city: 'Greenfield',
          state: 'California',
          country: 'USA',
          postalCode: '90210',
        },
        phone: '+13105556789',
        email: 'info@greenfield-school.edu',
        principalName: 'Prof. Michael Chen',
        establishedYear: 2005,
        affiliatedBoard: 'IB',
        schoolType: 'international',
        isActive: true,
        academicYear: '2024-2025',
      },
      {
        name: 'Riverside Public School',
        code: 'RIV003',
        address: {
          street: '123 River Street',
          city: 'Riverside',
          state: 'New York',
          country: 'USA',
          postalCode: '10001',
        },
        phone: '+12125559876',
        email: 'info@riverside-ps.edu',
        principalName: 'Ms. Emily Davis',
        establishedYear: 1975,
        affiliatedBoard: 'State Board',
        schoolType: 'public',
        isActive: true,
        academicYear: '2024-2025',
      },
    ];

    let createdSchools = [];
    for (const schoolData of schools) {
      let school = await School.findOne({ code: schoolData.code });
      if (!school) {
        school = await School.create(schoolData);
        logger.info(`Created school: ${school.name}`);
      } else {
        logger.info(`School already exists: ${school.name}`);
      }
      createdSchools.push(school);
    }

    // Create school admins for each school
    const schoolAdmins = [
      {
        name: 'Springfield Admin',
        email: 'admin@springfield-academy.edu',
        password: 'Admin@123',
        role: 'schooladmin',
        phone: '+12175551234',
      },
      {
        name: 'Greenfield Admin',
        email: 'admin@greenfield-school.edu',
        password: 'Admin@123',
        role: 'schooladmin',
        phone: '+13105556789',
      },
      {
        name: 'Riverside Admin',
        email: 'admin@riverside-ps.edu',
        password: 'Admin@123',
        role: 'schooladmin',
        phone: '+12125559876',
      },
    ];

    for (let i = 0; i < schoolAdmins.length; i++) {
      const adminData = schoolAdmins[i];
      const existingAdmin = await User.findOne({ 
        email: adminData.email, 
        schoolId: createdSchools[i]._id 
      });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        await User.collection.insertOne({
          ...adminData,
          schoolId: createdSchools[i]._id,
          isSuperAdmin: false,
          isActive: true,
          avatar: '',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0,
        });
        logger.info(`Created school admin: ${adminData.email} for ${createdSchools[i].name}`);
      }
    }

    // Create teachers for each school
    const teacherNames = [
      ['John Smith', 'Maria Garcia', 'Robert Brown'],
      ['David Wilson', 'Lisa Anderson', 'James Taylor'],
      ['Patricia Martinez', 'William Thomas', 'Jennifer White'],
    ];

    for (let i = 0; i < createdSchools.length; i++) {
      const school = createdSchools[i];
      
      // Create 2 classes per school
      for (let j = 1; j <= 2; j++) {
        const classData = {
          schoolId: school._id,
          name: `${10 + j}`,
          section: 'A',
          academicYear: '2024-2025',
          maxStrength: 40,
        };
        
        let cls = await Class.findOne({
          schoolId: school._id,
          name: classData.name,
          section: classData.section,
        });
        
        if (!cls) {
          cls = await Class.create(classData);
          logger.info(`Created class: ${cls.name}-${cls.section} for ${school.name}`);
        }
      }
    }

    // Create subjects for each class
    const subjectNames = ['Mathematics', 'Science', 'English', 'History'];
    
    for (const school of createdSchools) {
      const classes = await Class.find({ schoolId: school._id });
      
      for (const cls of classes) {
        for (const subjName of subjectNames) {
          const existingSubj = await Subject.findOne({
            schoolId: school._id,
            code: `${subjName.substring(0, 3).toUpperCase()}_${cls.name}${cls.section}`,
          });
          
          if (!existingSubj) {
            await Subject.create({
              schoolId: school._id,
              name: subjName,
              code: `${subjName.substring(0, 3).toUpperCase()}_${cls.name}${cls.section}`,
              class: cls._id,
              type: 'theory',
            });
          }
        }
      }
    }

    // Create fee structures and payment records for each school
    const feeTypes = [
      { type: 'tuition', amount: 5000, description: 'Monthly tuition fee' },
      { type: 'transport', amount: 2000, description: 'Transportation fee' },
      { type: 'library', amount: 500, description: 'Library fee' },
      { type: 'sports', amount: 300, description: 'Sports and activities fee' },
    ];

    for (const school of createdSchools) {
      const classes = await Class.find({ schoolId: school._id });
      
      for (const cls of classes) {
        for (const feeType of feeTypes) {
          const feeStructure = await FeeStructure.create({
            schoolId: school._id,
            class: cls._id,
            feeType: feeType.type,
            amount: feeType.amount,
            academicYear: '2024-2025',
            description: feeType.description,
            dueDate: new Date('2024-04-15'),
            installmentNumber: 1,
          });

          // Get students in this class
          const students = await Student.find({ class: cls._id, schoolId: school._id });
          
          // Create fee payment records for each student
          for (const student of students) {
            // Randomly assign different payment statuses
            const rand = Math.random();
            let status, amountPaid;
            
            if (rand < 0.3) {
              // 30% fully paid
              status = 'paid';
              amountPaid = feeType.amount;
            } else if (rand < 0.5) {
              // 20% partially paid
              status = 'partial';
              amountPaid = feeType.amount * 0.5;
            } else {
              // 50% pending
              status = 'pending';
              amountPaid = 0;
            }

            await FeePayment.create({
              schoolId: school._id,
              student: student._id,
              feeStructure: feeStructure._id,
              feeType: feeType.type,
              amount: feeType.amount,
              amountPaid,
              academicYear: '2024-2025',
              dueDate: new Date('2024-04-15'),
              status,
              paymentMethod: status === 'paid' ? 'online' : null,
              paymentDate: status === 'paid' ? new Date('2024-04-10') : null,
            });
          }
        }
      }
    }

    logger.info('Dummy data seeding completed successfully!');
    logger.info('\n=== Login Credentials ===');
    logger.info('Super Admin: superadmin@schoolmanagement.com / SuperAdmin@123');
    logger.info('Springfield Admin: admin@springfield-academy.edu / Admin@123');
    logger.info('Greenfield Admin: admin@greenfield-school.edu / Admin@123');
    logger.info('Riverside Admin: admin@riverside-ps.edu / Admin@123');
    logger.info('Demo School Admin: admin@demosschool.com / SchoolAdmin@123');

  } catch (error) {
    logger.error(`Error seeding dummy data: ${error.message}`);
    logger.error(`Stack: ${error.stack}`);
  }
};

// Run if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  dotenv.config();
  
  const MONGO_URI = process.env.MONGODB_URI;
  
  if (!MONGO_URI) {
    console.error('MONGODB_URI not found in environment');
    process.exit(1);
  }
  
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected for seeding');
      return seedDummyData();
    })
    .then(() => {
      console.log('Seeding completed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDummyData };
