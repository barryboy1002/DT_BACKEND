import { Router } from 'express';
import { authenticate } from "../middleware/authenticate.js";
import { listSuppliersController, getSupplierController, createSupplierController, updateSupplierController } from "../controllers/suppliersController.js";

const suppliersRouter = Router();

suppliersRouter.get('/', authenticate, listSuppliersController);
suppliersRouter.get('/:supplierId', authenticate, getSupplierController);
suppliersRouter.post('/', authenticate, createSupplierController);
suppliersRouter.put('/:supplierId', authenticate, updateSupplierController);

export { suppliersRouter };