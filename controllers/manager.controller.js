const Loan = require("../models/Loan.model")
const Application = require("../models/Application.model")

// Create new loan
exports.createLoan = async (req, res) => {
  try {
    const loanData = {
      ...req.body,
      createdBy: req.userId,
      createdAt: new Date(),
    }

    const loan = await Loan.create(loanData)
    res.status(201).json(loan)
  } catch (error) {
    res.status(500).json({ error: "Failed to create loan" })
  }
}

// Get manager's loans
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ createdBy: req.userId })
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
      { _id: loanId, createdBy: req.userId },
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
      createdBy: req.userId,
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
    const applications = await Application.find({ status: "Pending" })
      .populate("user", "name email")
      .populate("loan", "title category")
      .sort({ appliedDate: -1 })

    res.json(applications)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending applications" })
  }
}

// Get approved applications
exports.getApprovedApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: "Approved" })
      .populate("user", "name email")
      .populate("loan", "title category")
      .sort({ approvedAt: -1 })

    res.json(applications)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch approved applications" })
  }
}

// Approve application
exports.approveApplication = async (req, res) => {
  try {
    const { appId } = req.params

    const application = await Application.findByIdAndUpdate(
      appId,
      {
        status: "Approved",
        approvedAt: new Date(),
        approvedBy: req.userId,
      },
      { new: true }
    )

    res.json(application)
  } catch (error) {
    res.status(500).json({ error: "Failed to approve application" })
  }
}

// Reject application
exports.rejectApplication = async (req, res) => {
  try {
    const { appId } = req.params
    const { reason } = req.body

    const application = await Application.findByIdAndUpdate(
      appId,
      {
        status: "Rejected",
        rejectedAt: new Date(),
        rejectedBy: req.userId,
        rejectionReason: reason,
      },
      { new: true }
    )

    res.json(application)
  } catch (error) {
    res.status(500).json({ error: "Failed to reject application" })
  }
}

module.exports = exports
