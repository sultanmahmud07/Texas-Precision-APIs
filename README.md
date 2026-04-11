# Local Guide Backend (Node.js + Express + MongoDB)

A scalable backend API powering the **Local Guide Platform**, where travelers can book personalized tours from local guides.  
This repository contains authentication, tour management, booking workflow, reviews, messaging, and payment integration.

---

## 🌍 Live API URL  
**Production:** https://local-guide-client-fz9u.vercel.app
**Backend API:** https://native-ways-api.onrender.com

---

## 🚀 Features  
### ✅ **Authentication & Authorization**
- JWT-based secure auth  
- Role-based access control (Admin, Guide, Tourist)  
- Email/password + provider support  

### 🎒 **Tours Module**
- Create, update, delete tours (with images)  
- Filtering, searching & pagination  
- Public/private tour visibility  
- Guide analytics (tour count, recent bookings, earnings)

### 📅 **Booking System**
- Traveler requests → Guide accepts/declines  
- Status lifecycle: `PENDING → CONFIRMED → COMPLETED → CANCELLED`  
- Group size, date/time, fee calculation  
- Integrated payment workflow  

### ⭐ **Reviews**
- Tourist can review a tour after completion  
- Guides get average ratings & review count  
- Integrated into Explore listings

### 💬 **Messaging**
- Tourist → Guide custom request  
- Stored message thread per booking  

### 💳 **Payment Integration**
- SSLCommerz (or your provider)  
- Payment initialization + status update  
- Admin payment overview analytics  

### 📊 **Admin Dashboard Analytics**
- Total users (active/inactive/blocked)  
- User growth (7 days / 30 days)  
- Users by role  
- Total bookings, payments, guides, tours  
- Chart-ready data for dashboard  

---

## 🛠️ Technology Stack
### **Backend**
- Node.js  
- Express.js  
- TypeScript  
- Mongoose (MongoDB)  
- JWT Authentication  
- Multer (file uploads)  
- Zod Validation  
- SSLCommerz / Stripe Payment Gateway  

### **Dev Tools**
- Nodemon  
- ESLint + Prettier  
- Docker-ready configuration  

---

## 📂 Folder Structure
```
src/
 ├── app/
 │    ├── modules/
 │    │    ├── auth/
 │    │    ├── tours/
 │    │    ├── booking/
 │    │    ├── reviews/
 │    │    ├── payment/
 │    │    ├── messages/
 │    │    └── admin/
 │    │
 │    ├── middlewares/
 │    ├── utils/
 │    ├── interfaces/
 │    └── config/
 │
 ├── server.ts
 └── app.ts
```

---

## ⚙️ Installation & Setup
### **1️⃣ Clone the repository**
```sh
git clone https://github.com/yourusername/local-guide-server.git
cd local-guide-server
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Environment variables**
Create a `.env` file:

```
PORT=5000
DB_URL=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/nativeWaysDB?retryWrites=true&w=majority
NODE_ENV=development

# JWT Authentication
JWT_ACCESS_SECRET=your_super_secret_access_key_123
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_456
JWT_REFRESH_EXPIRES=30d

# BCRYPT Hashing
BCRYPT_SALT_ROUND=12

# Super Admin Credentials
SUPER_ADMIN_EMAIL=admin@nativeways.com
SUPER_ADMIN_PASSWORD=strong_password_123

# Google OAuth
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Express Session
EXPRESS_SESSION_SECRET=your_session_secret_key

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# SSLCommerz Payment Gateway (Sandbox Credentials)
SSL_STORE_ID=testbox
SSL_STORE_PASS=testbox@ssl
SSL_PAYMENT_API=https://sandbox.sslcommerz.com/gwprocess/v3/api.php
SSL_VALIDATION_API=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
SSL_IPN_URL=http://localhost:5000/api/v1/payment/validate-payment

# Payment Backend Redirect URLs
SSL_SUCCESS_BACKEND_URL=http://localhost:5000/api/v1/payment/success
SSL_FAIL_BACKEND_URL=http://localhost:5000/api/v1/payment/fail
SSL_CANCEL_BACKEND_URL=http://localhost:5000/api/v1/payment/cancel

# Payment Frontend Redirect URLs
SSL_SUCCESS_FRONTEND_URL=http://localhost:3000/payment/success
SSL_FAIL_FRONTEND_URL=http://localhost:3000/payment/fail
SSL_CANCEL_FRONTEND_URL=http://localhost:3000/payment/cancel

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123

# SMTP Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=no-reply@nativeways.com

# Redis Cache
REDIS_HOST=redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password_here
```

### **4️⃣ Run development server**
```sh
npm run dev
```

### **5️⃣ Build for production**
```sh
npm run build
npm start
```

---

## 📧 Contact
If you need help or want to collaborate:  
**Email:** support@localguide.com  
**Website:** https://local-guide-client-fz9u.vercel.app
