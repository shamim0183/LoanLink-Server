const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Payment = require("../models/Payment.model")
const {
  populatePaymentDetails,
  verifyPaymentOwnership,
  createApplicationFromSession,
  createPaymentFromSession,
} = require("../utils/paymentHelpers")

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, applicationData, loanId, loanTitle } = req.body

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: req.user.email, // Pre-fill customer email
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${loanTitle} - Application Fee`,
              description: `Processing fee for ${loanTitle} loan of $${applicationData.loanAmount.toLocaleString()}`,
              images: applicationData.loanImage
                ? [applicationData.loanImage]
                : [], // Show loan image
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: {
        userEmail: req.user.email,
        userId: req.user.userId.toString(), // Convert ObjectId to string
        loanId,
        loanTitle,
        applicantName: `${applicationData.firstName} ${applicationData.lastName}`,
        applicationData: JSON.stringify(applicationData),
      },
    })

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("❌ Checkout session error:", error.message)
    console.error("Full error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
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

// Get Payment Receipt by Session ID
exports.getPaymentReceipt = async (req, res) => {
  try {
    const { sessionId } = req.params

    const payment = await populatePaymentDetails(
      Payment.findOne({ stripeSessionId: sessionId })
    )

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Verify user owns this payment
    try {
      verifyPaymentOwnership(payment, req.user.userId)
    } catch (error) {
      return res.status(error.status || 403).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error("Get payment receipt error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment receipt",
      error: error.message,
    })
  }
}

// Get Payment by Application ID
exports.getPaymentByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params

    const payment = await populatePaymentDetails(
      Payment.findOne({ applicationId })
    )

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this application",
      })
    }

    // Verify user owns this payment
    try {
      verifyPaymentOwnership(payment, req.user.userId)
    } catch (error) {
      return res.status(error.status || 403).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error("Get payment by application error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    })
  }
}

// Stripe Webhook Handler
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    // DEVELOPMENT MODE: Skip signature verification if no secret is set
    if (!endpointSecret) {
      console.warn(
        "⚠️ WARNING: Webhook signature verification is disabled (no STRIPE_WEBHOOK_SECRET)"
      )
      // Parse the raw body as JSON since we're using express.raw() for this route
      event = JSON.parse(req.body.toString())
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    try {
      const LoanApplication = require("../models/LoanApplication.model")

      // Parse application data from metadata
      const applicationData = JSON.parse(session.metadata.applicationData)

      // Create loan application
      const application = await createApplicationFromSession(
        LoanApplication,
        session,
        applicationData
      )

      // Create payment record
      await createPaymentFromSession(Payment, session, application._id)

      console.log("✅ Payment and application created successfully")
    } catch (error) {
      console.error("Error processing webhook:", error)
      return res.status(500).json({ error: "Failed to process payment" })
    }
  }

  res.json({ received: true })
}

// Get Payment Receipt by Session ID
exports.getPaymentReceipt = async (req, res) => {
  try {
    const { sessionId } = req.params

    const payment = await populatePaymentDetails(
      Payment.findOne({ stripeSessionId: sessionId })
    )

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment receipt not found",
      })
    }

    // Ensure the user can only access their own receipt
    try {
      verifyPaymentOwnership(payment, req.user.userId)
    } catch (error) {
      return res.status(error.status || 403).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error("Get payment receipt error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment receipt",
      error: error.message,
    })
  }
}
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
      const populatedPayment = await populatePaymentDetails(
        Payment.findById(existingPayment._id)
      )

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

    // Check if application already exists for this session
    const existingApplication = await LoanApplication.findOne({
      userEmail: session.metadata.userEmail,
      loanId: session.metadata.loanId,
      firstName: applicationData.firstName,
      lastName: applicationData.lastName,
      applicationFeeStatus: "paid",
    })

    let application
    if (existingApplication) {
      console.log("✅ Application already exists, using existing one")
      application = existingApplication
    } else {
      // Create loan application
      application = await createApplicationFromSession(
        LoanApplication,
        session,
        applicationData
      )
      console.log("✅ Created new loan application")
    }

    // Check if payment with this transaction ID already exists (handles React dev mode double-call)
    const existingPaymentByTxn = await Payment.findOne({
      transactionId: session.payment_intent,
    })

    if (existingPaymentByTxn) {
      console.log(
        "✅ Payment already exists for this transaction, returning existing"
      )
      const populatedPayment = await populatePaymentDetails(
        Payment.findById(existingPaymentByTxn._id)
      )

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        payment: populatedPayment,
      })
    }

    // Create payment record
    const payment = await createPaymentFromSession(
      Payment,
      session,
      application._id
    )

    // Populate payment data
    const populatedPayment = await populatePaymentDetails(
      Payment.findById(payment._id)
    )

    console.log(
      "✅ Payment and application created successfully via session processing"
    )

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment: populatedPayment,
    })
  } catch (error) {
    console.error("❌ Process session error:", error.message)
    console.error("Stack trace:", error.stack)
    console.error("Full error object:", error)
    res.status(500).json({
      success: false,
      message: "Failed to process payment session",
      error: error.message,
    })
  }
}
