import { AppError } from "../errors/AppError.js";

function authorize(allowedRoles = []) {

    return (req, res, next) => {

        try {

            const user = req.user;

            if (!user) {
                throw new AppError("Unauthenticated", 401);
            }

            if (!allowedRoles.includes(user.role)) {
                throw new AppError("Forbidden: insufficient permissions", 403);
            }

            next();

        } catch (error) {
            next(error);
        }
    };
}

export { authorize };