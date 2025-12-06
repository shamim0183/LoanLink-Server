const LoanApplication = require("../models/LoanApplication.model")
const User = require("../models/User.model")

// Create loan application
exports.createApplication = async (req, res) => {
  try {
    const {
      loanId,
      loanTitle,
      interestRate,
      firstName,
      lastName,
      contactNumber,
      nationalId,
      incomeSource,
      monthlyIncome,
      loanAmount,
      reason,
      address,
      extraNotes,
      transactionId,
    } = req.body

    const application = await LoanApplication.create({
      userEmail: req.user.email,
      userId: req.user.userId,
      loanId,
      loanTitle,
      interestRate,
      firstName,
      lastName,
      contactNumber,
      nationalId,
      incomeSource,
      monthlyIncome,
      loanAmount,
      reason,
      address,
      extraNotes: extraNotes || "",
      applicationFeeStatus: "paid", // Since payment is done before submission
      status: "pending",
    })

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    })
  } catch (error) {
    console.error("Create application error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    })
  }
}

// Get user's applications (Borrower)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({
      userId: req.user.userId,
    })
      .populate("loanId", "title category images")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Get applications error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    })
  }
}

// Get all applications (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}

    const applications = await LoanApplication.find(filter)
      .populate("userId", "name email photoURL")
      .populate("loanId", "title category")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Get all applications error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    })
  }
}

// Get pending applications for manager's loans (Manager)
exports.getPendingApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({
      status: "pending",
    })
      .populate("userId", "name email photoURL")
      .populate("loanId", "title category createdBy")
      .sort({ createdAt: -1 })

    // Filter to only show applications for loans created by this manager
    const managerApplications = applications.filter(
      (app) => app.loanId?.createdBy?.toString() === req.user.userId
    )

    res.status(200).json({
      success: true,
      applications: managerApplications,
    })
  } catch (error) {
    console.error("Get pending applications error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending applications",
      error: error.message,
    })
  }
}

// Approve application (Manager/Admin)
exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params

    const application = await LoanApplication.findById(id).populate("loanId")

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      })
    }

    // Check if manager owns the loan
    if (
      req.user.role === "manager" &&
      application.loanId.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only approve applications for your loans",
      })
    }

    application.status = "approved"
    application.approvedAt = new Date()
    await application.save()

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      application,
    })
  } catch (error) {
    console.error("Approve application error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to approve application",
      error: error.message,
    })
  }
}

// Reject application (Manager/Admin)
exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params

    const application = await LoanApplication.findById(id).populate("loanId")

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      })
    }

    // Check if manager owns the loan
    if (
      req.user.role === "manager" &&
      application.loanId.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only reject applications for your loans",
      })
    }

    application.status = "rejected"
    application.rejectedAt = new Date()
    await application.save()

    res.status(200).json({
      success: true,
      message: "Application rejected",
      application,
    })
  } catch (error) {
    console.error("Reject application error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to reject application",
      error: error.message,
    })
  }
}

// Cancel application (Borrower - only if pending)
exports.cancelApplication = async (req, res) => {
  try {
    const { id } = req.params

    const application = await LoanApplication.findById(id)

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      })
    }

    // Check ownership
    if (application.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      })
    }

    // Can only cancel pending applications
    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only cancel pending applications",
      })
    }

    application.status = "cancelled"
    application.cancelledAt = new Date()
    await application.save()

    res.status(200).json({
      success: true,
      message: "Application cancelled",
      application,
    })
  } catch (error) {
    console.error("Cancel application error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel application",
      error: error.message,
    })
  }
}
