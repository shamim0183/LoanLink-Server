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

    req.user = {
      email: decoded.email,
      role: decoded.role,
      userId: user?._id,
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
