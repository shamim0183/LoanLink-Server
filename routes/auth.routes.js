const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")

// POST /api/auth/jwt - Generate JWT token
router.post("/jwt", authController.generateToken)

// POST /api/auth/logout - Logout and clear cookie
router.post("/logout", authController.logout)

module.exports = router
