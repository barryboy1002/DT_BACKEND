import {Router } from 'express';
import { registerUserController,registerBusinessOwnerController,loginController } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post("/register",registerBusinessOwnerController);
authRouter.post("/createUser", registerUserController);
authRouter.post("/login", loginController);
export {authRouter}