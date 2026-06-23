// Simple authentication middleware for local/dev usage.
// For now it accepts an `X-Business-Id` header and attaches `req.user`.
// Replace with real JWT verification in production.
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";

function authenticate(req, res, next) {
  try{
    const authHeader = req.headers.authorization;
    if(!authHeader){
      throw  new AppError("No token provided", 401);
    }
    //Expect bearer token
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Invalid token format", 401);
    }
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  }catch(error){
    next(error);
  }

}

export { authenticate };
