const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const { verifyToken } = require("../middleware/auth.middleware")

// POST /api/auth/jwt - Generate JWT token
router.post("/jwt", authController.generateToken)

// POST /api/auth/logout - Logout and clear cookie
router.post("/logout", authController.logout)

// PATCH /api/auth/update-profile - Update user profile (name and photoURL)
router.patch("/update-profile", verifyToken, authController.updateProfile)

// PATCH /api/auth/update-role - Update user role (for OAuth users)
router.patch("/update-role", verifyToken, authController.updateRole)

module.exports = router
