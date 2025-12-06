// Input validation schemas for loan operations

const validateLoanCreation = (req, res, next) => {
  const { title, description, category, interest, maxLimit } = req.body

  const errors = []

  if (!title || title.trim().length < 3) {
    errors.push("Title must be at least 3 characters")
  }

  if (!description || description.trim().length < 10) {
    errors.push("Description must be at least 10 characters")
  }

  if (!category) {
    errors.push("Category is required")
  }

  if (!interest || interest < 0 || interest > 100) {
    errors.push("Interest rate must be between 0 and 100")
  }

  if (!maxLimit || maxLimit < 100) {
    errors.push("Max loan limit must be at least $100")
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors })
  }

  next()
}

const validateApplicationSubmission = (req, res, next) => {
  const { loanAmount, monthlyIncome, reasonForLoan } = req.body

  const errors = []

  if (!loanAmount || loanAmount < 100) {
    errors.push("Loan amount must be at least $100")
  }

  if (!monthlyIncome || monthlyIncome < 0) {
    errors.push("Monthly income must be a positive number")
  }

  if (!reasonForLoan || reasonForLoan.trim().length < 10) {
    errors.push("Reason for loan must be at least 10 characters")
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors })
  }

  next()
}

module.exports = {
  validateLoanCreation,
  validateApplicationSubmission,
}
