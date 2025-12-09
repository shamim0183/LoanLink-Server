const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized access - No token provided" })
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" })
    }

    // Find user to get userId
    const User = require("../models/User.model")
    const user = await User.findOne({ email: decoded.email })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Auto-unsuspend if suspension has expired
    if (user.suspendUntil && new Date() >= user.suspendUntil) {
      await User.findByIdAndUpdate(user._id, {
        status: "active",
        suspendReason: null,
        suspensionReason: null,
        suspendedAt: null,
        suspendUntil: null,
      })
      // Refresh user data
      user.status = "active"
      user.suspendUntil = null
      user.suspensionReason = null
    }

    req.user = {
      email: decoded.email,
      role: decoded.role,
      userId: user?._id,
      suspendUntil: user.suspendUntil,
      suspensionReason: user.suspensionReason,
      isSuspended: user.isSuspended,
    }
    next()
  })
}

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access only" })
  }
  next()
}

const verifyManager = (req, res, next) => {
  if (req.user.role !== "manager" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Manager or Admin access only" })
  }
  next()
}

const verifyBorrower = (req, res, next) => {
  if (req.user.role !== "borrower") {
    return res.status(403).json({ message: "Forbidden: Borrower access only" })
  }
  next()
}

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyManager,
  verifyBorrower,
}
