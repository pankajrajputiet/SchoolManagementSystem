require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, ATTENDANCE_STATUS, EXAM_TYPES, SECTIONS, GENDERS } = require('./src/constants');

// Import models
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Teacher = require('./src/models/Teacher');
const Class = require('./src/models/Class');
const Subject = require('./src/models/Subject');
const Attendance = require('./src/models/Attendance');
const Mark = require('./src/models/Mark');
const Assignment = require('./src/models/Assignment');
const Notification = require('./src/models/Notification');

// Sample data
const TEACHERS = [
  { name: 'Rajesh Kumar', email: 'rajesh@school.com', employeeId: 'EMP001', qualification: 'M.Sc Mathematics', experience: 8 },
  { name: 'Priya Sharma', email: 'priya@school.com', employeeId: 'EMP002', qualification: 'M.A English', experience: 6 },
  { name: 'Amit Patel', email: 'amit@school.com', employeeId: 'EMP003', qualification: 'M.Sc Physics', experience: 10 },
  { name: 'Sneha Reddy', email: 'sneha@school.com', employeeId: 'EMP004', qualification: 'M.Sc Chemistry', experience: 5 },
  { name: 'Vikram Singh', email: 'vikram@school.com', employeeId: 'EMP005', qualification: 'M.A History', experience: 7 },
];

const STUDENTS = [
  { name: 'Aarav Patel', email: 'aarav@student.com', rollNo: 'S001', class: '10-A' },
  { name: 'Diya Sharma', email: 'diya@student.com', rollNo: 'S002', class: '10-A' },
  { name: 'Rohan Kumar', email: 'rohan@student.com', rollNo: 'S003', class: '10-A' },
  { name: 'Ananya Singh', email: 'ananya@student.com', rollNo: 'S004', class: '10-A' },
  { name: 'Karthik Reddy', email: 'karthik@student.com', rollNo: 'S005', class: '10-A' },
  { name: 'Meera Iyer', email: 'meera@student.com', rollNo: 'S006', class: '10-B' },
  { name: 'Arjun Nair', email: 'arjun@student.com', rollNo: 'S007', class: '10-B' },
  { name: 'Sara Thomas', email: 'sara@student.com', rollNo: 'S008', class: '10-B' },
  { name: 'Vivaan Gupta', email: 'vivaan@student.com', rollNo: 'S009', class: '9-A' },
  { name: 'Ishika Joshi', email: 'ishika@student.com', rollNo: 'S010', class: '9-A' },
];

