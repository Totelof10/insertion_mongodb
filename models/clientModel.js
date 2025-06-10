const { ObjectId } = require("mongodb")
const { getDB } = require("../mongoDb")

const COLLECTION = "clients"

exports.getAllClients = async () => {
    const db = getDB()
    return db.collection(COLLECTION).find().toArray()
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