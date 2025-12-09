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
    suspensionReason: {
      type: String,
      default: null,
    },
    suspendFeedback: {
      type: String,
      default: null,
    },
    suspendUntil: {
      type: Date,
      default: null, // null = permanent suspension or not suspended
    },
    firebaseUID: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual field to check if user is currently suspended
userSchema.virtual("isSuspended").get(function () {
  if (!this.suspendUntil) return false
  return new Date() < this.suspendUntil
})

module.exports = mongoose.model("User", userSchema)
