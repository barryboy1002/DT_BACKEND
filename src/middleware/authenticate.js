import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError("Authentication required", 401);
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new AppError("Invalid authorization header", 401);
        }

        const decoded = verifyToken(token);

        if (!decoded.userId || !decoded.businessId || !decoded.role) {
            throw new AppError("Invalid token", 401);
        }

        req.user = decoded;

        next();
    } catch {
        next(new AppError("Invalid or expired token", 401));
    }
}

export { authenticate };