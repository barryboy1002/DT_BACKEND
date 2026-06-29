import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";

function authenticate(req, res, next) {
  try{
    const authHeader = req.headers.authorization;
    if(!authHeader){
      throw  new AppError("No token provided", 401);
    }
    //Expect bearer token
    const [scheme,token] = authHeader.split(" ")[1];
    if (!scheme == "Bearer"||!token) {
      throw new AppError("Invalid authorization header", 401);
    }
    const decoded = verifyToken(token);
    if (!decoded.userId || !decoded.role || !decoded.businessId) {
          throw new AppError("Invalid token payload", 401);
    }

    req.user = decoded;
    next();
  }catch(error){
    next(AppError("Invalid or expired token", 401));
  }

}

export { authenticate };
