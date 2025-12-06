const jwt = require("jsonwebtoken")
const User = require("../models/User.model")

// Generate JWT Token
exports.generateToken = async (req, res) => {
  const { email, name, photoURL } = req.body

  try {
    let user = await User.findOne({ email })

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email,
        name: name || "Anonymous",
        photoURL: photoURL || null,
        role: "borrower",
        status: "active",
      })
    }

    // Check if user is suspended
    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Account suspended",
        reason: user.suspendReason,
        feedback: user.suspendFeedback,
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        status: user.status,
      },
    })
  } catch (error) {
    console.error("JWT Generation Error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  })

  res.status(200).json({
    success: true,
    message: "Logout successful",
  })
}
