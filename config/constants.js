/**
 * Application Constants
 * Centralized configuration values for the server
 */

module.exports = {
  // Stripe Payment Configuration
  STRIPE: {
    CURRENCY: "usd",
    APPLICATION_FEE: 10, // USD
    CENTS_MULTIPLIER: 100, // Convert dollars to cents
  },

  // Loan Status
  LOAN_STATUS: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },

  // User Roles
  USER_ROLES: {
    ADMIN: "admin",
    MANAGER: "manager",
    BORROWER: "borrower",
  },

  // Application Fee Status
  FEE_STATUS: {
    PAID: "paid",
    UNPAID: "unpaid",
  },

  // Payment Status
  PAYMENT_STATUS: {
    COMPLETED: "completed",
    PENDING: "pending",
    FAILED: "failed",
  },

  // Payment Methods
  PAYMENT_METHODS: {
    STRIPE: "stripe",
    CARD: "card",
  },
}
