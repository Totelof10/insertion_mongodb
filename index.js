require("dotenv").config()
const express = require('express')
const app = express()
const port = 3000
const { connectToDB } = require("./mongoDb")
const clients = require("./routes/clients")
const utilisateur = require("./routes/utilisateurs")
const { protegerRoute } = require("./middlewares/authMiddleware")

app.use(express.json())

app.get('/', (request, response)=>{
    response.send('Hello Master Tohaina')
})
app.use("/api/auth", utilisateur)
app.use("/api/clients", protegerRoute, clients)

connectToDB().then(()=>{
    app.listen(port, ()=>{
        console.log(`Example app listening on http://localhost:${port}`)
    })
}).catch((err)=>{
    console.error("Impossible de lancer le serveur:" , err)
})
