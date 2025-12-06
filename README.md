# 🏦 LoanLink API - Backend Server

RESTful API for the LoanLink microloan management system. Built with Node.js, Express, MongoDB, and featuring JWT authentication, Stripe payments, and role-based access control.

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![Express](https://img.shields.io/badge/Express-4.18-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![JWT](https://img.shields.io/badge/JWT-9.0-blue)

## 🌟 Features

### 🛡️ Authentication & Security

- **JWT Authentication** with httpOnly cookies
- **Firebase Admin SDK** integration
- **Role-Based Authorization** middleware
- **Secure password handling**
- **CORS configuration**

### 📊 API Endpoints

#### Authentication

- `POST /api/auth/jwt` - Generate JWT token
- `POST /api/auth/logout` - Clear authentication

#### Loans

- `GET /api/loans` - Get all loans
- `GET /api/loans/home` - Get featured loans
- `GET /api/loans/:id` - Get loan by ID
- `POST /api/loans` - Create new loan (Manager/Admin)
- `PUT /api/loans/:id` - Update loan (Manager/Admin)
- `DELETE /api/loans/:id` - Delete loan (Manager/Admin)
- `PATCH /api/loans/:id/toggle-home` - Toggle homepage visibility (Admin)

#### Applications

- `POST /api/applications` - Submit loan application
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/pending` - Get pending applications (Manager)
- `GET /api/applications/all` - Get all applications (Admin)
- `PATCH /api/applications/:id/approve` - Approve application (Manager/Admin)
- `PATCH /api/applications/:id/reject` - Reject application (Manager/Admin)
- `PATCH /api/applications/:id/cancel` - Cancel application (Borrower)

#### Payments

- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/save` - Save payment record
- `GET /api/payments/history` - Get payment history

## 🛠️ Tech Stack

- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB Atlas** - Cloud Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Token-based Authentication
- **Stripe** - Payment Processing
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                      # MongoDB connection
├── controllers/
│   ├── application.controller.js  # Application logic
│   ├── auth.controller.js         # Authentication logic
│   ├── loan.controller.js         # Loan CRUD operations
│   └── payment.controller.js      # Payment processing
├── middleware/
│   └── auth.middleware.js         # JWT & role verification
├── models/
│   ├── Loan.model.js             # Loan schema
│   ├── LoanApplication.model.js  # Application schema
│   ├── Payment.model.js          # Payment schema
│   └── User.model.js             # User schema
├── routes/
│   ├── application.routes.js     # Application endpoints
│   ├── auth.routes.js            # Auth endpoints
│   ├── loan.routes.js            # Loan endpoints
│   └── payment.routes.js         # Payment endpoints
├── .env.example
├── .gitignore
├── package.json
└── server.js                      # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Stripe account

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/shamim0183/LoanLink-Server.git
cd LoanLink-Server
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup Environment Variables**

Create `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loanlink?retryWrites=true&w=majority

# JWT Secret (minimum 32 characters)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Firebase Admin SDK (Optional)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
```

4. **Configure MongoDB Atlas**

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create database user
   - Whitelist IP address (0.0.0.0/0 for development)
   - Get connection string
   - Update `MONGODB_URI` in `.env`

5. **Run Development Server**

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 📦 Available Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

## 📊 Database Schema

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  photoURL: String,
  role: String (admin/manager/borrower),
  status: String (active/suspended),
  suspendReason: String,
  suspendFeedback: String,
  firebaseUID: String,
  timestamps: true
}
```

### Loan Schema

```javascript
{
  title: String (required),
  description: String (required),
  category: String (required),
  interestRate: Number (required),
  maxLoanLimit: Number (required),
  requiredDocuments: [String],
  emiPlans: [String],
  images: [String],
  showOnHome: Boolean,
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Loan Application Schema

```javascript
{
  userEmail: String (required),
  userId: ObjectId (ref: User),
  loanId: ObjectId (ref: Loan),
  loanTitle: String,
  interestRate: Number,
  firstName: String,
  lastName: String,
  contactNumber: String,
  nationalId: String,
  incomeSource: String,
  monthlyIncome: Number,
  loanAmount: Number,
  reason: String,
  address: String,
  extraNotes: String,
  status: String (pending/approved/rejected/cancelled),
  applicationFeeStatus: String (unpaid/paid),
  approvedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  timestamps: true
}
```

### Payment Schema

```javascript
{
  userEmail: String (required),
  userId: ObjectId (ref: User),
  applicationId: ObjectId (ref: LoanApplication),
  loanId: ObjectId (ref: Loan),
  amount: Number (default: 10),
  transactionId: String (required, unique),
  status: String (pending/completed/failed),
  paymentMethod: String,
  timestamps: true
}
```

## 🔐 Authentication Flow

1. **User Login** (Frontend with Firebase)
2. **Send Email to Backend** → `POST /api/auth/jwt`
3. **Backend Creates/Updates User** in MongoDB
4. **Generate JWT Token** with email & role
5. **Set httpOnly Cookie** with JWT
6. **Return User Data** to frontend
7. **Protected Routes** verify JWT from cookie

## 🛡️ Security Middleware

### verifyToken

```javascript
// Verifies JWT from cookie
// Adds req.user with { email, role, userId }
```

### verifyAdmin

```javascript
// Ensures user role is 'admin'
```

### verifyManager

```javascript
// Ensures user role is 'manager' or 'admin'
```

### verifyBorrower

```javascript
// Ensures user role is 'borrower'
```

## 🌐 Deployment

### Railway (Recommended)

1. **Create Railway Account**

   - Go to [Railway](https://railway.app)
   - Connect GitHub repository

2. **Add Environment Variables**

   - Add all variables from `.env`
   - Use production values

3. **Deploy**
   - Railway auto-deploys on push

### Render

1. **Create Web Service**

   - Go to [Render](https://render.com)
   - Connect repository

2. **Configure**
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Environment Variables**

   - Add all from `.env`

4. **Deploy**

## 🧪 API Testing

### Health Check

```bash
GET http://localhost:5000/
```

Response:

```json
{
  "success": true,
  "message": "LoanLink API Server is running! 🚀",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "loans": "/api/loans",
    "applications": "/api/applications",
    "payments": "/api/payments"
  }
}
```

### Test with cURL

```bash
# Get all loans
curl http://localhost:5000/api/loans

# Create loan (requires auth)
curl -X POST http://localhost:5000/api/loans \
  -H "Content-Type: application/json" \
  -d '{"title":"Personal Loan","description":"...","category":"Personal","interestRate":8.5,"maxLoanLimit":50000}'
```

## 🔧 Environment Variables

| Variable            | Description               | Required                    |
| ------------------- | ------------------------- | --------------------------- |
| `PORT`              | Server port               | No (default: 5000)          |
| `NODE_ENV`          | Environment               | No (development/production) |
| `MONGODB_URI`       | MongoDB connection string | Yes                         |
| `JWT_SECRET`        | Secret for JWT signing    | Yes                         |
| `CLIENT_URL`        | Frontend URL for CORS     | Yes                         |
| `STRIPE_SECRET_KEY` | Stripe API secret key     | Yes                         |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License

## 👨‍💻 Author

**Shamim**

- GitHub: [@shamim0183](https://github.com/shamim0183)

---

**Built with ⚡ Node.js + Express + MongoDB**
