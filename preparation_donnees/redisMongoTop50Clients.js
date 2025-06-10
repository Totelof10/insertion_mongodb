const { MongoClient } = require("mongodb")

const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

//fonction de récupération de 50 clients dans mongo
async function getTop50Clients(){
    try{
        await client.connect()
        const db = client.db("bigdata_dashboard")
        const collection = db.collection("clients")

        const topClients = await collection.aggregate([{
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

    console.log("Top 50 clients les plus actifs :")
    topClients.forEach((client, index) => {
        console.log(`${index + 1}. ${client.nom} - ${client.email} (${client.totalTransactions} transactions)`);
    })
    return topClients
    } catch(err){
        console.error("Erreur:", err);
    } finally {
        await client.close()
    }
}
getTop50Clients()