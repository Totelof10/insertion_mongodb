const redis = require("redis")

const client = redis.createClient()

client.on("error", (err)=>{
    console.error("Erreur de redis :", err)
})

client.connect().then(()=>{
    console.log("Connecté à redis")
})

module.exports = client