import { Router } from 'express';
import { listCategoriesController, createCategoryController, renameCategoryController, deleteCategoryController } from "../controllers/categoriesController.js";
import { validateCategory } from "../middleware/validateCategory.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get('/', authenticate, listCategoriesController);
router.post('/', authenticate,authorize(["owner", "manager"]), validateCategory, createCategoryController);
router.patch('/:categoryId', authenticate, validateCategory, renameCategoryController);
router.delete('/:categoryId', authenticate, deleteCategoryController);

export { router as categoriesRouter };
