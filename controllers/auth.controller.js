const jwt = require("jsonwebtoken")
const User = require("../models/User.model")

// Generate JWT Token
exports.generateToken = async (req, res) => {
  let { email, name, photoURL, uid } = req.body

  try {
    // Handle GitHub users without public email
    if (!email && uid) {
      email = `github_${uid}@loanlink.local`
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email or UID is required",
      })
    }

    let user = await User.findOne({ email })

    // If user doesn't exist, only create for OAuth logins (has photoURL or uid)
    // Regular email/password users must complete registration first
    if (!user) {
      // Check if this is an OAuth login (has photoURL from provider or GitHub uid)
      const isOAuthLogin = photoURL || uid

      if (isOAuthLogin) {
        // Auto-create OAuth users WITHOUT a role - this triggers role selection modal
        user = await User.create({
          email,
          name: name || "Anonymous",
          photoURL: photoURL || null,
          // Don't set role - will trigger role selection modal on first login
          status: "active",
          firebaseUID: uid || null,
        })
      } else {
        // Email/password users must register first
        return res.status(404).json({
          success: false,
          message: "User not found. Please complete registration first.",
        })
      }
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
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

// Update Profile (name, photoURL, and role during registration)
exports.updateProfile = async (req, res) => {
  const { name, photoURL, role } = req.body
  const { email } = req.user // From auth middleware

  try {
    const updateData = {
      name: name || user.name,
      photoURL: photoURL !== undefined ? photoURL : user.photoURL,
    }

    // Allow role update only if it's a valid role (borrower or manager)
    // This is primarily for registration flow
    if (role && ["borrower", "manager"].includes(role)) {
      updateData.role = role
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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
    console.error("Profile Update Error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update Role (for OAuth users)
exports.updateRole = async (req, res) => {
  const { role } = req.body
  const { email } = req.user // From auth middleware

  try {
    if (!["borrower", "manager"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'borrower' or 'manager'",
      })
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role } },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
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
    console.error("Role Update Error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
