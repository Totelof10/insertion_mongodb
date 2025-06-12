const express = require('express')
const router = express.Router()
const { listerClients, clientParId, ajouterClient, supprimerClient, listerTop50 } = require("../controllers/clientController")

router.get('/', listerClients)
router.get('/top50', listerTop50)
router.get('/:id', clientParId)
router.post('/', ajouterClient)
router.delete('/:id', supprimerClient)

module.exports = router;