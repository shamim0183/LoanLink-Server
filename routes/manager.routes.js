const express = require("express")
const router = express.Router()
const managerController = require("../controllers/manager.controller")
const { authenticateToken } = require("../middleware/auth.middleware")
const { isManager } = require("../middleware/role.middleware")

// Middleware to protect all manager routes
router.use(authenticateToken, isManager)

// Loan management routes
router.post("/loans", managerController.createLoan)
router.get("/my-loans", managerController.getMyLoans)
router.patch("/loans/:loanId", managerController.updateLoan)
router.delete("/loans/:loanId", managerController.deleteLoan)

// Application management routes
router.get("/applications/pending", managerController.getPendingApplications)
router.get("/applications/approved", managerController.getApprovedApplications)
router.patch(
  "/applications/:appId/approve",
  managerController.approveApplication
)
router.patch("/applications/:appId/reject", managerController.rejectApplication)

module.exports = router
