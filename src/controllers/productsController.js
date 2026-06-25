import { createProductService,
    getProductsService,
    getProductService, 
    updateProductService, 
    deleteProductsService }
 from "../services/productService.js";

async function createProductController(req, res, next) {
    // prefer businessId from authenticated user
    const {businessId} = req.user
    try {
        const product = await createProductService(businessId, req.body);
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
}

async function getProductsController(req, res, next){
    const {businessId} = req.user
    const {limit, offset} = req.query;
    try {
        const products = await getProductsService(businessId,{limit, offset});
        res.status(200).json({"success":true,"data":products});

    }catch(error){
        next(error);
    }

}

async function getProductController(req,res,next){
     const {businessId} = req.user
     const productId   = req.params?.productId
     try{
        const product =  await getProductService(productId,businessId);
        res.status(200).json(product);
     }catch(error){
        //we should figure out how to deal with 404 errors
        next(error)
     }
}
async function updateProductController(req,res,next){
    const { businessId } = req.user;
    const productId = req.params?.productId;

    try{
        const updated =
            await updateProductService(
                productId,
                businessId,
                req.body
            );

        res.status(200).json(updated);

    }catch(error){

        next(error);
    }
}

async function deleteProductsController(req, res, next) {
    const {businessId} = req.user
    const ids = req.body?.ids;
    try {
        const deletedIds = await deleteProductsService(businessId, ids);
        res.status(200).json({ success: true, deleted: deletedIds.length, ids: deletedIds });
    } catch (error) {
        next(error);
    }
}

export { createProductController, 
    getProductsController, 
    getProductController,
    updateProductController,
    deleteProductsController
};