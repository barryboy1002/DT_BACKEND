import {Router } from 'express';
import { registerUserController,registerBusinessOwnerController,loginController } from '../controllers/authController.js';
import { authorize } from '../middleware/authorize.js';

const authRouter = Router();

authRouter.post("/register",registerBusinessOwnerController);
authRouter.post("/createUser",authorize(["owner", "manager"]), registerUserController);
authRouter.post("/login", loginController);
export {authRouter}