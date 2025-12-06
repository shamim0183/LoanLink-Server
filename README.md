# 🏦 LoanLink Server - API Documentation

A robust backend API for the LoanLink microloan management system, built with Node.js, Express, MongoDB, and Firebase Authentication.

## 🌐 Live API

**Production:** `https://your-api-url.com/api` (To be deployed)  
**Development:** `http://localhost:5000/api`

## � Purpose

Provides secure REST API endpoints for:

- User authentication and authorization
- Loan management (CRUD operations)
- Application processing
- Payment handling via Stripe
- Role-based access control (Admin, Manager, Borrower)

## ✨ Key Features

- JWT + Firebase Authentication
- Role-based authorization middleware
- MongoDB database with Mongoose ODM
- Stripe payment integration
- Secure cookie-based sessions
- CORS-enabled API
- Input validation and error handling

## � NPM Packages Used

### Core

- `express` (4.21.1) - Web framework
- `mongoose` (8.8.4) - MongoDB ODM
- `dotenv` (16.4.7) - Environment variables

### Authentication & Security

- `firebase-admin` (13.0.1) - Firebase Auth validation
- `jsonwebtoken` (9.0.2) - JWT token generation
- `bcrypt` (5.1.1) - Password hashing
- `cookie-parser` (1.4.7) - Cookie parsing
- `cors` (2.8.5) - CORS middleware

### Payment

- `stripe` (17.5.0) - Payment processing

### Development

- `nodemon` (3.1.11) - Auto-restart dev server

## 🚀 Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_min_32_chars
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_key
```

3. Run development server:

```bash
npm run dev
```

## � API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login with credentials
- `POST /logout` - Logout user
- `GET /me` - Get current user

### Loans (`/api/loans`)

- `GET /` - Get all loans
- `GET /:id` - Get loan by ID
- `POST /` - Create loan (Manager/Admin)
- `PATCH /:id` - Update loan
- `DELETE /:id` - Delete loan

### Applications (`/api/applications`)

- `GET /` - Get user's applications
- `POST /` - Submit loan application
- `PATCH /:id` - Update application
- `DELETE /:id` - Cancel application

### Admin Routes (`/api/admin`)

- `GET /users` - Get all users
- `PATCH /users/:id/role` - Update user role
- `PATCH /users/:id/suspend` - Suspend user
- `GET /loans` - Get all loans
- `GET /applications` - Get all applications

### Manager Routes (`/api/manager`)

- `POST /loans` - Create loan
- `GET /my-loans` - Get manager's loans
- `GET /applications/pending` - Get pending apps
- `PATCH /applications/:id/approve` - Approve app
- `PATCH /applications/:id/reject` - Reject app

### Payments (`/api/payments`)

- `POST /create-intent` - Create Stripe payment intent
- `POST /confirm` - Confirm payment

## � Environment Variables

See `.env.example` for required variables.

## � License

MIT

## 👨‍💻 Author

**Shamim** - [@shamim0183](https://github.com/shamim0183)
