const express = require("express")
const router = express.Router()
const loanController = require("../controllers/loan.controller")
const {
  verifyToken,
  verifyAdmin,
  verifyManager,
} = require("../middleware/auth.middleware")

// Public routes
router.get("/", loanController.getAllLoans)
router.get("/home", loanController.getHomeLoans)
router.get("/featured", loanController.getHomeLoans) // Alias for featured loans
router.get("/:id", loanController.getLoanById)

// Manager/Admin routes
router.post("/", verifyToken, verifyManager, loanController.createLoan)
router.put("/:id", verifyToken, verifyManager, loanController.updateLoan)
router.delete("/:id", verifyToken, verifyManager, loanController.deleteLoan)

// Admin only routes
router.patch(
  "/:id/toggle-home",
  verifyToken,
  verifyAdmin,
  loanController.toggleShowOnHome
)

module.exports = router
