// dashboardController.js (Nouveau fichier de contrôleur pour le tableau de bord)
const transactionModel = require('../models/transactionModel'); // Assurez-vous du bon chemin
const redis = require('../redisClient');

exports.getMonthlyTransactions = async (req, res) => {
    const CACHE_KEY = 'dashboard:monthly';
    try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
            console.log("Données mensuelles récupérées depuis Redis");
            return res.json(JSON.parse(cachedData));
        }
        const data = await transactionModel.getTransactionsByMonth();
        await redis.setEx(CACHE_KEY, 300, JSON.stringify(data)); // Cache pour 5 minutes
        res.json(data);
    } catch (error) {
        console.error("Erreur dans getMonthlyTransactions:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des transactions mensuelles" });
    }
};

exports.getQuarterlyTransactions = async (req, res) => {
    const CACHE_KEY = 'dashboard:quarterly';
    try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
            console.log("Données trimestrielles récupérées depuis Redis");
            return res.json(JSON.parse(cachedData));
        }
        const data = await transactionModel.getTransactionsByQuarter();
        await redis.setEx(CACHE_KEY, 300, JSON.stringify(data));
        res.json(data);
    } catch (error) {
        console.error("Erreur dans getQuarterlyTransactions:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des transactions trimestrielles" });
    }
};

exports.getSemesterTransactions = async (req, res) => {
    const CACHE_KEY = 'dashboard:semester';
    try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
            console.log("Données semestrielles récupérées depuis Redis");
            return res.json(JSON.parse(cachedData));
        }
        const data = await transactionModel.getTransactionsBySemester();
        await redis.setEx(CACHE_KEY, 300, JSON.stringify(data));
        res.json(data);
    } catch (error) {
        console.error("Erreur dans getSemesterTransactions:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des transactions semestrielles" });
    }
};

exports.getYearlyTransactions = async (req, res) => {
    const CACHE_KEY = 'dashboard:yearly';
    try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
            console.log("Données annuelles récupérées depuis Redis");
            return res.json(JSON.parse(cachedData));
        }
        const data = await transactionModel.getTransactionsByYear();
        await redis.setEx(CACHE_KEY, 300, JSON.stringify(data));
        res.json(data);
    } catch (error) {
        console.error("Erreur dans getYearlyTransactions:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des transactions annuelles" });
    }
};

exports.getTransactionsByType = async (req, res) => {
    const period = req.query.period || 'all'; // Permet de filtrer par période (ex: ?period=month)
    const CACHE_KEY = `dashboard:type:${period}`;
    try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
            console.log("Données par type récupérées depuis Redis");
            return res.json(JSON.parse(cachedData));
        }
        const data = await transactionModel.getTransactionsByType(period);
        await redis.setEx(CACHE_KEY, 300, JSON.stringify(data));
        res.json(data);
    } catch (error) {
        console.error("Erreur dans getTransactionsByType:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des transactions par type" });
    }
};