const SUBJECTS = [
  { name: 'Mathematics', code: 'MATH101', grade: '10' },
  { name: 'English', code: 'ENG101', grade: '10' },
  { name: 'Physics', code: 'PHY101', grade: '10' },
  { name: 'Chemistry', code: 'CHEM101', grade: '10' },
  { name: 'History', code: 'HIST101', grade: '10' },
  { name: 'Mathematics', code: 'MATH091', grade: '9' },
  { name: 'English', code: 'ENG091', grade: '9' },
  { name: 'Science', code: 'SCI091', grade: '9' },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  console.log('\n🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ role: { $in: [ROLES.TEACHER, ROLES.STUDENT] } });
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await Mark.deleteMany({});
    await Assignment.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Get admin user
    const adminUser = await User.findOne({ role: ROLES.ADMIN });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please run seedAdmin first.');
      process.exit(1);
    }

    // Create Classes
    console.log('📚 Creating classes...');
    const classes = [];
    const grades = ['9', '10', '11', '12'];
    for (const grade of grades) {
      for (const section of SECTIONS) {
        const classDoc = await Class.create({
          name: grade,
          section: section,
          academicYear: '2025-2026',
          classTeacher: null,
          roomNumber: `${grade}${section}`,
          capacity: 40,
        });
        classes.push(classDoc);
      }
    }
    console.log(`✅ Created ${classes.length} classes\n`);

    // Create Subjects
    console.log('📖 Creating subjects...');
    const subjects = [];
    const grade10Classes = classes.filter(c => c.name === '10');
    const grade9Classes = classes.filter(c => c.name === '9');
    
    // Grade 10 subjects
    const grade10Subjects = [
      { name: 'Mathematics', code: 'MATH101' },
      { name: 'English', code: 'ENG101' },
      { name: 'Physics', code: 'PHY101' },
      { name: 'Chemistry', code: 'CHEM101' },
      { name: 'History', code: 'HIST101' },
    ];
    
    // Grade 9 subjects
    const grade9Subjects = [
      { name: 'Mathematics', code: 'MATH091' },
      { name: 'English', code: 'ENG091' },
      { name: 'Science', code: 'SCI091' },
    ];
    
    for (const subj of grade10Subjects) {
      const subject = await Subject.create({
        name: subj.name,
        code: subj.code,
        class: grade10Classes[0]._id,
        type: SUBJECT_TYPES.THEORY,
      });
      subjects.push(subject);
    }
    
    for (const subj of grade9Subjects) {
      const subject = await Subject.create({
        name: subj.name,
        code: subj.code,
        class: grade9Classes[0]._id,
        type: SUBJECT_TYPES.THEORY,
      });
      subjects.push(subject);
    }
    console.log(`✅ Created ${subjects.length} subjects\n`);

    // Create Teachers
    console.log('👨‍🏫 Creating teachers...');
    const teacherDocs = [];
    const hashedPassword = await bcrypt.hash('Teacher@123', 12);

    for (let i = 0; i < TEACHERS.length; i++) {
      const teacherData = TEACHERS[i];
      
      const user = await User.create({
        name: teacherData.name,
        email: teacherData.email,
        password: hashedPassword,
        role: ROLES.TEACHER,
        phone: `98765432${(i + 10).toString().padStart(2, '0')}`,
      });

      const assignedClasses = classes.filter((_, idx) => idx % 4 === i).slice(0, 2);
      const assignedSubjects = subjects.filter((_, idx) => idx % 3 === i).slice(0, 2);

      const teacher = await Teacher.create({
        user: user._id,
        employeeId: teacherData.employeeId,
        qualification: teacherData.qualification,
        experience: teacherData.experience,
        subjects: assignedSubjects.map(s => s._id),
        classes: assignedClasses.map(c => c._id),
        dateOfJoining: new Date(2020 + (i % 5), i % 12, 15),
        salary: 50000 + (i * 5000),
      });

      teacherDocs.push(teacher);
      console.log(`   ✓ Created teacher: ${teacherData.name}`);
    }
    console.log(`✅ Created ${teacherDocs.length} teachers\n`);

    // Update class teachers
    for (let i = 0; i < teacherDocs.length && i < classes.length; i++) {
      if (i % 2 === 0) {
        await Class.findByIdAndUpdate(classes[i]._id, {
          classTeacher: teacherDocs[i]._id,
        });
      }
    }

    // Create Students
    console.log('👨‍🎓 Creating students...');
    const studentDocs = [];
    const studentPassword = await bcrypt.hash('Student@123', 12);
    const classMap = {
      '10-A': classes.find(c => c.name === '10' && c.section === 'A'),
      '10-B': classes.find(c => c.name === '10' && c.section === 'B'),
      '9-A': classes.find(c => c.name === '9' && c.section === 'A'),
    };

    for (let i = 0; i < STUDENTS.length; i++) {
      const studentData = STUDENTS[i];
      
      const user = await User.create({
        name: studentData.name,
        email: studentData.email,
        password: studentPassword,
        role: ROLES.STUDENT,
        phone: `98765433${(i + 10).toString().padStart(2, '0')}`,
      });

      const studentClass = classMap[studentData.class];
      
      const student = await Student.create({
        user: user._id,
        rollNumber: studentData.rollNo,
        class: studentClass ? studentClass._id : classes[0]._id,
        admissionNumber: `ADM${new Date().getFullYear()}${(i + 1).toString().padStart(3, '0')}`,
        dateOfBirth: new Date(2008 + (i % 3), (i % 12), 10 + (i % 20)),
        gender: GENDERS[i % 3],
        address: `${i + 1} Main Street, City ${i + 1}`,
        parentName: `Parent of ${studentData.name}`,
        parentPhone: `98765444${(i + 10).toString().padStart(2, '0')}`,
        bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
      });

      studentDocs.push(student);
      console.log(`   ✓ Created student: ${studentData.name} - Class: ${studentData.class}`);
    }
    console.log(`✅ Created ${studentDocs.length} students\n`);

    // Create Attendance
    console.log('📋 Creating attendance records...');
    const today = new Date();
    const attendanceRecords = [];
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      
      if (date.getDay() === 0) continue; // Skip Sundays
      
      for (const student of studentDocs) {
        const isPresent = Math.random() > 0.15; // 85% attendance rate
        
        const attendance = await Attendance.create({
          student: student._id,
          class: student.class,
          date: date,
          status: isPresent ? ATTENDANCE_STATUS.PRESENT : ATTENDANCE_STATUS.ABSENT,
          remarks: isPresent ? null : 'Absent without notice',
          markedBy: adminUser._id,
        });
        
        attendanceRecords.push(attendance);
      }
    }
    console.log(`✅ Created ${attendanceRecords.length} attendance records\n`);

    // Create Marks
    console.log('📊 Creating marks/grades...');
    const markRecords = [];
    
    for (const student of studentDocs) {
      const studentClass = await Class.findById(student.class);
      if (!studentClass) continue;
      
      // Get first 3 subjects for simplicity
      const studentSubjects = subjects.slice(0, 3);
      
      for (const subject of studentSubjects) {
        const examTypes = [EXAM_TYPES.UNIT_TEST, EXAM_TYPES.MIDTERM, EXAM_TYPES.FINAL];
        
        for (const examType of examTypes) {
          const totalMarks = examType === EXAM_TYPES.FINAL ? 100 : 50;
          const marksObtained = Math.floor(Math.random() * (totalMarks - 20)) + 20;
          
          const mark = await Mark.create({
            student: student._id,
            subject: subject._id,
            class: studentClass._id,
            examType: examType,
            marksObtained: marksObtained,
            totalMarks: totalMarks,
            academicYear: '2025-2026',
            enteredBy: teacherDocs[0]._id,
          });
          
          markRecords.push(mark);
        }
      }
    }
    console.log(`✅ Created ${markRecords.length} mark records\n`);

    // Create Assignments
    console.log('📝 Creating assignments...');
    const assignments = [];
    
    for (const subject of subjects.slice(0, 5)) {
      for (let i = 0; i < 2; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (i + 1) * 7);
        
        const assignment = await Assignment.create({
          title: `${subject.name} - Assignment ${i + 1}`,
          description: `Complete the exercises from Chapter ${i + 1} of ${subject.name} textbook.`,
          subject: subject._id,
          class: classes[i]._id,
          assignedBy: teacherDocs[i % teacherDocs.length]._id,
          dueDate: dueDate,
          totalMarks: 20,
          attachments: [],
        });
        
        assignments.push(assignment);
      }
    }
    console.log(`✅ Created ${assignments.length} assignments\n`);

    // Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = [];
    
    const notificationData = [
      { title: 'Welcome to School Management System', message: 'This is your new school management system. Explore the features!', type: 'general' },
      { title: 'Parent-Teacher Meeting', message: 'Scheduled for next week. Please confirm your availability.', type: 'event' },
      { title: 'Exam Schedule Released', message: 'Final exam schedule has been uploaded. Please check the timetable.', type: 'academic' },
      { title: 'Holiday Notice', message: 'School will remain closed on account of national holiday.', type: 'general' },
      { title: 'Sports Day Event', message: 'Annual sports day will be held on 15th April. All students must participate.', type: 'event' },
    ];

    for (const notif of notificationData) {
      const notification = await Notification.create({
        title: notif.title,
        message: notif.message,
        type: notif.type,
        sentBy: adminUser._id,
        targetRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT],
      });
      
      notifications.push(notification);
    }
    console.log(`✅ Created ${notifications.length} notifications\n`);

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('📊 Seeding Summary');
    console.log('═══════════════════════════════════════════');
    console.log(`Classes:       ${(await Class.countDocuments()).toString().padStart(5, ' ')}`);
    console.log(`Subjects:      ${(await Subject.countDocuments()).toString().padStart(5, ' ')}`);
    console.log(`Teachers:      ${(await Teacher.countDocuments()).toString().padStart(5, ' ')}`);
    console.log(`Students:      ${(await Student.countDocuments()).toString().padStart(5, ' ')}`);
    console.log(`Attendance:    ${(await Attendance.countDocuments()).toString().padStart(5, ' ')}`);
    console.log(`Marks:         ${(await Mark.countDocuments()).toString().padStart(5, ' ')}`);
    console.log(`Assignments:   ${(await Assignment.countDocuments()).toString().padStart(5, ' ')}`);
    console.log(`Notifications: ${(await Notification.countDocuments()).toString().padStart(5, ' ')}`);
    console.log('═══════════════════════════════════════════\n');

    console.log('🔑 Test Credentials:');
    console.log('═══════════════════════════════════════════');
    console.log('Admin:');
    console.log('   Email: admin@school.com');
    console.log('   Password: Admin@123456\n');
    console.log('Teacher (any teacher):');
    console.log('   Email: rajesh@school.com (or priya@school.com, etc.)');
    console.log('   Password: Teacher@123\n');
    console.log('Student (any student):');
    console.log('   Email: aarav@student.com (or diya@student.com, etc.)');
    console.log('   Password: Student@123\n');
    console.log('✅ Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedData();
