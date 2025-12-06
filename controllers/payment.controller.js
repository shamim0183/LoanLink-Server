const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Payment = require("../models/Payment.model")

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, applicationData } = req.body

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: {
        userEmail: req.user.email,
        userId: req.user.userId,
        applicantName: `${applicationData.firstName} ${applicationData.lastName}`,
      },
    })

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Payment intent error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message,
    })
  }
}

// Save payment record
exports.savePayment = async (req, res) => {
  try {
    const { applicationId, loanId, amount, transactionId } = req.body

    const payment = await Payment.create({
      userEmail: req.user.email,
      userId: req.user.userId,
      applicationId,
      loanId,
      amount,
      transactionId,
      status: "completed",
    })

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment,
    })
  } catch (error) {
    console.error("Save payment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to save payment",
      error: error.message,
    })
  }
}

// Get user's payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId })
      .populate("loanId", "title category")
      .populate("applicationId", "status")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      payments,
    })
  } catch (error) {
    console.error("Get payment history error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    })
  }
}
