# API Testing Guide

## Using Postman/Thunder Client

### 1. Register User

```
POST /api/auth/register
Body: {
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123",
  "role": "borrower"
}
```

### 2. Login

```
POST /api/auth/login
Body: {
  "email": "test@example.com",
  "password": "Test123"
}
```

### 3. Get All Loans

```
GET /api/loans
```

### 4. Apply for Loan

```
POST /api/applications
Body: {
  "loanId": "...",
  "loanAmount": 5000,
  ...
}
```

For full API documentation, see README.md
