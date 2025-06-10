const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { addUser, getUserWithMail } = require("../models/userModel")

const SECRET = process.env.JWT_SECRET

exports.inscription = async (req, res) => {
    try{
        const { email, mot_de_passe, nom } = req.body
        const mdp_hashed = await bcrypt.hash(mot_de_passe, 10)
        const utilisateur = { email, mot_de_passe: mdp_hashed, nom }
        
        const result = await addUser(utilisateur)
        res.status(201).json({ message: "Utilisateur créé", id: result.insertedId })
    }catch(err){
        res.status(500).json({ message: err.message })
    }
}

exports.connexion = async (req, res) => {
    try{
        const { email, mot_de_passe } = req.body
        const utilisateur = await getUserWithMail(email)
        if(!utilisateur) return res.status(401).json({ message: "Email non trouvé" });

        const match = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe)
        if(!match) return res.status(401).json({ message: "Mot de passe incorrect" });

        const token = jwt.sign(
            {
                id: utilisateur._id,
                email: utilisateur.email
            },
            SECRET,
            {
                expiresIn: "1h"
            }
        )
        res.json({ token })

    }catch(err){
        res.status(500).json({ message: err.message })
    }
}