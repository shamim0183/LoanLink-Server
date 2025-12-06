const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/payment.controller")
const { verifyToken } = require("../middleware/auth.middleware")

// All routes require authentication
router.post(
  "/create-intent",
  verifyToken,
  paymentController.createPaymentIntent
)
router.post("/save", verifyToken, paymentController.savePayment)
router.get("/history", verifyToken, paymentController.getPaymentHistory)

module.exports = router
