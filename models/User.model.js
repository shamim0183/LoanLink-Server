const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "borrower"],
      // No default - will be set during registration or via role modal for OAuth users
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    suspendReason: {
      type: String,
      default: null,
    },
    suspendFeedback: {
      type: String,
      default: null,
    },
    firebaseUID: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("User", userSchema)
