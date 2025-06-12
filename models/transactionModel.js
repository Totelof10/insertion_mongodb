const { getDB } = require('../mongoDb'); // Assurez-vous que le chemin vers votre db.js est correct
const COLLECTION = 'clients'; // Le nom de votre collection de clients

// Fonction utilitaire pour obtenir la date de début d'une période (utile pour filtrer)
const getStartDate = (period) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0); // Réinitialiser l'heure pour éviter des problèmes de fuseau horaire

    switch (period) {
        case 'year':
            date.setUTCFullYear(date.getUTCFullYear() - 1); // Il y a un an
            break;
        case 'semester':
            date.setUTCMonth(date.getUTCMonth() - 6); // Il y a six mois
            break;
        case 'quarter':
            date.setUTCMonth(date.getUTCMonth() - 3); // Il y a trois mois
            break;
        case 'month':
            date.setUTCMonth(date.getUTCMonth() - 1); // Il y a un mois
            break;
        default:
            // Pour toutes les transactions si aucune période spécifiée, ou pour une période très large
            date.setUTCFullYear(date.getUTCFullYear() - 5); // Ex: Les 5 dernières années
    }
    return date;
};

// --- Transactions par Mois ---
exports.getTransactionsByMonth = async () => {
    const db = getDB();
    const startDate = getStartDate('year'); // Récupérer les transactions de la dernière année

    const pipeline = [
        { $unwind: '$historique_transactions' }, // Détacher chaque transaction du client
        {
            $addFields: {
                // Convertir la date de transaction en objet Date MongoDB
                'historique_transactions.date_obj': {
                    $dateFromString: {
                        dateString: '$historique_transactions.date',
                        format: '%Y-%m-%d' // S'assurer que le format correspond à vos données
                    }
                }
            }
        },
        {
            $match: {
                'historique_transactions.date_obj': { $gte: startDate } // Filtrer pour la dernière année
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$historique_transactions.date_obj' },
                    month: { $month: '$historique_transactions.date_obj' }
                },
                totalMontant: { $sum: '$historique_transactions.montant' },
                nombreTransactions: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 } // Trier chronologiquement
        },
        {
            $project: {
                _id: 0, // Ne pas inclure l'ID de groupe par défaut
                periode: {
                    $dateToString: {
                        format: '%Y-%m', // Format "AAAA-MM" pour les mois
                        date: {
                            $dateFromParts: {
                                year: '$_id.year',
                                month: '$_id.month',
                                day: 1 // On prend le premier jour du mois pour la date
                            }
                        }
                    }
                },
                totalMontant: 1,
                nombreTransactions: 1
            }
        }
    ];

    return db.collection(COLLECTION).aggregate(pipeline).toArray();
};

// --- Transactions Trimestrielles ---
exports.getTransactionsByQuarter = async () => {
    const db = getDB();
    const startDate = getStartDate('year'); // Récupérer les transactions de la dernière année (ou plus)

    const pipeline = [
        { $unwind: '$historique_transactions' },
        {
            $addFields: {
                'historique_transactions.date_obj': {
                    $dateFromString: {
                        dateString: '$historique_transactions.date',
                        format: '%Y-%m-%d'
                    }
                }
            }
        },
        {
            $match: {
                'historique_transactions.date_obj': { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$historique_transactions.date_obj' },
                    quarter: { $ceil: { $divide: [{ $month: '$historique_transactions.date_obj' }, 3] } } // Calcul du trimestre
                },
                totalMontant: { $sum: '$historique_transactions.montant' },
                nombreTransactions: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.quarter': 1 }
        },
        {
            $project: {
                _id: 0,
                periode: { $concat: [{ $toString: '$_id.year' }, '-Q', { $toString: '$_id.quarter' }] }, // Ex: "2024-Q1"
                totalMontant: 1,
                nombreTransactions: 1
            }
        }
    ];

    return db.collection(COLLECTION).aggregate(pipeline).toArray();
};

// --- Transactions Semestrielles ---
exports.getTransactionsBySemester = async () => {
    const db = getDB();
    const startDate = getStartDate('year'); // Pour 2 semestres, 1 an est suffisant, mais vous pouvez étendre

    const pipeline = [
        { $unwind: '$historique_transactions' },
        {
            $addFields: {
                'historique_transactions.date_obj': {
                    $dateFromString: {
                        dateString: '$historique_transactions.date',
                        format: '%Y-%m-%d'
                    }
                }
            }
        },
        {
            $match: {
                'historique_transactions.date_obj': { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$historique_transactions.date_obj' },
                    // Si le mois est entre 1 et 6, c'est le semestre 1. Sinon, semestre 2.
                    semester: { $cond: [{ $lte: [{ $month: '$historique_transactions.date_obj' }, 6] }, 1, 2] }
                },
                totalMontant: { $sum: '$historique_transactions.montant' },
                nombreTransactions: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.semester': 1 }
        },
        {
            $project: {
                _id: 0,
                periode: { $concat: [{ $toString: '$_id.year' }, '-S', { $toString: '$_id.semester' }] }, // Ex: "2024-S1"
                totalMontant: 1,
                nombreTransactions: 1
            }
        }
    ];

    return db.collection(COLLECTION).aggregate(pipeline).toArray();
};

// --- Transactions Annuelles ---
exports.getTransactionsByYear = async () => {
    const db = getDB();
    const startDate = getStartDate('all'); // Récupérer toutes les années, ou une période plus longue

    const pipeline = [
        { $unwind: '$historique_transactions' },
        {
            $addFields: {
                'historique_transactions.date_obj': {
                    $dateFromString: {
                        dateString: '$historique_transactions.date',
                        format: '%Y-%m-%d'
                    }
                }
            }
        },
        {
            $match: {
                'historique_transactions.date_obj': { $gte: startDate }
            }
        },
        {
            $group: {
                _id: { year: { $year: '$historique_transactions.date_obj' } },
                totalMontant: { $sum: '$historique_transactions.montant' },
                nombreTransactions: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1 }
        },
        {
            $project: {
                _id: 0,
                periode: { $toString: '$_id.year' }, // Ex: "2024"
                totalMontant: 1,
                nombreTransactions: 1
            }
        }
    ];

    return db.collection(COLLECTION).aggregate(pipeline).toArray();
};

// --- Transactions par Type (avec période optionnelle) ---
exports.getTransactionsByType = async (period = 'all') => {
    const db = getDB();
    const startDate = getStartDate(period); // Filtre par période si spécifié

    const pipeline = [
        { $unwind: '$historique_transactions' },
        {
            $addFields: {
                'historique_transactions.date_obj': {
                    $dateFromString: {
                        dateString: '$historique_transactions.date',
                        format: '%Y-%m-%d'
                    }
                }
            }
        },
        {
            $match: {
                'historique_transactions.date_obj': { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$historique_transactions.type',
                totalMontant: { $sum: '$historique_transactions.montant' },
                nombreTransactions: { $sum: 1 }
            }
        },
        {
            $sort: { totalMontant: -1 } // Trier par montant décroissant
        },
        {
            $project: {
                _id: 0,
                type: '$_id',
                totalMontant: 1,
                nombreTransactions: 1
            }
        }
    ];

    return db.collection(COLLECTION).aggregate(pipeline).toArray();
};