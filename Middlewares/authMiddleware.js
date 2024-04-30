const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next)=>{
    try{
        const token = req.header("Authorization");
        if(!token){
            return res.status(401).json({message:"Unverified User"})
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if(!decode){
            return res.status(401).json({message:"Invalid token"});
        }
        req.user = decode.userId;
        next();
    }
    catch(err){
        return res.status(401).json({message:"Invalid token"});
    }
}

module.exports = verifyToken;
