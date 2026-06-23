import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function signToken(payload){
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn : "1d"
    });
}
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export { signToken, verifyToken };