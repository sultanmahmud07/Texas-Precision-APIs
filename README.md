# 🏠 Texas Precision Roofing - Backend API

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

A highly scalable, robust, and production-ready RESTful API powering **Texas Precision Roofing**. Built using Node.js, Express, TypeScript, and MongoDB, this backend coordinates scheduling, availability management, media uploads, Google Calendar integrations, automated email notifications, and admin dashboards.

---

## ✨ Features

### 🔐 **Authentication & Security**
- Secure Local Authentication & JWT-based Authorization.
- Google OAuth Integration using Passport.js.
- One-Time Password (OTP) verification for secure flows.
- Role-based Access Control (RBAC) with `USER`, `ADMIN`, and `SUPER_ADMIN` roles.

### 📅 **Inspection Scheduling & Google Calendar Integration**
- Public scheduling form for booking inspections (for Abilene and DFW estimate sites).
- Automatic scheduling/booking validation to prevent double-bookings.
- Background integration with **Google Calendar API** to automatically sync scheduled inspections.
- Automated email alerts (using EJS templates & Nodemailer) sent to both the user (confirmation) and the admin (notification).

### 🛠️ **Availability Management**
- Admin dashboard interface to schedule date-specific slot availabilities.
- Public endpoints to query available slots for the scheduler component.
- Real-time past-date filter to ensure users cannot view or book outdated slots.

### 🗺️ **Address & Media Management**
- Address routing configuration and management.
- Multi-channel media storage supporting both **AWS S3** (using `@aws-sdk/client-s3`) and **Cloudinary**.

### ⭐ **Customer Reviews & Feedback**
- Public reviews API for displaying customer experiences on the website.
- Verified customer reviews logic.

### 📊 **Admin Dashboard Statistics**
- Centralized statistics endpoint compiling overall metrics (total inspections, user growth, scheduling analysis) to feed admin charts.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Runtime & Language** | Node.js, TypeScript |
| **Framework** | Express.js (v5) |
| **Database** | MongoDB + Mongoose ORM |
| **Caching & PubSub** | Redis |
| **Authentication** | JSON Web Tokens (JWT), Passport.js, Google OAuth 2.0 |
| **Validation** | Zod (Schema-based Validation) |
| **File Storage** | AWS S3, Cloudinary |
| **Email Server** | Nodemailer (SMTP) + EJS Templating |
| **Utility Packages** | PDFKit (PDF generation), Axios, Slugify |

---

## 📂 Project Architecture

```text
src/
 ├── app/
 │    ├── config/          # Configurations (AWS, Redis, Google OAuth, etc.)
 │    ├── constants/       # Global constants and exclude fields
 │    ├── helpers/         # Utility functions and date/time formatters
 │    ├── middlewares/     # Auth checks, global error handling, zod validation
 │    ├── routes/          # Unified router registration
 │    │    └── index.ts    # Main route mount point
 │    ├── utils/           # Mongoose QueryBuilder, sendEmail, responses
 │    │
 │    └── modules/         # Domain-driven feature modules
 │         ├── address/     # Address endpoints
 │         ├── auth/        # Login, registration, social oauth
 │         ├── availability/# Slot management and calendar lookups
 │         ├── contact/     # Contact requests
 │         ├── inspection/  # Booking inspections & calendar sync
 │         ├── otp/         # Verification codes
 │         ├── review/      # Customer feedback system
 │         ├── stats/       # Analytics reporting for dashboards
 │         └── user/        # User accounts & roles management
 ├── app.ts                # Express application configuration
 └── server.ts             # Server entry point (database connection, startup)
```

---

## ⚙️ Development Setup

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/sultanmahmud07/Texas-Precision-APIs.git
cd Texas-Precision-APIs/Server
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a `.env` file in the root directory:
```env
PORT=9000
DB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/texasPrecisionDB
NODE_ENV=development

# JWT Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRES=30d

# BCRYPT Encryption
BCRYPT_SALT_ROUND=10

# Default Credentials
SUPER_ADMIN_EMAIL=super@gmail.com
SUPER_ADMIN_PASSWORD=strongpassword

# Google API Credentials (OAuth & Calendar Sync)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:9000/api/v1/inspection/google/callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Express Session
EXPRESS_SESSION_SECRET=your-express-session-secret

# Frontend URLs
FRONTEND_URL=http://localhost:3000

# AWS S3 Configurations
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_DEFAULT_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Configurations (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_smtp_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_smtp_email@gmail.com

# Redis Config
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
```

### **4️⃣ Run the Server**

**Development mode (Hot reloading):**
```bash
npm run dev
```

**Production mode (Build & Run):**
```bash
npm run build
npm start
```

---

## 🔌 API Endpoints Summary

### **Inspection Module**
- `POST /api/v1/inspection/create` - Book an inspection (Public)
- `GET /api/v1/inspection/booked-slots` - Retrieve booked dates and slots starting from today (Public)
- `GET /api/v1/inspection/` - List all inspections (Admin only)
- `GET /api/v1/inspection/:id` - Fetch single inspection details (Admin only)
- `PATCH /api/v1/inspection/:id` - Update inspection status (Admin only)
- `DELETE /api/v1/inspection/:id` - Delete an inspection record (Admin only)

### **Availability Module**
- `POST /api/v1/availability/create` - Create/Update date slots (Admin only)
- `GET /api/v1/availability/` - Fetch all future available date slots (Public)
- `GET /api/v1/availability/dates` - Get available date strings for calendar monthly view (Public)
- `GET /api/v1/availability/:date` - Get slots for a specific date (Public)

### **Statistics Module**
- `GET /api/v1/stats/` - Aggregate metrics for analytics dashboard (Admin only)

---

## 🤝 Contribution Guidelines
1. Ensure all code conforms to the project's ESLint rules: `npm run lint`.
2. Format the code with Prettier before committing.
3. Keep module boundaries clean and utilize dependency injection patterns present in the services layer.
