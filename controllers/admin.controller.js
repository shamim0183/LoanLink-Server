const User = require("../models/User.model")
const Loan = require("../models/Loan.model")
const Application = require("../models/Application.model")

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
    const { suspended, reason } = req.body

    const user = await User.findByIdAndUpdate(
      userId,
      {
        suspended,
        suspendReason: reason || "",
        suspendedAt: suspended ? new Date() : null,
      },
      { new: true }
    ).select("-password")

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to suspend user" })
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
      .populate("user", "name email")
      .populate("loan", "title category")
      .sort({ appliedDate: -1 })

    res.json(applications)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" })
  }
}

module.exports = exports
