import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateSale } from '../middleware/validateSale.js';
import { createSaleController, listSalesController, getSaleController } from '../controllers/salesController.js';

const salesRouter = Router();

salesRouter.post('/', authenticate, validateSale, createSaleController);
salesRouter.get('/', authenticate, listSalesController);
salesRouter.get('/:saleId', authenticate, getSaleController);

export { salesRouter };
