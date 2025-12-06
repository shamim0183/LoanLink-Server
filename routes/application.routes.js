const express = require("express")
const router = express.Router()
const applicationController = require("../controllers/application.controller")
const {
  verifyToken,
  verifyAdmin,
  verifyManager,
} = require("../middleware/auth.middleware")

// Borrower routes
router.post("/", verifyToken, applicationController.createApplication)
router.get(
  "/my-applications",
  verifyToken,
  applicationController.getMyApplications
)
router.patch(
  "/:id/cancel",
  verifyToken,
  applicationController.cancelApplication
)

// Manager routes
router.get(
  "/pending",
  verifyToken,
  verifyManager,
  applicationController.getPendingApplications
)
router.patch(
  "/:id/approve",
  verifyToken,
  verifyManager,
  applicationController.approveApplication
)
router.patch(
  "/:id/reject",
  verifyToken,
  verifyManager,
  applicationController.rejectApplication
)

// Admin routes
router.get(
  "/all",
  verifyToken,
  verifyAdmin,
  applicationController.getAllApplications
)

module.exports = router
