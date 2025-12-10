const User = require("../models/User.model")
const Loan = require("../models/Loan.model")
const Application = require("../models/LoanApplication.model")

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
}

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    // Prevent admin from changing their own role
    if (userId === req.user.userId) {
      return res.status(403).json({ error: "You cannot change your own role" })
    }

    if (!["borrower", "manager", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password")

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to update user role" })
  }
}

// Suspend/unsuspend user
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { suspended, reason, duration, durationType } = req.body

    // Prevent admin from suspending themselves
    if (userId === req.user.userId) {
      return res
        .status(403)
        .json({ error: "You cannot suspend or unsuspend yourself" })
    }

    // Get target user to check their role
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Prevent admins from suspending other admins
    if (targetUser.role === "admin") {
      return res.status(403).json({ error: "Cannot suspend admin users" })
    }

    let suspendUntil = null

    // Calculate suspendUntil if duration is provided
    if (suspended && duration && durationType) {
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
      status: suspended ? "suspended" : "active",
      suspendReason: suspended ? reason || "" : null,
      suspensionReason: suspended ? reason || "" : null,
      suspendedAt: suspended ? new Date() : null,
      suspendUntil: suspended ? suspendUntil : null,
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password")

    res.json(user)
  } catch (error) {
    console.error("Suspend user error:", error)
    res.status(500).json({ error: "Failed to suspend user" })
  }
}

// Unsuspend user
exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params

    // Prevent admin from unsuspending themselves (should not be suspended anyway)
    if (userId === req.user.userId) {
      return res.status(403).json({ error: "You cannot unsuspend yourself" })
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

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Unsuspend user error:", error)
    res.status(500).json({ error: "Failed to unsuspend user" })
  }
}

// Create new loan (admin)
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

// Get all loans (admin view)
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate("createdBy", "name email")
    res.json(loans)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch loans" })
  }
}

// Update loan
exports.updateLoan = async (req, res) => {
  try {
    const { loanId } = req.params
    const updates = req.body

    const loan = await Loan.findByIdAndUpdate(loanId, updates, { new: true })
    res.json(loan)
  } catch (error) {
    res.status(500).json({ error: "Failed to update loan" })
  }
}

// Delete loan
exports.deleteLoan = async (req, res) => {
  try {
    const { loanId } = req.params
    await Loan.findByIdAndDelete(loanId)
    res.json({ message: "Loan deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete loan" })
  }
}

// Toggle show on home
exports.toggleShowOnHome = async (req, res) => {
  try {
    const { loanId } = req.params
    const { showOnHome } = req.body

    const loan = await Loan.findByIdAndUpdate(
      loanId,
      { showOnHome },
      { new: true }
    )
    res.json(loan)
  } catch (error) {
    res.status(500).json({ error: "Failed to update loan visibility" })
  }
}

// Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("userId", "name email")
      .populate("loanId", "title category")
      .sort({ createdAt: -1 })

    res.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    res.status(500).json({ error: "Failed to fetch applications" })
  }
}

module.exports = exports
