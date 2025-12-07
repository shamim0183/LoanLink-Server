require("dotenv").config()
const mongoose = require("mongoose")
const Loan = require("./models/Loan.model")
const dummyLoans = require("./dummy-loans.json")

const seedLoans = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing loans (optional - comment out if you want to keep existing data)
    // await Loan.deleteMany({})
    // console.log("🗑️ Cleared existing loans")

    // Insert dummy loans
    const loans = await Loan.insertMany(dummyLoans)
    console.log(`✅ Successfully inserted ${loans.length} dummy loans!`)

    // Display the loans
    loans.forEach((loan, index) => {
      console.log(
        `${index + 1}. ${loan.title} - $${loan.amount} (${loan.category})`
      )
    })

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding loans:", error)
    process.exit(1)
  }
}

seedLoans()
