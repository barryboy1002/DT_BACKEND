import { Router } from 'express';
import { createProductController } from "../controllers/productsController.js";
import { validateProduct } from "../middleware/validateProduct.js";

const productsRouter = Router();

productsRouter.post("/:businessId", validateProduct, createProductController);

export { productsRouter };
// well use req.user to get id's next time