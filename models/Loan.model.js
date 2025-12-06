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

module.exports = mongoose.model("Loan", loanSchema)
