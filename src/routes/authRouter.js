import {Router } from 'express';
import { registerUserController,registerBusinessOwnerController,loginController,getCurrentUserController,listUsersController } from '../controllers/authController.js';
import { authorize } from '../middleware/authorize.js';
import { authenticate } from '../middleware/authenticate.js';
import {userDetails} from '../middleware/userDetails.js';

const authRouter = Router();
//TODO: Add validation middleware for the request body 
authRouter.post("/register",userDetails,registerBusinessOwnerController);
authRouter.post("/createUser",authenticate, authorize(["owner", "manager"]), registerUserController);
authRouter.post("/login", loginController);

authRouter.get("/users", authenticate, authorize(["owner", "manager"]), listUsersController);
authRouter.get("/me",authenticate,getCurrentUserController);
export {authRouter}