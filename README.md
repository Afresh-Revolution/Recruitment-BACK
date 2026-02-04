# Job Portal Backend

A secure, multi-company job portal backend built with Node.js, Express, and MongoDB. This backend serves exactly two fixed companies (`company_a` and `company_b`) using a single server and database, with strict data isolation enforced through JWT-based company scoping.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
- [Security & Data Isolation](#security--data-isolation)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)

## 🎯 Project Overview

This is a **backend-only** Node.js application that provides a job portal API for two companies. The system demonstrates real-world SaaS architecture patterns where multiple organizations share infrastructure while maintaining strict data isolation.

### Key Features

- **Single Backend, Two Companies**: One server and one database serving `company_a` and `company_b`
- **JWT-Based Authentication**: Secure token-based authentication with embedded company context
- **Strict Data Isolation**: All queries are automatically scoped to the user's company from JWT
- **Role-Based Access Control**: Separate permissions for employers and applicants
- **No Frontend Code**: Pure backend API with no UI logic

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (External)                  │
│  • User selects company (company_a or company_b)       │
│  • Sends company during registration/login             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (This Project)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Authentication Layer                            │  │
│  │  • Validates company selection                   │  │
│  │  • Embeds company in JWT token                   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                │  │
│  │  • JWT verification                              │  │
│  │  • Company extraction from JWT                   │  │
│  │  • Role-based authorization                     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                            │  │
│  │  • All queries scoped by company from JWT        │  │
│  │  • Never trusts frontend company data            │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB Database (Single)                   │
│  • Users (scoped by company)                           │
│  • Jobs (scoped by company)                            │
│  • Applications (scoped by company)                    │
└─────────────────────────────────────────────────────────┘
```

## 🔑 Core Concepts

### Company Selection Flow

1. **Frontend Selection**: When a user arrives on the frontend, they select either `company_a` or `company_b`
2. **Initial Request**: The selected company is sent to the backend **only during registration or login**
3. **JWT Embedding**: The backend validates the company and embeds it into the JWT token payload
4. **Subsequent Requests**: From that point forward, the backend **never accepts company data from the frontend**. All company context is read exclusively from the JWT token

### Data Isolation Model

Even though all data lives in a single MongoDB database, strict logical separation is enforced:

- **Users** belong to exactly one company (`company_a` or `company_b`)
- **Jobs** belong to exactly one company
- **Applications** belong to exactly one company and must match the job's company

**Isolation Enforcement**:
- Every database query includes a company filter derived from the JWT
- Users can only see jobs from their company
- Employers can only create jobs for their company
- Applicants can only apply to jobs within their company
- Cross-company access is impossible due to server-side enforcement

### Why This Design?

This architecture mirrors how real SaaS platforms (like Slack, Notion, or GitHub) handle multiple organizations:

- **Cost Efficiency**: One infrastructure serves multiple tenants
- **Maintenance Simplicity**: Single codebase and database to maintain
- **Security**: Server-side enforcement prevents data leakage
- **Scalability**: Can be extended to support more companies if needed

## 🔒 Security & Data Isolation

### Authentication Flow

```
1. User registers/logs in with company selection
   ↓
2. Backend validates company is valid (company_a or company_b)
   ↓
3. Backend creates JWT with: { userId, role, company }
   ↓
4. Frontend stores JWT and includes in Authorization header
   ↓
5. Backend middleware extracts company from JWT (never from request body)
   ↓
6. All database queries filtered by company from JWT
```

### Security Principles

1. **Never Trust the Frontend**: After authentication, company context is **never** read from request bodies, query parameters, or headers. It's exclusively extracted from the verified JWT.

2. **JWT Verification**: All protected routes use middleware that:
   - Verifies JWT signature and expiration
   - Extracts user identity, role, and company
   - Attaches this data to the request object

3. **Automatic Scoping**: Every database query automatically includes a company filter from `req.user.company` (set by middleware).

4. **Role-Based Authorization**: Middleware enforces that:
   - Only `employer` role can create jobs
   - Only `applicant` role can create applications
   - Both roles can view resources, but only within their company

### Middleware Stack

```
Request → authenticate() → requireRole() → Controller
           ↓
      Extracts company from JWT
      Attaches to req.user.company
```

## 🛠️ Tech Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: MongoDB object modeling
- **JSON Web Tokens (JWT)**: Authentication
- **bcrypt**: Password hashing
- **dotenv**: Environment variable management

## 📚 API Documentation

### Authentication Routes

#### POST `/api/auth/register`

Register a new user with company selection.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "employer",
  "company": "company_a"
}
```

**Response** (201 Created):
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "employer",
      "company": "company_a"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/auth/login`

Login with email, password, and company.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "company": "company_a"
}
```

**Response** (200 OK):
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "employer",
      "company": "company_a"
    },
    "token": "jwt_token_here"
  }
}
```

### Job Routes

All job routes require authentication via `Authorization: Bearer <token>` header.

#### POST `/api/jobs`

Create a new job posting (employer only).

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced developer...",
  "explanation": "This role involves working on cutting-edge technologies...",
  "requirement": "5+ years of experience, proficiency in Node.js and MongoDB..."
}
```

