const jwt = require("jsonwebtoken")

const SECRET = process.env.JWT_SECRET

exports.protegerRoute = (req, res, next) => {
    const authHeader = req.headers.authorization

    if(authHeader && authHeader.startsWith("Bearer ")){
        const token = authHeader.split(" ")[1]

        jwt.verify(token, SECRET, (err, decoded) => {
            if(err) return res.status(403).json({ message: "Token invalide" });

            req.utilisateur = decoded
            next()
        }) 
    }else{
        res.status(401).json({ message: "Token requis" })
    }
}