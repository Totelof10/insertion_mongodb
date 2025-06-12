const { getAllClients, getClientById, addClient, deleteClient, getTopClient } = require("../models/clientModel")
const redis = require("../redisClient")


exports.listerClients = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const CACHE_KEY = `clients:page:${page}:limit:${limit}` // clé unique par page

    try {
        // Vérifie si les données sont en cache
        const cacheData = await redis.get(CACHE_KEY)
        if (cacheData) {
            console.log("✅ Données récupérées depuis Redis")
            return res.json(JSON.parse(cacheData))
        }

        console.log("❌ Données non présentes dans le cache Redis")

        // Récupère depuis MongoDB
        const { clients, total } = await getAllClients(page, limit)
        const totalPages = Math.ceil(total / limit)

        const responseData = {
            clients,
            page,
            totalPages
        }

        // Mise en cache
        await redis.setEx(CACHE_KEY, 60, JSON.stringify(responseData)) // TTL = 60s
        console.log("📦 Données mises en cache Redis")

        res.json(responseData)
    } catch (err) {
        console.error("Erreur lors de la récupération des clients:", err.message)
        res.status(500).json({ message: err.message })
    }
}


exports.clientParId = async (req, res) =>{
    const id = req.params.id
    console.log("ID reçu dans req.params.id: ", id)
    const CACHE_KEY = `clients:${id}`
    try{
        const cacheData = await redis.get(CACHE_KEY)
        if(cacheData){
            console.log("Client récupéré depuis redis")
            return res.json(JSON.parse(cacheData))
        }
        const client = await getClientById(id)
        if(!client){
            return res.status(404).json({ message: "Client non trouvé" })
        }
        await redis.setEx(CACHE_KEY, 300, JSON.stringify(client))
        console.log("Client récupéré depuis mongo et mise en cache dans redis")
        res.json(client)
    }catch(err){
        console.error("Erreur clientParId:", err)
        res.status(400).json({ message: err.message })
    }
}

exports.ajouterClient = async (req, res) =>{
    try{
        const client = req.body
        const result = await addClient(client)
        res.status(201).json({ id: result.insertedId })
    }catch (err){
        console.log("Erreur lors de l'ajout de l'utilisateur:", err.message)
        res.status(400).json({ message: err.message })
    }
}

exports.supprimerClient = async(req, res) => {
    try{
        const id = req.params.id
        const result = await deleteClient(id)
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Client non trouvé" });
        }
        await redis.del("clients") 
        res.status(200).json({ message: "Client supprimé avec succès" })   
    }catch(err){
        console.log("Erreur lors de la suppression du client:", err.message)
        res.status(400).json({ message: err.message })
    }
}

exports.listerTop50 = async(req, res) => {
    const CACHE_KEY = "clients"
    try{
        const cacheData = await redis.get(CACHE_KEY)
        if(cacheData){
            console.log("Données récupérées depuis Redis")
            return res.json(JSON.parse(cacheData))
        }

        console.log("Je n'arrive pas à accéder au cache")

        const clients =  await getTopClient()

        await redis.setEx(CACHE_KEY, 60, JSON.stringify(clients))

        console.log("Données récupérées depuis mongodb et mises en cache")

        res.json(clients)
    }catch(err){
        res.status(500).json({message: err.message})
    }
}
