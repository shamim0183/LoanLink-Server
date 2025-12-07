// Process Stripe Session (for testing without webhook)
exports.processStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.body
    const LoanApplication = require("../models/LoanApplication.model")

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      stripeSessionId: sessionId,
    })
    if (existingPayment) {
      const populatedPayment = await Payment.findById(existingPayment._id)
        .populate("userId", "name email photoURL")
        .populate("loanId", "title category amount interestRate")
        .populate("applicationId")

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        payment: populatedPayment,
      })
    }

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      })
    }

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

    // Populate payment data
    const populatedPayment = await Payment.findById(payment._id)
      .populate("userId", "name email photoURL")
      .populate("loanId", "title category amount interestRate")
      .populate("applicationId")

    console.log(
      "✅ Payment and application created successfully via session processing"
    )

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment: populatedPayment,
    })
  } catch (error) {
    console.error("Process session error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to process payment session",
      error: error.message,
    })
  }
}
