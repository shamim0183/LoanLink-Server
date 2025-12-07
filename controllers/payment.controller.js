const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Payment = require("../models/Payment.model")

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
              name: `Loan Application Fee - ${loanTitle}`,
              description: `Application fee for ${loanTitle} loan of $${applicationData.loanAmount}`,
              images: applicationData.loanImage
                ? [applicationData.loanImage]
                : [],
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/apply-loan/${loanId}`,
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

    const payment = await Payment.findOne({ stripeSessionId: sessionId })
      .populate("userId", "name email photoURL")
      .populate("loanId", "title category amount interestRate")
      .populate("applicationId")

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Verify user owns this payment
    if (payment.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
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

    const payment = await Payment.findOne({ applicationId })
      .populate("userId", "name email photoURL")
      .populate("loanId", "title category amount interestRate")
      .populate("applicationId")

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this application",
      })
    }

    // Verify user owns this payment
    if (payment.userId._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
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
      await Payment.create({
        userEmail: session.metadata.userEmail,
        userId: session.metadata.userId,
        applicationId: application._id,
        loanId: session.metadata.loanId,
        amount: session.amount_total / 100, // Convert from cents
        transactionId: session.payment_intent,
        stripeSessionId: session.id,
        status: "completed",
        paymentMethod: "stripe",
      })

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

    const payment = await Payment.findOne({ stripeSessionId: sessionId })
      .populate("loanId", "title category interestRate maxLoanLimit")
      .populate("applicationId")
      .populate("userId", "name email")

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment receipt not found",
      })
    }

    // Ensure the user can only access their own receipt
    if (payment.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
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
      application = await LoanApplication.create({
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
      const populatedPayment = await Payment.findById(existingPaymentByTxn._id)
        .populate("userId", "name email photoURL")
        .populate("loanId", "title category amount interestRate")
        .populate("applicationId")

      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        payment: populatedPayment,
      })
    }

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
