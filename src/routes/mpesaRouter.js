import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
    initiateMpesaSaleController,
    mpesaCallbackController,
    getMpesaTransactionStatusController
} from '../controllers/mpesaController.js';

const mpesaRouter = Router();

// Cashier-triggered — requires an authenticated session
mpesaRouter.post('/initiate', authenticate, initiateMpesaSaleController);

// Frontend polls this while waiting for the customer to enter their PIN
mpesaRouter.get('/status/:transactionId', authenticate, getMpesaTransactionStatusController);

// Public — called by Safaricom directly, must NOT sit behind authenticate
mpesaRouter.post('/callback', mpesaCallbackController);

export { mpesaRouter };
