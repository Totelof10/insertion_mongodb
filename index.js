require("dotenv").config()
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const { connectToDB } = require("./mongoDb")
const clients = require("./routes/clients")
const utilisateur = require("./routes/utilisateurs")
const transactions = require("./routes/transactions")
const { protegerRoute } = require("./middlewares/authMiddleware")

app.use(cors())
app.use(express.json())

app.get('/', (request, response)=>{
    response.send('Hello Master Tohaina')
})
app.use("/api/auth", utilisateur)
app.use("/api/clients", protegerRoute, clients)
app.use("/api/transactions", protegerRoute,transactions)

connectToDB().then(()=>{
    app.listen(port, ()=>{
        console.log(`Example app listening on http://localhost:${port}`)
    })
}).catch((err)=>{
    console.error("Impossible de lancer le serveur:" , err)
})
