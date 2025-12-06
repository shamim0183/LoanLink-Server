const mongoose = require("mongoose")

const loanApplicationSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
    loanTitle: {
      type: String,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    nationalId: {
      type: String,
      required: true,
    },
    incomeSource: {
      type: String,
      required: true,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    extraNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    applicationFeeStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("LoanApplication", loanApplicationSchema)
