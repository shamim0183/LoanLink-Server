/**
 * Role-based authorization middleware
 * Used to restrict routes based on user roles (admin, manager, borrower)
 */

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." })
  }
  next()
}

exports.isManager = (req, res, next) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Manager only." })
  }
  next()
}

exports.isBorrower = (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ error: "Access denied." })
  }
  next()
}