**Note**: The `company` field is automatically set from the JWT token. The backend ignores any company value in the request body.

**Response** (201 Created):
```json
{
  "ok": true,
  "data": {
    "job": {
      "_id": "job_id",
      "title": "Senior Software Engineer",
      "description": "...",
      "company": "company_a",
      "createdBy": {
        "_id": "user_id",
        "email": "employer@example.com",
        "role": "employer",
        "company": "company_a"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET `/api/jobs`

Get all jobs for the authenticated user's company.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "ok": true,
  "data": {
    "jobs": [
      {
        "_id": "job_id",
        "title": "Senior Software Engineer",
        "description": "...",
        "company": "company_a",
        "createdBy": {...},
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

### Application Routes

All application routes require authentication via `Authorization: Bearer <token>` header.

#### POST `/api/applications`

Apply to a job (applicant only).

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "jobId": "job_id_here"
}
```

**Note**: The `company` field is automatically set from the JWT token. The backend verifies that the job belongs to the same company.

**Response** (201 Created):
```json
{
  "ok": true,
  "data": {
    "application": {
      "_id": "application_id",
      "jobId": {
        "_id": "job_id",
        "title": "Senior Software Engineer",
        "description": "...",
        "company": "company_a"
      },
      "applicantId": {
        "_id": "user_id",
        "email": "applicant@example.com",
        "role": "applicant",
        "company": "company_a"
      },
      "company": "company_a",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

#### GET `/api/applications`

Get applications (company-scoped, role-based filtering).

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Behavior**:
- **Applicants**: See only their own applications
- **Employers**: See all applications for jobs they created

**Response** (200 OK):
```json
{
  "ok": true,
  "data": {
    "applications": [
      {
        "_id": "application_id",
        "jobId": {...},
        "applicantId": {...},
        "company": "company_a",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or remote instance)
- npm or yarn

### Steps

1. **Clone the repository**:
```bash
git clone <repository-url>
cd job-portal-backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:

Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/job_portal
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Important**: Change `JWT_SECRET` to a strong, random string in production.

4. **Start MongoDB** (if running locally):
```bash
# Make sure MongoDB is running on your system
```

5. **Run the application**:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

### Health Check

Visit `http://localhost:5000/api/health` to verify the server is running.

## 📁 Project Structure

```
job-portal-backend/
│
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   │
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   │
│   ├── constants/
│   │   └── companies.js          # Company constants and validation
│   │
│   ├── models/
│   │   ├── User.js               # User model (email, password, role, company)
│   │   ├── Job.js                # Job model (title, description, company)
│   │   └── Application.js        # Application model (jobId, applicantId, company)
│   │
│   ├── controllers/
│   │   ├── auth.controller.js    # Registration and login logic
│   │   ├── job.controller.js     # Job CRUD operations
│   │   └── application.controller.js  # Application operations
│   │
│   ├── routes/
│   │   ├── auth.routes.js        # Authentication routes
│   │   ├── job.routes.js         # Job routes with middleware
│   │   └── application.routes.js # Application routes with middleware
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── company.middleware.js # Company validation (for registration/login)
│   │   └── role.middleware.js    # Role-based authorization
│   │
│   └── utils/
│       └── generateToken.js      # JWT token generation and verification
│
├── .env                          # Environment variables (not in git)
├── env.example                   # Example environment file
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🎓 Key Learning Points

This project demonstrates:

1. **Multi-Tenant Architecture**: How to serve multiple organizations from one backend
2. **Security Best Practices**: JWT-based auth, server-side data isolation
3. **Middleware Patterns**: Reusable authentication and authorization logic
4. **MongoDB Schema Design**: Company-scoped data models
5. **RESTful API Design**: Clean, consistent endpoint structure
6. **Error Handling**: Proper HTTP status codes and error responses

## 📝 Notes

- This is a **backend-only** project. No frontend code is included.
- The system supports exactly **two fixed companies**: `company_a` and `company_b`
- All company context after authentication comes from the **JWT token**, never from request bodies
- The backend **never trusts** the frontend to provide company data after login

## 📄 License

This project is for educational and portfolio purposes.
