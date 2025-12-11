# 🏦 LoanLink Server

![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-14.8-635bff?logo=stripe)
![JWT](https://img.shields.io/badge/JWT-9.0-black?logo=jsonwebtokens)

RESTful API for the LoanLink microloan management platform. Built with Express.js, MongoDB, and Stripe integration.

## 🛠️ Tech Stack

- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Processing
- Cookie-based sessions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see below)
# Then start the server
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_secure_jwt_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 📁 Project Structure

```
server/
├── config/                         # Configuration files
│   ├── db.config.js               # MongoDB connection setup
│   └── stripe.config.js           # Stripe client configuration
├── controllers/                    # Business logic handlers
│   ├── admin.controller.js        # Admin operations (users, roles, suspend)
│   ├── application.controller.js  # Loan application CRUD
│   ├── auth.controller.js         # JWT generation and validation
│   ├── loan.controller.js         # Loan product operations
│   ├── manager.controller.js      # Manager operations (approve/reject)
│   └── payment.controller.js      # Stripe payment processing
├── middleware/                     # Express middleware
│   ├── auth.middleware.js         # JWT verification
│   ├── role.middleware.js         # Role-based access control (RBAC)
│   ├── validation.middleware.js   # Request validation
│   ├── errorHandler.middleware.js # Global error handling
│   └── logger.middleware.js       # Request logging
├── models/                         # Mongoose schemas
│   ├── User.model.js              # User schema (auth, roles, suspension)
│   ├── Loan.model.js              # Loan product schema
│   ├── LoanApplication.model.js   # Application schema (status, history)
│   └── Payment.model.js           # Payment records schema
├── routes/                         # API route definitions
│   ├── auth.routes.js             # POST /api/auth/jwt
│   ├── loan.routes.js             # GET /api/loans
│   ├── application.routes.js      # /api/applications/*
│   ├── payment.routes.js          # /api/payments/*
│   ├── dashboard.routes.js        # /api/dashboard/stats
│   ├── manager.routes.js          # /api/manager/*
│   └── admin.routes.js            # /api/admin/*
├── .env                            # Environment variables
├── .gitignore                      # Git ignore rules
├── server.js                       # Express app entry point
├── seed-loans.js                   # Database seeding script
└── package.json                    # Dependencies
```

### Key Architecture Features

- **RESTful API Design**: Clean resource-based endpoints
- **RBAC Middleware**: Role-based access control for Admin/Manager routes
- **JWT Authentication**: HTTP-only cookie-based sessions
- **Stripe Integration**: Secure payment processing with webhooks
- **Error Handling**: Centralized error middleware
- **Database Seeding**: Pre-populated loan products for testing

## 🔌 API Endpoints

### Public

- `POST /api/auth/jwt` - Generate token
- `GET /api/loans` - List all loans
- `GET /api/loans/:id` - Get loan details

### Authenticated

- `POST /api/applications` - Submit application
- `GET /api/applications/my-applications` - User's applications
- `POST /api/payments/create-checkout-session` - Initiate payment

### Manager Only

- `POST /api/manager/loans` - Create loan product
- `GET /api/manager/applications/pending` - Review applications
- `PATCH /api/manager/applications/:id/approve` - Approve application

### Admin Only

- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/role` - Update user role
- `PATCH /api/admin/users/:id/suspend` - Suspend user

## 🛡️ Security

- JWT tokens stored in HTTP-only cookies
- Role-based access control (RBAC)
- CORS configured for specific origins
- Input validation and sanitization

## 💾 Database Models

**User** - Authentication and roles  
**Loan** - Loan products catalog  
**LoanApplication** - User applications  
**Payment** - Payment records

## 🌐 Deployment

Tested on Render.

1. Set environment variables on your platform
2. Deploy from GitHub repository
3. Update CORS origins with production URL

### ⚠️ Important Note About Deployment

**For this assignment**, I've deployed the server on Render's free tier. Please be aware of the following behavior:

**Why the server might show as "Off":**

- Render's free tier automatically spins down the server after 15 minutes of inactivity
- This is a cost-saving feature of the free hosting plan
- The server will wake up automatically when you visit the site

**What to expect:**

- **First visit** (or after 15 min of inactivity): The server may take **30-90 seconds** to respond while it wakes up
- **After the first request**: Everything works normally with regular response times
- **Server dashboard**: May show "Off" status when inactive - this is normal

---

Built by [Shamim](https://github.com/shamim0183)
