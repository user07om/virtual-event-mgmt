const jwt = require("jsonwebtoken");

async function verifyToken(req, res, next) {
    const token = req.header["autherization"];
    if (!token) return res.status(303).json({message: "No token provided"})
    try {
        const decode = jwt.verify(token.split(" ")[1], process.env.JWT)
        req.user = decode
    } catch(err) {
        return res.status(401).json({message: "Unautharised"})
    }
}

module.exports = verifyToken 
