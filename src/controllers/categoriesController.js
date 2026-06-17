import { listCategoriesService, createCategoryService, renameCategoryService, deleteCategoryService } from "../services/categoriesService.js";

async function listCategoriesController(req, res, next) {
  const businessId = req.user?.businessId || req.params?.businessId;
  try {
    const rows = await listCategoriesService(businessId);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function createCategoryController(req, res, next) {
  const businessId = req.user?.businessId || req.params?.businessId;
  const { name } = req.body;
  try {
    const created = await createCategoryService(businessId, name);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

async function renameCategoryController(req, res, next) {
  const businessId = req.user?.businessId || req.params?.businessId;
  const categoryId = Number(req.params?.categoryId);
  const { name } = req.body;
  try {
    const updated = await renameCategoryService(categoryId, businessId, name);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

async function deleteCategoryController(req, res, next) {
  const businessId = req.user?.businessId || req.params?.businessId;
  const categoryId = Number(req.params?.categoryId);
  try {
    const deletedId = await deleteCategoryService(categoryId, businessId);
    res.status(200).json({ success: true, deleted: deletedId });
  } catch (error) {
    next(error);
  }
}

export { listCategoriesController, createCategoryController, renameCategoryController, deleteCategoryController };
