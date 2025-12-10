const express = require("express")
const router = express.Router()
const managerController = require("../controllers/manager.controller")
const {
  verifyToken,
  checkNotSuspended,
} = require("../middleware/auth.middleware")
const { isManager } = require("../middleware/role.middleware")

// Middleware to protect all manager routes
router.use(verifyToken, isManager)

// Loan management routes (suspended managers cannot perform these)
router.post("/loans", checkNotSuspended, managerController.createLoan)
router.get("/my-loans", managerController.getMyLoans) // Can view their loans
router.patch("/loans/:loanId", checkNotSuspended, managerController.updateLoan)
router.delete("/loans/:loanId", checkNotSuspended, managerController.deleteLoan)

// Application management routes (suspended managers cannot approve/reject)
router.get("/applications/pending", managerController.getPendingApplications) // Can view
router.get("/applications/approved", managerController.getApprovedApplications) // Can view
router.patch(
  "/applications/:appId/approve",
  checkNotSuspended,
  managerController.approveApplication
)
router.patch(
  "/applications/:appId/reject",
  checkNotSuspended,
  managerController.rejectApplication
)

// Borrower management routes (suspended managers cannot suspend borrowers)
router.get("/borrowers", managerController.getBorrowers) // Can view
router.patch(
  "/borrowers/:userId/suspend",
  checkNotSuspended,
  managerController.suspendBorrower
)
router.patch(
  "/borrowers/:userId/unsuspend",
  checkNotSuspended,
  managerController.unsuspendBorrower
)

module.exports = router
