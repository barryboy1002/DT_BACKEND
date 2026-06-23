import {Router } from 'express';
import { registerUserController } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post("/register",registerUserController)
export {authRouter}