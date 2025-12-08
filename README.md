# 🏦 LoanLink Server

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0.3-47A248?logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-14.8.0-635bff?logo=stripe)
![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**Secure RESTful API for the LoanLink Microloan Management Platform**

[Live API](#) • [Client Repository](https://github.com/shamim0183/LoanLink-Client) • [Report Bug](https://github.com/shamim0183/LoanLink-Server/issues)

</div>

---

## 📖 About The Project

LoanLink Server is a robust, scalable backend API built with Node.js and Express. It provides secure authentication, role-based access control, and comprehensive loan management functionality. The API integrates with Stripe for payment processing and uses MongoDB for flexible data storage, ensuring a reliable and efficient microloan platform.

## 🚀 Features

### Core Functionality

- RESTful API architecture
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Admin, Manager, Borrower)
- MongoDB database with Mongoose ODM
- Stripe payment integration
- Webhook handling for payment events

### API Endpoints

#### Authentication (`/api/auth`)

- User registration and login
- Token-based session management
- User profile management

#### Loans (`/api/loans`)

- Get all loans (public & featured)
- Get loan by ID
- Search and filter loans
- Pagination support

#### Applications (`/api/applications`)

- Submit loan applications
- Get user's applications
- Application status tracking

#### Payments (`/api/payments`)

- Create Stripe payment intents
- Process payments
- Payment history
- Stripe webhook handling

#### Admin Routes (`/api/admin`)

- User management (list, promote, demote)
- System-wide loan overview
- Application monitoring

#### Manager Routes (`/api/manager`)

- Create and update loan products
- Review loan applications
- Approve/reject applications
- Manage loan portfolio

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Payment Processing**: Stripe
- **Security**:
  - CORS (Cross-Origin Resource Sharing)
  - Cookie Parser
  - Environment Variables (dotenv)
- **Development**: Nodemon

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shamim0183/LoanLink-Server.git
   cd LoanLink-Server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/loanlink
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loanlink

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Start the server**

   Development mode (with auto-restart):

   ```bash
   npm run dev
   ```

   Production mode:

   ```bash
   npm start
   ```

   The server will be available at `http://localhost:5000`

## 🌱 Seed Database

To populate the database with sample loan data:

```bash
npm run seed
```

This will create sample loan products in your database.

## 🏗️ Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/              # Route controllers (business logic)
│   ├── admin.controller.js
│   ├── application.controller.js
│   ├── auth.controller.js
│   ├── loan.controller.js
│   ├── manager.controller.js
│   └── payment.controller.js
├── middleware/               # Custom middleware
│   ├── auth.middleware.js    # Authentication verification
│   ├── role.middleware.js    # Role-based access control
│   └── logger.middleware.js  # Request logging
├── models/                   # Mongoose schemas
│   ├── Loan.model.js
│   ├── LoanApplication.model.js
│   ├── Payment.model.js
│   └── User.model.js
├── routes/                   # API routes
│   ├── admin.routes.js
│   ├── application.routes.js
│   ├── auth.routes.js
│   ├── loan.routes.js
│   ├── manager.routes.js
│   └── payment.routes.js
├── .env                      # Environment variables (not in git)
├── .gitignore
├── package.json              # Dependencies and scripts
├── seed-loans.js             # Database seeding script
└── server.js                 # Application entry point
```

## 🔐 Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server generates JWT token
3. Token stored in HTTP-only cookie
4. Protected routes verify token via middleware
5. User role checked for admin/manager routes

## 💳 Payment Flow

1. User initiates payment from client
2. Client requests payment intent from `/api/payments/create-intent`
3. Server creates Stripe payment intent
4. Client confirms payment with Stripe
5. Stripe sends webhook to `/api/payments/webhook`
6. Server processes webhook and updates database
7. Payment record created and application status updated

## 📊 Database Models

### User

- name, email, password (hashed)
- role: 'borrower' | 'manager' | 'admin'
- photoURL
- timestamps

### Loan

- loanType, loanAmount, interestRate
- duration, description
- features, eligibility
- status: 'active' | 'inactive'
- isFeatured boolean
- addedBy (manager reference)
- timestamps

### LoanApplication

- user, loan references
- requestedAmount, duration
- purpose, employmentInfo
- monthlyIncome, existingDebts
- status: 'pending' | 'approved' | 'rejected'
- rejection reason (if applicable)
- timestamps

### Payment

- application, user references
- amount, currency
- stripePaymentIntentId
- status: 'pending' | 'completed' | 'failed'
- paymentMethod
- timestamps

## 🛡️ Security Features

- Password hashing (bcrypt via Firebase)
- JWT token authentication
- HTTP-only cookies (prevents XSS)
- CORS configuration
- Environment variable protection
- Role-based access control
- Input validation
- MongoDB injection prevention (via Mongoose)

## 🔌 API Routes Overview

### Public Routes

- `GET /` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/loans` - Get all active loans
- `GET /api/loans/:id` - Get loan details

### Protected Routes (Authenticated Users)

- `POST /api/applications/submit` - Submit loan application
- `GET /api/applications/my-applications` - Get user's applications
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments/history` - Get payment history

### Manager Routes

- `POST /api/manager/loans` - Create loan product
- `PUT /api/manager/loans/:id` - Update loan product
- `GET /api/manager/applications` - Get all applications
- `PUT /api/manager/applications/:id/approve` - Approve application
- `PUT /api/manager/applications/:id/reject` - Reject application

### Admin Routes

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/loans` - View all loans
- `GET /api/admin/applications` - View all applications

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample loans

## 🧪 Testing

### Manual API Testing

Test endpoints using tools like:

- Postman
- Insomnia
- Thunder Client (VS Code extension)
- cURL

Example:

```bash
# Health check
curl http://localhost:5000

# Get all loans
curl http://localhost:5000/api/loans
```

## 🚀 Deployment

### Environment Variables

Ensure all production environment variables are set:

- `NODE_ENV=production`
- Production MongoDB URI
- Secure JWT secret
- Production Stripe keys
- Correct CLIENT_URL

### Recommended Platforms

- **Railway**: Easy deployment with auto-scaling
- **Render**: Free tier available, great for portfolios
- **Heroku**: Classic platform with extensive documentation
- **DigitalOcean**: App Platform for scalable deployment
- **AWS**: EC2 or Elastic Beanstalk for enterprise-grade hosting

### Deployment Steps

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables
4. Deploy and test endpoints

## 👨‍💻 Author

**Shamim**

- GitHub: [@shamim0183](https://github.com/shamim0183)
- Project Link: [LoanLink Server](https://github.com/shamim0183/LoanLink-Server)
- Client Repository: [LoanLink Client](https://github.com/shamim0183/LoanLink-Client)

## 🙏 Acknowledgments

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Fast, minimalist web framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - Elegant MongoDB object modeling
- [Stripe](https://stripe.com/) - Payment infrastructure
- [JWT](https://jwt.io/) - Secure authentication tokens

---

<div align="center">

Made with ❤️ by [Shamim](https://github.com/shamim0183)

**[⬆ Back to Top](#-loanlink-server)**

</div>
