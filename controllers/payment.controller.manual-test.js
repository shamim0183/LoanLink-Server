// DEVELOPMENT ONLY: Manual webhook trigger for testing without Stripe CLI
exports.manualWebhookTest = async (req, res) => {
  try {
    const { sessionId } = req.body

    // Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      })
    }

    const LoanApplication = require("../models/LoanApplication.model")

    // Parse application data from metadata
    const applicationData = JSON.parse(session.metadata.applicationData)

    // Create loan application
    const application = await LoanApplication.create({
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

    // Create payment record
    const payment = await Payment.create({
      userEmail: session.metadata.userEmail,
      userId: session.metadata.userId,
      applicationId: application._id,
      loanId: session.metadata.loanId,
      amount: session.amount_total / 100,
      transactionId: session.payment_intent,
      stripeSessionId: session.id,
      status: "completed",
      paymentMethod: "stripe",
    })

    res.status(201).json({
      success: true,
      message: "Data saved successfully",
      payment,
      application,
    })
  } catch (error) {
    console.error("Manual webhook error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to save data",
      error: error.message,
    })
  }
}
