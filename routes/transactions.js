const express = require("express")
const router = express.Router()
const { 
    getMonthlyTransactions, 
    getQuarterlyTransactions, 
    getSemesterTransactions,
    getYearlyTransactions,
    getTransactionsByType
} = require("../controllers/transactionController")

router.get("/transactions-par-mois", getMonthlyTransactions)
router.get("/transactions-trimestrielles", getQuarterlyTransactions)
router.get("/transactions-semestrielles", getSemesterTransactions)
router.get("/transactions-annuelles", getYearlyTransactions)
router.get("/transactions-par-type", getTransactionsByType)

module.exports = router