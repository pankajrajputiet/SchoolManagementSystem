# School Management System - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Core Features](#core-features)
5. [SMS Notification System](#sms-notification-system)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [Deployment Guide](#deployment-guide)
9. [Development Setup](#development-setup)
10. [Testing](#testing)
11. [Security](#security)
12. [Monitoring & Analytics](#monitoring--analytics)

---

## Project Overview

A comprehensive, production-ready School Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). The system enables educational institutions to manage students, teachers, classes, attendance, marks, assignments, and communicate with parents via SMS notifications.

### Key Capabilities
- **Multi-Role Access**: Admin, Teacher, and Student dashboards with role-based permissions
- **Academic Management**: Classes, subjects, attendance tracking, grade management
- **Communication**: In-app notifications + SMS alerts to parents
- **File Management**: Assignment uploads via Cloudinary
- **Scalable Infrastructure**: Docker, Kubernetes, AWS EKS ready
- **Monitoring**: Prometheus + Grafana integration

---

## Technology Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20.x | Server runtime environment |
| **Framework** | Express.js | 5.2.1 | RESTful API framework |
| **Database** | MongoDB | 7.x | NoSQL database (via MongoDB Atlas) |
| **ODM** | Mongoose | 9.3.3 | MongoDB object modeling |
| **Authentication** | JWT (jsonwebtoken) | 9.0.3 | Token-based authentication |
| **Password Hashing** | bcryptjs | 3.0.3 | Secure password encryption |
| **Validation** | Joi | 18.1.2 | Request body validation |
| **File Upload** | Multer + Cloudinary | 2.1.1 + 1.41.3 | Image/file storage |
| **Security** | Helmet | 8.1.0 | HTTP security headers |
| **CORS** | cors | 2.8.6 | Cross-origin resource sharing |
| **Rate Limiting** | express-rate-limit | 8.3.2 | API rate limiting |
| **Logging** | Winston + Morgan | 3.19.0 + 1.10.1 | Application & HTTP logging |
| **Metrics** | prom-client | 15.1.3 | Prometheus metrics collection |
| **SMS Service** | Twilio | Latest | SMS notifications |
| **Environment** | dotenv | 17.4.0 | Environment variable management |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.2.4 | UI library |
| **Build Tool** | Vite | 8.0.1 | Fast build tool & dev server |
| **State Management** | Redux Toolkit | 2.11.2 | Global state management |
| **Routing** | React Router DOM | 7.13.2 | Client-side routing |
| **UI Components** | Material-UI (MUI) | 7.3.9 | Component library |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| **Forms** | React Hook Form | 7.72.0 | Form handling & validation |
| **Validation** | Yup | 1.7.1 | Schema validation |
| **HTTP Client** | Axios | 1.14.0 | API communication |
| **Charts** | Recharts | 3.8.1 | Data visualization |
| **Notifications** | Notistack | 3.0.2 | Toast notifications |
| **File Upload** | React Dropzone | 15.0.0 | Drag & drop file upload |
| **Date Handling** | DayJS | 1.11.20 | Date formatting |

### DevOps & Infrastructure

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Containerization** | Docker | Application packaging |
| **Orchestration** | Docker Compose | Local development |
| **Container Registry** | Docker Hub | Image storage |
| **Orchestration** | Kubernetes | Production deployment |
| **Cloud Provider** | AWS EKS | Managed Kubernetes |
| **Load Balancer** | AWS ALB | Application load balancing |
| **Database** | MongoDB Atlas | Cloud-hosted MongoDB |
| **File Storage** | Cloudinary | CDN for images/files |
| **Monitoring** | Prometheus | Metrics collection |
| **Dashboards** | Grafana | Visualization & alerts |
| **CI/CD** | GitHub Actions | Automated testing & deployment |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                         │   │
│  │  Redux Store │ React Router │ MUI │ Tailwind │ Axios    │   │
│  └────────────────────────────┬─────────────────────────────┘   │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                │ HTTP/HTTPS (REST API)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express.js Backend API                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │  Routes  │→│Controller│→│ Services │→│  Models  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ Middleware: Auth │ Validation │ Rate Limit │ CORS│   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │ MongoDB   │   │ Cloudinary│   │  Twilio   │
        │  Atlas    │   │   (CDN)   │   │  (SMS)    │
        └───────────┘   └───────────┘   └───────────┘
```

### Backend Architecture (MVC Pattern)

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.js        # MongoDB connection
│   │   ├── cloudinary.js # Cloudinary setup
│   │   ├── logger.js    # Winston logger
│   │   └── prometheus.js # Metrics collection
│   ├── constants/        # Application constants
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Express middlewares
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── validations/     # Joi validation schemas
```

---

## Core Features

### 1. Authentication & Authorization

**Features:**
- JWT-based authentication with access tokens
- Password hashing with bcrypt (salt factor: 12)
- Role-based access control (RBAC)
- Protected routes with middleware
- Token expiration and refresh

**User Roles:**
- **Admin**: Full system access, manage all entities
- **Teacher**: Manage assigned classes, attendance, marks
- **Student**: View personal data, attendance, marks

**API Endpoints:**
- `POST /api/v1/auth/register` - Create user (Admin only)
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/me` - Update profile
- `PUT /api/v1/auth/change-password` - Change password

### 2. Admin Dashboard

**Capabilities:**
- Manage students (CRUD operations)
- Manage teachers (CRUD operations)
- Manage classes and sections
- Assign teachers to classes
- View reports and analytics
- Send SMS notifications
- System-wide notifications

**API Endpoints:**
- Students: `/api/v1/students`
- Teachers: `/api/v1/teachers`
- Classes: `/api/v1/classes`
- Subjects: `/api/v1/subjects`
- Reports: `/api/v1/reports`

### 3. Teacher Dashboard

**Capabilities:**
- View assigned classes
- Mark student attendance (bulk)
- Upload marks/grades
- Create and manage assignments
- Send SMS to class parents
- View student performance

**API Endpoints:**
- My Classes: `GET /api/v1/teachers/my-classes`
- Class Students: `GET /api/v1/teachers/classes/:id/students`
- Mark Attendance: `POST /api/v1/attendance/mark-bulk/:classId`
- Upload Marks: `POST /api/v1/marks/upload-bulk`
- Create Assignment: `POST /api/v1/assignments`

### 4. Student Dashboard

**Capabilities:**
- View personal profile
- Check attendance history
- View marks and grades
- View and download assignments
- Receive notifications

**API Endpoints:**
- Profile: `GET /api/v1/students/me`
- Attendance: `GET /api/v1/attendance/student/:studentId`
- Marks: `GET /api/v1/marks/student/:studentId`
- Assignments: `GET /api/v1/assignments/student/:studentId`

### 5. Attendance Management

**Features:**
- Bulk attendance marking by teachers
- Date-based attendance tracking
- Status types: Present, Absent, Late, Excused
- View attendance history
- Auto SMS for absent students

**Status Types:**
```javascript
{
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
}
```

### 6. Marks & Grades

**Features:**
- Upload marks for entire class
- Multiple exam types
- Auto grade calculation
- View marks by subject/exam
- Performance tracking

**Exam Types:**
- Unit Test
- Midterm
- Final
- Assignment
- Quiz

**Grade Calculation:**
```
A+: ≥90%
A:  80-89%
B+: 70-79%
B:  60-69%
C:  50-59%
D:  40-49%
F:  <40%
```

### 7. Assignment Management

**Features:**
- Create assignments with due dates
- File attachments via Cloudinary
- Track submissions
- View assignments by class/subject

### 8. Notifications System

**In-App Notifications:**
- Real-time notifications
- Read/unread status
- Targeted by role or user
- Expiration dates

---

## SMS Notification System

### Overview

The SMS notification system enables schools to communicate important information to parents via text messages. Integrated with Twilio, it supports automated and manual SMS sending for various scenarios.

### Use Cases

1. **Fee Reminders**: Alert parents about pending or due fees
2. **Vacation Notices**: Inform about school holidays and closures
3. **Exam Schedules**: Notify about upcoming exams and timetables
4. **Absence Alerts**: Automatically notify when student is absent
5. **Emergency Alerts**: Send urgent messages (e.g., weather closures)
6. **Custom Messages**: Send any custom message to selected parents

### SMS Categories & Templates

#### 1. Fee Reminder
**Template:**
```
Dear {parentName}, this is a reminder that the school fees for {studentName} 
(Class: {className}) is due. Amount: ₹{amount}. Please pay by {dueDate}. 
- {schoolName}
```

**Required Fields:**
- `parentName`: Parent's name
- `studentName`: Student's name
- `className`: Class and section (e.g., "10-A")
- `amount`: Fee amount
- `dueDate`: Payment due date
- `schoolName`: School name

#### 2. Vacation Notice
**Template:**
```
Dear {parentName}, this is to inform you that school will remain closed from 
{startDate} to {endDate} on account of {reason}. School will resume on 
{reopeningDate}. - {schoolName}
```

**Required Fields:**
- `parentName`: Parent's name
- `startDate`: Vacation start date
- `endDate`: Vacation end date
- `reopeningDate`: School reopening date
- `reason`: Reason for vacation
- `schoolName`: School name

#### 3. Exam Schedule
**Template:**
```
Dear {parentName}, the {examType} for {studentName} (Class: {className}) will 
be held from {startDate} to {endDate}. Please ensure regular study. Timetable 
shared in school portal. - {schoolName}
```

**Required Fields:**
- `parentName`: Parent's name
- `studentName`: Student's name
- `className`: Class and section
- `examType`: Type of exam (Unit Test, Midterm, Final)
- `startDate`: Exam start date
- `endDate`: Exam end date
- `schoolName`: School name

#### 4. Absence Alert
**Template:**
```
Dear {parentName}, we noticed that {studentName} (Class: {className}) has been 
absent for {absentDays} days. Please contact the school or ensure regular 
attendance. - {schoolName}
```

**Required Fields:**
- `parentName`: Parent's name
- `studentName`: Student's name
- `className`: Class and section
- `absentDays`: Number of absent days
- `schoolName`: School name

#### 5. Emergency Alert
**Template:**
```
URGENT - Dear {parentName}, {message}. For queries, call {schoolPhone}. 
- {schoolName}
```

**Required Fields:**
- `parentName`: Parent's name
- `message`: Emergency message
- `schoolPhone`: School contact number
- `schoolName`: School name

#### 6. Custom Message
Send any custom message without template restrictions.

### SMS API Endpoints

#### Send SMS
```bash
POST /api/v1/sms/send

Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body (Fee Reminder Example):
{
  "category": "fees",
  "targetClass": "69cf8a7b1c9d440000000001",
  "metadata": {
    "parentName": "Mr. Patel",
    "studentName": "Aarav Patel",
    "className": "10-A",
    "amount": "5000",
    "dueDate": "2025-04-15",
    "schoolName": "Springfield High School"
  }
}

Response:
{
  "success": true,
  "message": "SMS notification queued",
  "data": {
    "id": "sms_id_here",
    "totalRecipients": 35,
    "status": "sent"
  }
}
```

#### Send to Specific Students
```json
{
  "category": "absence",
  "studentIds": ["student_id_1", "student_id_2"],
  "metadata": {
    "parentName": "Mr. Patel",
    "studentName": "Aarav Patel",
    "className": "10-A",
    "absentDays": "3",
    "schoolName": "Springfield High School"
  }
}
```

#### Get SMS History
```bash
GET /api/v1/sms/history?page=1&limit=20&category=fees&status=sent
```

#### Get SMS Statistics
```bash
GET /api/v1/sms/stats
```

#### Get Templates
```bash
GET /api/v1/sms/templates
```

### SMS Delivery Tracking

Each SMS campaign tracks:
- Total recipients
- Successfully sent count
- Failed count
- Delivery reports with Twilio message IDs
- Error codes for failed messages

### Setting Up Twilio

1. **Sign up for Twilio**: https://www.twilio.com
2. **Get Credentials**:
   - Account SID: From Twilio Console
   - Auth Token: From Twilio Console
   - Phone Number: Buy a Twilio number
3. **Add to .env**:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
SCHOOL_NAME=Your School Name
SCHOOL_PHONE=+919876543210
```

### Pricing (Twilio)

- **India**: ~₹0.40-0.80 per SMS
- **USA**: ~$0.0079 per SMS
- **Free Trial**: Available with Twilio test credentials

---

## Database Schema

### Collections

#### 1. Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed),
  role: 'admin' | 'teacher' | 'student',
  phone: String,
  avatar: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Students
```javascript
{
  _id: ObjectId,
  user: ObjectId → User,
  rollNumber: String,
  class: ObjectId → Class,
  admissionNumber: String (unique),
  dateOfBirth: Date,
  gender: 'male' | 'female' | 'other',
  address: String,
  parentName: String,
  parentPhone: String,
  bloodGroup: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Teachers
```javascript
{
  _id: ObjectId,
  user: ObjectId → User,
  employeeId: String (unique),
  subjects: [ObjectId → Subject],
  classes: [ObjectId → Class],
  qualification: String,
  experience: Number,
  dateOfJoining: Date,
  salary: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Classes
```javascript
{
  _id: ObjectId,
  name: String,
  section: String,
  academicYear: String,
  classTeacher: ObjectId → Teacher,
  roomNumber: String,
  capacity: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. Subjects
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique, uppercase),
  class: ObjectId → Class,
  teacher: ObjectId → Teacher,
  type: 'theory' | 'practical' | 'elective',
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. Attendance
```javascript
{
  _id: ObjectId,
  student: ObjectId → Student,
  class: ObjectId → Class,
  date: Date,
  status: 'present' | 'absent' | 'late' | 'excused',
  remarks: String,
  markedBy: ObjectId → User,
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. Marks
```javascript
{
  _id: ObjectId,
  student: ObjectId → Student,
  subject: ObjectId → Subject,
  class: ObjectId → Class,
  examType: 'unit-test' | 'midterm' | 'final' | 'assignment' | 'quiz',
  marksObtained: Number,
  totalMarks: Number,
  grade: String (auto-calculated),
  remarks: String,
  academicYear: String,
  enteredBy: ObjectId → User,
  createdAt: Date,
  updatedAt: Date
}
```

#### 8. Assignments
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  subject: ObjectId → Subject,
  class: ObjectId → Class,
  assignedBy: ObjectId → User,
  dueDate: Date,
  totalMarks: Number,
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 9. Notifications
```javascript
{
  _id: ObjectId,
  title: String,
  message: String,
  type: 'general' | 'academic' | 'event' | 'emergency',
  targetRole: 'all' | 'admin' | 'teacher' | 'student',
  targetUsers: [ObjectId → User],
  createdBy: ObjectId → User,
  readBy: [ObjectId → User],
  isActive: Boolean,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 10. SMS Notifications
```javascript
{
  _id: ObjectId,
  message: String,
  category: 'fees' | 'vacation' | 'exam' | 'absence' | 'emergency' | 'custom',
  recipients: [{
    student: ObjectId → Student,
    parentPhone: String,
    studentName: String,
    parentName: String
  }],
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'partial',
  scheduledAt: Date,
  sentAt: Date,
  totalRecipients: Number,
  successfullySent: Number,
  failed: Number,
  deliveryReports: [{
    recipient: ObjectId,
    phone: String,
    status: 'delivered' | 'failed',
    messageId: String,
    errorCode: String,
    errorMessage: String,
    timestamp: Date
  }],
  sentBy: ObjectId → User,
  targetClass: ObjectId → Class,
  metadata: Map,
  createAppNotification: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "statusCode": 200
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error message",
  "stack": "Stack trace (development only)"
}
```

### Pagination
```
GET /api/v1/resource?page=1&limit=10&search=keyword
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Complete API Endpoints

#### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Admin | Create new user |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/logout` | Auth | Logout |
| GET | `/auth/me` | Auth | Get profile |
| PUT | `/auth/me` | Auth | Update profile |
| PUT | `/auth/change-password` | Auth | Change password |

#### Students
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/students` | Admin, Teacher | List students |
| GET | `/students/:id` | Admin, Teacher | Get student |
| POST | `/students` | Admin | Create student |
| PUT | `/students/:id` | Admin | Update student |
| DELETE | `/students/:id` | Admin | Delete student |

#### Teachers
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/teachers` | Admin | List teachers |
| GET | `/teachers/:id` | Admin | Get teacher |
| POST | `/teachers` | Admin | Create teacher |
| PUT | `/teachers/:id` | Admin | Update teacher |
| DELETE | `/teachers/:id` | Admin | Delete teacher |
| GET | `/teachers/my-classes` | Teacher | Get my classes |

#### Classes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/classes` | All | List classes |
| GET | `/classes/:id` | All | Get class |
| POST | `/classes` | Admin | Create class |
| PUT | `/classes/:id` | Admin | Update class |
| DELETE | `/classes/:id` | Admin | Delete class |

#### Attendance
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance/mark-bulk/:classId` | Teacher | Mark attendance |
| GET | `/attendance/class/:classId` | Teacher | View class attendance |
| GET | `/attendance/student/:studentId` | All | View student attendance |

#### Marks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/marks/upload-bulk` | Teacher | Upload marks |
| GET | `/marks/class/:classId` | Teacher | View class marks |
| GET | `/marks/student/:studentId` | All | View student marks |

#### SMS Notifications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/sms/send` | Admin, Teacher | Send SMS |
| GET | `/sms/history` | Admin | SMS history |
| GET | `/sms/stats` | Admin | SMS statistics |
| GET | `/sms/templates` | Auth | Get templates |
| GET | `/sms/:id` | Admin | SMS details |
| GET | `/sms/status` | Auth | Service status |

---

## Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Quick Deploy

1. **Docker Compose (Local)**:
```bash
cd deploy
docker compose up --build
```

2. **Kubernetes (Production)**:
```bash
kubectl apply -f deploy/kubernetes/
```

3. **AWS EKS**:
```bash
eksctl create cluster --name school-mgmt --region us-east-1
kubectl apply -f deploy/kubernetes/
```

---

## Development Setup

### Prerequisites
- Node.js 20.x or higher
- MongoDB Atlas account (or local MongoDB 7.x)
- npm or yarn
- Docker (optional, for containerized development)

### Setup Steps

1. **Clone Repository**:
```bash
git clone https://github.com/your-username/SchoolManagementSystem.git
cd SchoolManagementSystem
```

2. **Install Backend Dependencies**:
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**:
```bash
cd ../client
npm install
```

4. **Configure Environment**:
```bash
# Copy .env.example to server/.env
cp .env.example server/.env

# Edit server/.env with your credentials
```

5. **Start Backend**:
```bash
cd server
npm run dev
```

6. **Start Frontend**:
```bash
cd client
npm run dev
```

7. **Seed Database** (Optional):
```bash
cd server
npm run seed
```

### Available Scripts

**Backend**:
```bash
npm start        # Production
npm run dev      # Development with nodemon
npm run seed     # Seed admin user
```

**Frontend**:
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview build
```

---

## Testing

### Manual Testing

1. **Health Check**:
```bash
curl http://localhost:5000/api/health
```

2. **Metrics Endpoint**:
```bash
curl http://localhost:5000/metrics
```

3. **Login**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"Admin@123456"}'
```

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | Admin@123456 |
| Teacher | rajesh@school.com | Teacher@123 |
| Student | aarav@student.com | Student@123 |

---

## Security

### Implemented Security Measures

1. **Authentication**:
   - JWT with expiration
   - Password hashing (bcrypt, salt: 12)
   - Protected routes with middleware

2. **Authorization**:
   - Role-based access control (RBAC)
   - Route-level permission checks

3. **Data Protection**:
   - Helmet for HTTP security headers
   - CORS configuration
   - Input validation with Joi
   - SQL injection prevention (NoSQL)

4. **Rate Limiting**:
   - API-wide rate limiter
   - Stricter auth endpoint limits

5. **Best Practices**:
   - Non-root Docker containers
   - Environment variable secrets
   - HTTPS in production
   - Secure cookie storage (future enhancement)

### Security Checklist

- [x] Password hashing
- [x] JWT authentication
- [x] Input validation
- [x] Rate limiting
- [x] CORS configuration
- [x] Helmet headers
- [x] Environment variables
- [x] Non-root containers
- [ ] HttpOnly cookies (future)
- [ ] CSRF protection (if using cookies)
- [ ] 2FA (future enhancement)

---

## Monitoring & Analytics

### Prometheus Metrics

Available at `/metrics`:
- HTTP request rate
- Request duration (p50, p95, p99)
- Error rates
- Process memory & CPU
- Active connections

### Grafana Dashboard

Pre-configured panels:
1. HTTP Request Rate
2. Total Requests (5m)
3. Error Rate
4. Application Uptime
5. Request Duration (p50/p95/p99)
6. Memory Usage
7. CPU Usage
8. Active Handles
9. Requests by Status Code
10. Error Types

### Access Monitoring

```bash
# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Grafana
kubectl port-forward svc/grafana 3000:3000 -n monitoring
# Login: admin / admin123
```

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**:
```bash
# Kill process on port 3000
taskkill //PID <PID> //F

# Kill process on port 5000
taskkill //PID <PID> //F
```

**2. MongoDB Connection Failed**:
- Check MongoDB Atlas IP whitelist
- Verify connection string in `.env`
- Check network access settings

**3. SMS Not Sending**:
- Verify Twilio credentials
- Check phone number format (E.164)
- Review Twilio account balance
- Check logs for error messages

**4. Login Fails**:
- Check rate limiting (100 attempts/15min)
- Verify JWT_SECRET in `.env`
- Check password hashing

**5. Docker Build Fails**:
- Ensure Docker daemon is running
- Check Dockerfile paths
- Verify .dockerignore files

---

## Future Enhancements

### Planned Features
- [ ] Online fee payment integration
- [ ] Parent portal
- [ ] Timetable management
- [ ] Library management
- [ ] Transport management
- [ ] Hostel management
- [ ] Examination scheduling
- [ ] Certificate generation
- [ ] Alumni management
- [ ] Mobile app (React Native)
- [ ] Video conferencing integration
- [ ] Biometric attendance
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Advanced analytics & reports
- [ ] Multi-language support
- [ ] Two-factor authentication
- [ ] Audit logging
- [ ] Backup & restore

---

## Support & Contribution

### Getting Help
- Review this documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment
- Check error logs: `server/logs/` or Docker logs
- Open an issue on GitHub

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## License

This project is proprietary. All rights reserved.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-04-03 | Initial release with core features |
| | | - Authentication & RBAC |
| | | - Student & Teacher management |
| | | - Attendance & Marks |
| | | - SMS Notification system |
| | | - Docker & Kubernetes support |

---

**Last Updated**: April 3, 2025  
**Maintained By**: Development Team
