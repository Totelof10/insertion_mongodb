const { getDB } = require("../mongoDb")
const { ObjectId } = require("mongodb")

const COLLECTION = "utilisateurs"

exports.addUser = async (utilisateur) => {
    const db = getDB()
    const result = await db.collection(COLLECTION).insertOne(utilisateur)
    return result
}

exports.getUserWithMail = async (email) => {
    const db = getDB()
    return await db.collection(COLLECTION).findOne({ email })
}

exports.getUserById = async (id) => {
    const db = getDB()
    return await db.collection(COLLECTION).findOne({ _id: new ObjectId(id)})
}