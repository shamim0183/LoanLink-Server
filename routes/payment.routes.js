const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/payment.controller")
const { verifyToken } = require("../middleware/auth.middleware")

// Webhook route (no auth, raw body required)
router.post("/webhook", paymentController.handleStripeWebhook)

// All other routes require authentication
router.post(
  "/create-checkout-session",
  verifyToken,
  paymentController.createCheckoutSession
)
router.post("/save", verifyToken, paymentController.savePayment)
router.get("/history", verifyToken, paymentController.getPaymentHistory)
router.get(
  "/receipt/:sessionId",
  verifyToken,
  paymentController.getPaymentReceipt
)
router.post(
  "/process-session",
  verifyToken,
  paymentController.processStripeSession
)
router.get(
  "/by-application/:applicationId",
  verifyToken,
  paymentController.getPaymentByApplication
)

module.exports = router
