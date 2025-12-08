require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")

// Import routes
const authRoutes = require("./routes/auth.routes")
const loanRoutes = require("./routes/loan.routes")
const applicationRoutes = require("./routes/application.routes")
const paymentRoutes = require("./routes/payment.routes")
const adminRoutes = require("./routes/admin.routes")
const managerRoutes = require("./routes/manager.routes")
const dashboardRoutes = require("./routes/dashboard.routes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware - CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://loanlink-bd.netlify.app",
]

// Manual CORS headers for Vercel compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    )
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,Accept"
    )
    res.setHeader("Access-Control-Expose-Headers", "Set-Cookie")
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  next()
})

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

// Stripe webhook needs raw body for signature verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }))

// JSON parser for all other routes
app.use(express.json())
app.use(cookieParser())

// Connect to MongoDB
connectDB()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/loans", loanRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/manager", managerRoutes)
app.use("/api/dashboard", dashboardRoutes)

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LoanLink API Server is running! 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      loans: "/api/loans",
      applications: "/api/applications",
      payments: "/api/payments",
    },
  })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`)
  if (process.env.NODE_ENV !== "production") {
    console.log(`📍 http://localhost:${PORT}`)
  }
})
