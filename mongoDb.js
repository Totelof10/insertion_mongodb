const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

async function connectToDB() {
    try {
        await client.connect();
        db = client.db("bigdata_dashboard"); // remplace par le nom réel de ta base
        console.log("✅ Connecté à MongoDB");
    } catch (e) {
        console.error("❌ Erreur de connexion MongoDB:", e);
    }
}

function getDB() {
    if (!db) throw new Error("Base de données non connectée");
    return db;
}

module.exports = { connectToDB, getDB };
