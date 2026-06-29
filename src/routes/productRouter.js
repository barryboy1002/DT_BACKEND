import { Router } from 'express';
import { createProductController, getProductsController,getProductController,updateProductController,deleteProductsController } from "../controllers/productsController.js";
import { validateProduct } from "../middleware/validateProduct.js";
import { authenticate } from "../middleware/authenticate.js";

const productsRouter = Router();


productsRouter.get("/", authenticate, getProductsController);
productsRouter.post("/", authenticate, validateProduct, createProductController);
productsRouter.get("/:productId", authenticate, getProductController);
productsRouter.put("/:productId", authenticate, updateProductController);
productsRouter.delete("/", authenticate, deleteProductsController);

export { productsRouter };