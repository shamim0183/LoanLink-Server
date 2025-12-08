const mongoose = require("mongoose")
const Loan = require("./models/Loan.model")
const User = require("./models/User.model")
const dummyLoans = require("./dummy-loans.json")
require("dotenv").config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// Seed function
const seedLoans = async () => {
  try {
    // Find an admin or manager user to use as creator
    let creator = await User.findOne({ role: "admin" })

    if (!creator) {
      creator = await User.findOne({ role: "manager" })
    }

    if (!creator) {
      // If no admin or manager, use any user
      creator = await User.findOne()
    }

    if (!creator) {
      console.error(
        "❌ No users found in database. Please create a user first."
      )
      process.exit(1)
    }

    console.log(
      `📝 Using user: ${creator.name} (${creator.role}) as loan creator`
    )

    // Clear existing loans
    const deleteResult = await Loan.deleteMany({})
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing loans`)

    // Transform dummy data to match your Loan model
    const loansToInsert = dummyLoans.map((loan) => ({
      title: loan.title,
      category: loan.category,
      interestRate: loan.interestRate,
      maxLoanLimit: loan.amount,
      duration: loan.duration,
      description: loan.description,
      minimumIncome: loan.minimumIncome || 20000,
      images: loan.imageUrl ? [loan.imageUrl] : [],
      showOnHome: true, // Show all on home initially
      createdBy: creator._id,
    }))

    // Insert loans
    const result = await Loan.insertMany(loansToInsert)
    console.log(`\n✅ Successfully inserted ${result.length} loans:\n`)

    // Display inserted loans
    result.forEach((loan, index) => {
      console.log(
        `   ${index + 1}. ${loan.title.padEnd(35)} | ${loan.category.padEnd(
          10
        )} | $${loan.maxLoanLimit.toLocaleString()}`
      )
    })

    console.log(`\n🎉 Database seeding completed successfully!`)
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding loans:", error)
    process.exit(1)
  }
}

// Run seed
seedLoans()
