const express = require("express")
const router = express.Router()
const { verifyToken } = require("../middleware/auth.middleware")
const LoanApplication = require("../models/LoanApplication.model")
const Loan = require("../models/Loan.model")
const User = require("../models/User.model")

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics based on user role
// @access  Private
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId // from auth middleware
    const userRole = req.user.role

    let stats = {}

    if (userRole === "admin") {
      // Admin stats
      const [totalUsers, totalLoans, pendingApps, approvedApps] =
        await Promise.all([
          User.countDocuments(),
          Loan.countDocuments(),
          LoanApplication.countDocuments({ status: "pending" }),
          LoanApplication.countDocuments({ status: "approved" }),
        ])

      stats = {
        totalUsers,
        totalLoans,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
      }
    } else if (userRole === "manager") {
      // Manager stats
      const [myLoans, pendingApps, approvedApps] = await Promise.all([
        Loan.countDocuments({ createdBy: userId }),
        LoanApplication.countDocuments({ status: "pending" }),
        LoanApplication.countDocuments({ status: "approved" }),
      ])

      // Calculate total amount from approved applications
      const approvedApplicationsData = await LoanApplication.find({
        status: "approved",
      }).select("amount")

      const totalAmount = approvedApplicationsData.reduce(
        (sum, app) => sum + (app.amount || 0),
        0
      )

      stats = {
        myLoans,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        totalAmount,
      }
    } else {
      // Borrower stats
      const [myApps, pendingApps, approvedApps] = await Promise.all([
        LoanApplication.countDocuments({ userId }),
        LoanApplication.countDocuments({ userId, status: "pending" }),
        LoanApplication.countDocuments({ userId, status: "approved" }),
      ])

      // Calculate total borrowed amount
      const approvedApplicationsData = await LoanApplication.find({
        userId,
        status: "approved",
      }).select("amount")

      const totalBorrowed = approvedApplicationsData.reduce(
        (sum, app) => sum + (app.amount || 0),
        0
      )

      stats = {
        myApplications: myApps,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        totalBorrowed,
      }
    }

    res.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Failed to fetch dashboard statistics" })
  }
})

module.exports = router
