/**
 * Payment Helper Functions
 * Reusable utilities for payment processing
 */

/**
 * Populate payment with related data
 * @param {Query} query - Mongoose query object
 * @returns {Query} Populated query
 */
exports.populatePaymentDetails = (query) => {
  return query
    .populate("userId", "name email photoURL")
    .populate("loanId", "title category amount interestRate")
    .populate("applicationId")
}

/**
 * Verify payment ownership
 * @param {Object} payment - Payment document with populated userId
 * @param {String} userId - Current user's ID
 * @throws {Error} If unauthorized
 */
exports.verifyPaymentOwnership = (payment, userId) => {
  if (payment.userId._id.toString() !== userId.toString()) {
    const error = new Error("Unauthorized")
    error.status = 403
    error.success = false
    throw error
  }
}

/**
 * Create loan application from Stripe session
 * @param {Model} LoanApplication - LoanApplication model
 * @param {Object} session - Stripe session object
 * @param {Object} applicationData - Parsed application data
 * @returns {Promise<Document>} Created application
 */
exports.createApplicationFromSession = async (
  LoanApplication,
  session,
  applicationData
) => {
  return await LoanApplication.create({
    userEmail: session.metadata.userEmail,
    userId: session.metadata.userId,
    loanId: session.metadata.loanId,
    loanTitle: session.metadata.loanTitle,
    interestRate: applicationData.interestRate || 0,
    firstName: applicationData.firstName,
    lastName: applicationData.lastName,
    contactNumber: applicationData.contactNumber,
    nationalId: applicationData.nationalId,
    incomeSource: applicationData.incomeSource,
    monthlyIncome: applicationData.monthlyIncome,
    loanAmount: applicationData.loanAmount,
    reason: applicationData.reason,
    address: applicationData.address,
    extraNotes: applicationData.extraNotes || "",
    status: "pending",
    applicationFeeStatus: "paid",
  })
}

/**
 * Create payment record from Stripe session
 * @param {Model} Payment - Payment model
 * @param {Object} session - Stripe session object
 * @param {String} applicationId - Application ID
 * @returns {Promise<Document>} Created payment
 */
exports.createPaymentFromSession = async (Payment, session, applicationId) => {
  return await Payment.create({
    userEmail: session.metadata.userEmail,
    userId: session.metadata.userId,
    applicationId,
    loanId: session.metadata.loanId,
    amount: session.amount_total / 100, // Convert from cents
    transactionId: session.payment_intent,
    stripeSessionId: session.id,
    status: "completed",
    paymentMethod: "stripe",
  })
}
