const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/auth.middleware")
const Application = require("../models/Application")
const Loan = require("../models/Loan")
const User = require("../models/User")

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics based on user role
// @access  Private
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id
    const userRole = req.user.role

    let stats = {}

    if (userRole === "admin") {
      // Admin stats
      const [totalUsers, totalLoans, pendingApps, approvedApps] =
        await Promise.all([
          User.countDocuments(),
          Loan.countDocuments(),
          Application.countDocuments({ status: "pending" }),
          Application.countDocuments({ status: "approved" }),
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
        Application.countDocuments({ status: "pending" }),
        Application.countDocuments({ status: "approved" }),
      ])

      // Calculate total amount from approved applications
      const approvedApplicationsData = await Application.find({
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
        Application.countDocuments({ userId }),
        Application.countDocuments({ userId, status: "pending" }),
        Application.countDocuments({ userId, status: "approved" }),
      ])

      // Calculate total borrowed amount
      const approvedApplicationsData = await Application.find({
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
