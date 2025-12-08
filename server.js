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

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
)

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

// Start server only in local development (not in Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📍 http://localhost:${PORT}`)
  })
}

// Export the Express app for Vercel serverless deployment
module.exports = app
