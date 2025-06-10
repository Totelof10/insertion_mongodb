const { getAllClients, getClientById, addClient, deleteClient } = require("../models/clientModel")
const redis = require("../redisClient")


exports.listerClients = async (req, res)=>{
    const CACHE_KEY = "clients"
    try{
        const cacheData = await redis.get(CACHE_KEY)
        if(cacheData){
            console.log("Données récupérées depuis Redis")
            return res.json(JSON.parse(cacheData))
        }

        console.log("Je n'arrive pas à accéder au cache")

        const clients =  await getAllClients()

        await redis.setEx(CACHE_KEY, 60, JSON.stringify(clients))

        console.log("Données récupérées depuis mongodb et mises en cache")

        res.json(clients)
    }catch(err){
        res.status(500).json({message: err.message})
    }
}

exports.clientParId = async (req, res) =>{
    const id = req.params.id
    console.log("ID reçu dans req.params.id: ", id)
    const CACHE_KEY = "clients:${id}"
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