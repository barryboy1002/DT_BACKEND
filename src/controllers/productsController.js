import { createProductService } from "../services/productService.js";

async function createProductController(req, res, next) {
    // we'll use the user for id in the future
    const { businessId } = req.params;
    try {
        const product = await createProductService(businessId, req.body);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
}

export { createProductController };