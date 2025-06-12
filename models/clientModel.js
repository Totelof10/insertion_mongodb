const { ObjectId } = require("mongodb")
const { getDB } = require("../mongoDb")

const COLLECTION = "clients"

exports.getAllClients = async (page, limit) => {
    const db = getDB()
    const skip = (page - 1)* limit
    const clients = await db.collection(COLLECTION)
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray({})
    
    const total = await db.collection(COLLECTION).countDocuments()
    return {clients, total}
}

exports.getClientById = async (id) => {
    const db = getDB()
    if(!ObjectId.isValid(id)){
        throw new Error("Id invalide")
    }
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
}

exports.addClient = async (client) => {
    const db = getDB()
    const result = await db.collection(COLLECTION).insertOne(client)
    console.log("Resultat:", result)
    return result
}

exports.deleteClient = async (id) => {
    const db = getDB()
    if(!ObjectId.isValid(id)){
        throw new Error("Id Invalide")
    }
    const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })
    return result
}

exports.getTopClient = async () => {
    const db = getDB()
    const result = db.collection(COLLECTION).aggregate([{
            $project:{
                nom: 1,
                email: 1,
                historique_transactions: 1,
                totalTransactions: {$size: "$historique_transactions"}
            }
        },
        { $sort: { totalTransactions: -1}},
        { $limit: 50 }
    ]).toArray()
    return result
}