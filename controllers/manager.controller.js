const Loan = require("../models/Loan.model")
const Application = require("../models/LoanApplication.model")

// Create new loan
exports.createLoan = async (req, res) => {
  try {
    const loanData = {
      ...req.body,
      createdBy: req.user.userId,
      createdAt: new Date(),
    }

    const loan = await Loan.create(loanData)
    res.status(201).json(loan)
  } catch (error) {
    console.error("Create loan error:", error)
    res
      .status(500)
      .json({ error: "Failed to create loan", details: error.message })
  }
}

// Get manager's loans
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ createdBy: req.user.userId })
    res.json(loans)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch loans" })
  }
}

// Update loan
exports.updateLoan = async (req, res) => {
  try {
    const { loanId } = req.params

    const loan = await Loan.findOneAndUpdate(
      { _id: loanId, createdBy: req.user.userId },
      req.body,
      { new: true }
    )

    if (!loan) {
      return res.status(404).json({ error: "Loan not found or unauthorized" })
    }

    res.json(loan)
  } catch (error) {
    res.status(500).json({ error: "Failed to update loan" })
  }
}

// Delete loan
exports.deleteLoan = async (req, res) => {
  try {
    const { loanId } = req.params

    const loan = await Loan.findOneAndDelete({
      _id: loanId,
      createdBy: req.user.userId,
    })

    if (!loan) {
      return res.status(404).json({ error: "Loan not found or unauthorized" })
    }

    res.json({ message: "Loan deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete loan" })
  }
}

// Get pending applications
exports.getPendingApplications = async (req, res) => {
  try {
    // First, get all loans created by this manager
    const managerLoans = await Loan.find({ createdBy: req.user.userId }).select(
      "_id"
    )
    const loanIds = managerLoans.map((loan) => loan._id)

    // Then get applications for those loans
    const applications = await Application.find({
      loanId: { $in: loanIds },
      status: "pending",
    })
      .populate("userId", "name email")
      .populate("loanId", "title category")
      .sort({ createdAt: -1 })

    res.json(applications)
  } catch (error) {
    console.error("Get pending applications error:", error)
    res.status(500).json({ error: "Failed to fetch pending applications" })
  }
}

// Get approved applications
exports.getApprovedApplications = async (req, res) => {
  try {
    // First, get all loans created by this manager
    const managerLoans = await Loan.find({ createdBy: req.user.userId }).select(
      "_id"
    )
    const loanIds = managerLoans.map((loan) => loan._id)

    // Then get applications for those loans
    const applications = await Application.find({
      loanId: { $in: loanIds },
      status: "approved",
    })
      .populate("userId", "name email")
      .populate("loanId", "title category")
      .sort({ approvedAt: -1 })

    res.json(applications)
  } catch (error) {
    console.error("Get approved applications error:", error)
    res.status(500).json({ error: "Failed to fetch approved applications" })
  }
}

// Approve application
exports.approveApplication = async (req, res) => {
  try {
    const { appId } = req.params

    // First, fetch the application and populate the loan
    const application = await Application.findById(appId).populate("loanId")

    if (!application) {
      return res.status(404).json({ error: "Application not found" })
    }

    // Verify that the loan was created by this manager
    if (
      application.loanId.createdBy.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        error:
          "Unauthorized: You can only approve applications for your own loans",
      })
    }

    // Update the application status
    application.status = "approved"
    application.approvedAt = new Date()
    application.approvedBy = req.user.userId
    await application.save()

    res.json(application)
  } catch (error) {
    console.error("Approve application error:", error)
    res.status(500).json({ error: "Failed to approve application" })
  }
}

// Reject application
exports.rejectApplication = async (req, res) => {
  try {
    const { appId } = req.params
    const { reason } = req.body

    // First, fetch the application and populate the loan
    const application = await Application.findById(appId).populate("loanId")

    if (!application) {
      return res.status(404).json({ error: "Application not found" })
    }

    // Verify that the loan was created by this manager
    if (
      application.loanId.createdBy.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        error:
          "Unauthorized: You can only reject applications for your own loans",
      })
    }

    // Update the application status
    application.status = "rejected"
    application.rejectedAt = new Date()
    application.rejectedBy = req.user.userId
    application.rejectionReason = reason
    await application.save()

    res.json(application)
  } catch (error) {
    console.error("Reject application error:", error)
    res.status(500).json({ error: "Failed to reject application" })
  }
}

// Get all borrowers (for manager's user management)
exports.getBorrowers = async (req, res) => {
  try {
    const User = require("../models/User.model")
    const borrowers = await User.find({ role: "borrower" }).select("-password")
    res.json(borrowers)
  } catch (error) {
    console.error("Get borrowers error:", error)
    res.status(500).json({ error: "Failed to fetch borrowers" })
  }
}

// Suspend borrower (manager can only suspend borrowers)
exports.suspendBorrower = async (req, res) => {
  try {
    const User = require("../models/User.model")
    const { userId } = req.params
    const { reason, duration, durationType } = req.body

    // Get target user
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Manager can only suspend borrowers
    if (targetUser.role !== "borrower") {
      return res
        .status(403)
        .json({ error: "Managers can only suspend borrowers" })
    }

    let suspendUntil = null

    // Calculate suspendUntil if duration is provided
    if (duration && durationType) {
      const now = new Date()
      const durationValue = parseInt(duration)

      switch (durationType) {
        case "minute":
          suspendUntil = new Date(now.getTime() + durationValue * 60 * 1000)
          break
        case "hour":
          suspendUntil = new Date(
            now.getTime() + durationValue * 60 * 60 * 1000
          )
          break
        case "day":
          suspendUntil = new Date(
            now.getTime() + durationValue * 24 * 60 * 60 * 1000
          )
          break
        case "week":
          suspendUntil = new Date(
            now.getTime() + durationValue * 7 * 24 * 60 * 60 * 1000
          )
          break
        case "month":
          suspendUntil = new Date(now.setMonth(now.getMonth() + durationValue))
          break
        case "permanent":
          suspendUntil = null // Permanent suspension
          break
        default:
          suspendUntil = null
      }
    }

    const updateData = {
      status: "suspended",
      suspendReason: reason || "",
      suspensionReason: reason || "",
      suspendedAt: new Date(),
      suspendUntil: suspendUntil,
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password")

    res.json(user)
  } catch (error) {
    console.error("Suspend borrower error:", error)
    res.status(500).json({ error: "Failed to suspend borrower" })
  }
}

// Unsuspend borrower
exports.unsuspendBorrower = async (req, res) => {
  try {
    const User = require("../models/User.model")
    const { userId } = req.params

    // Get target user
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Manager can only unsuspend borrowers
    if (targetUser.role !== "borrower") {
      return res
        .status(403)
        .json({ error: "Managers can only unsuspend borrowers" })
    }

    const updateData = {
      status: "active",
      suspendReason: null,
      suspensionReason: null,
      suspendedAt: null,
      suspendUntil: null,
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password")

    res.json(user)
  } catch (error) {
    console.error("Unsuspend borrower error:", error)
    res.status(500).json({ error: "Failed to unsuspend borrower" })
  }
}

module.exports = exports
