const mongoose = require("mongoose")

const loanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },
    maxLoanLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    requiredDocuments: [
      {
        type: String,
      },
    ],
    emiPlans: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    showOnHome: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add indexes for query optimization
// Compound index for showOnHome + createdAt (used in getHomeLoans query)
loanSchema.index({ showOnHome: 1, createdAt: -1 })

// Index on createdBy for faster populate operations
loanSchema.index({ createdBy: 1 })

module.exports = mongoose.model("Loan", loanSchema)
