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

      // Recent activity for admin
      const recentActivity = await LoanApplication.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name email")
        .populate("loanId", "title")
        .select("status createdAt updatedAt amount")

      stats = {
        totalUsers,
        totalLoans,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        recentActivity: recentActivity.map((app) => ({
          message: `${app.userId?.name || "User"} applied for ${
            app.loanId?.title || "a loan"
          }`,
          status: app.status,
          time: app.createdAt,
        })),
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
      }).select("loanAmount")

      const totalAmount = approvedApplicationsData.reduce(
        (sum, app) => sum + (app.loanAmount || 0),
        0
      )

      // Recent activity for manager
      const recentActivity = await LoanApplication.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("userId", "name")
        .populate("loanId", "title")
        .select("status createdAt updatedAt amount")

      stats = {
        myLoans,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        totalAmount,
        recentActivity: recentActivity.map((app) => ({
          message: `${app.userId?.name || "User"} - ${
            app.loanId?.title || "Loan"
          } ${app.status}`,
          status: app.status,
          time: app.updatedAt,
        })),
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
      }).select("loanAmount")

      const totalBorrowed = approvedApplicationsData.reduce(
        (sum, app) => sum + (app.loanAmount || 0),
        0
      )

      // Recent activity for borrower
      const recentActivity = await LoanApplication.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("loanId", "title")
        .select("status createdAt updatedAt amount")

      stats = {
        myApplications: myApps,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        totalBorrowed,
        recentActivity: recentActivity.map((app) => ({
          message: `Application for ${app.loanId?.title || "loan"} - ${
            app.status
          }`,
          status: app.status,
          time: app.updatedAt,
        })),
      }
    }

    res.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Failed to fetch dashboard statistics" })
  }
})

module.exports = router
