import {Router } from 'express';
import { registerUserController,registerBusinessOwnerController,loginController,getCurrentUserController } from '../controllers/authController.js';
import { authorize } from '../middleware/authorize.js';
import { authenticate } from '../middleware/authenticate.js';

const authRouter = Router();

authRouter.post("/register",registerBusinessOwnerController);
authRouter.post("/createUser",authorize(["owner", "manager"]), registerUserController);
authRouter.post("/login", loginController);

authRouter.get(
    "/me",
    authenticate,
    getCurrentUserController
);
export {authRouter}