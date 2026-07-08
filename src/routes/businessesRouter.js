import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { getMpesaSettingsController, updateMpesaSettingsController } from '../controllers/businessesController.js';

const businessesRouter = Router();

businessesRouter.get('/mpesa-settings', authenticate, authorize(["owner"]), getMpesaSettingsController);
businessesRouter.put('/mpesa-settings', authenticate, authorize(["owner"]), updateMpesaSettingsController);

export { businessesRouter };
