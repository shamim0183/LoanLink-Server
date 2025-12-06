// Role-based middleware for authorization

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." })
  }
  next()
}

// Check if user is manager or admin
exports.isManager = (req, res, next) => {
  if (req.userRole !== "manager" && req.userRole !== "admin") {
    return res.status(403).json({ error: "Access denied. Manager only." })
  }
  next()
}

// Check if user is borrower
exports.isBorrower = (req, res, next) => {
  if (!req.userRole) {
    return res.status(403).json({ error: "Access denied." })
  }
  next()
}
