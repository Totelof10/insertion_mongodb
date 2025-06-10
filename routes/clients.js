const express = require('express')
const router = express.Router()
const { listerClients, clientParId, ajouterClient, supprimerClient } = require("../controllers/clientController")

router.get('/', listerClients)
router.get('/:id', clientParId)
router.post('/', ajouterClient)
router.delete('/:id', supprimerClient)

module.exports = router;