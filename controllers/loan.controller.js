const Loan = require("../models/Loan.model")

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      loans,
    })
  } catch (error) {
    console.error("Get loans error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch loans",
      error: error.message,
    })
  }
}

// Get loans for homepage (showOnHome = true)
exports.getHomeLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ showOnHome: true })
      .populate("createdBy", "name email")
      .limit(6)
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      loans,
    })
  } catch (error) {
    console.error("Get home loans error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch home loans",
      error: error.message,
    })
  }
}

// Get single loan by ID
exports.getLoanById = async (req, res) => {
  try {
    const { id } = req.params
    const loan = await Loan.findById(id).populate("createdBy", "name email")

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      })
    }

    res.status(200).json({
      success: true,
      loan,
    })
  } catch (error) {
    console.error("Get loan error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan",
      error: error.message,
    })
  }
}

// Create new loan (Manager/Admin only)
exports.createLoan = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      interestRate,
      maxLoanLimit,
      requiredDocuments,
      emiPlans,
      images,
    } = req.body

    const loan = await Loan.create({
      title,
      description,
      category,
      interestRate,
      maxLoanLimit,
      requiredDocuments,
      emiPlans,
      images,
      createdBy: req.user.userId,
    })

    res.status(201).json({
      success: true,
      message: "Loan created successfully",
      loan,
    })
  } catch (error) {
    console.error("Create loan error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create loan",
      error: error.message,
    })
  }
}

// Update loan (Manager/Admin)
exports.updateLoan = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const loan = await Loan.findById(id)

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      })
    }

    // Check if user owns this loan (if manager) or is admin
    if (
      req.user.role === "manager" &&
      loan.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own loans",
      })
    }

    const updatedLoan = await Loan.findByIdAndUpdate(id, updates, { new: true })

    res.status(200).json({
      success: true,
      message: "Loan updated successfully",
      loan: updatedLoan,
    })
  } catch (error) {
    console.error("Update loan error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update loan",
      error: error.message,
    })
  }
}

// Delete loan (Manager/Admin)
exports.deleteLoan = async (req, res) => {
  try {
    const { id } = req.params

    const loan = await Loan.findById(id)

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      })
    }

    // Check if user owns this loan (if manager) or is admin
    if (
      req.user.role === "manager" &&
      loan.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own loans",
      })
    }

    await Loan.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "Loan deleted successfully",
    })
  } catch (error) {
    console.error("Delete loan error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete loan",
      error: error.message,
    })
  }
}

// Toggle showOnHome (Admin only)
exports.toggleShowOnHome = async (req, res) => {
  try {
    const { id } = req.params

    const loan = await Loan.findById(id)

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      })
    }

    loan.showOnHome = !loan.showOnHome
    await loan.save()

    res.status(200).json({
      success: true,
      message: `Loan ${loan.showOnHome ? "shown on" : "hidden from"} homepage`,
      loan,
    })
  } catch (error) {
    console.error("Toggle showOnHome error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to toggle loan visibility",
      error: error.message,
    })
  }
}
