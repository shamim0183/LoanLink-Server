const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const { authenticateToken } = require("../middleware/auth.middleware")
const { isAdmin } = require("../middleware/role.middleware")

// Middleware to protect all admin routes
router.use(authenticateToken, isAdmin)

// User management routes
router.get("/users", adminController.getAllUsers)
router.patch("/users/:userId/role", adminController.updateUserRole)
router.patch("/users/:userId/suspend", adminController.suspendUser)

// Loan management routes
router.get("/loans", adminController.getAllLoans)
router.patch("/loans/:loanId", adminController.updateLoan)
router.delete("/loans/:loanId", adminController.deleteLoan)
router.patch("/loans/:loanId/show-home", adminController.toggleShowOnHome)

// Application management routes
router.get("/applications", adminController.getAllApplications)

module.exports = router
