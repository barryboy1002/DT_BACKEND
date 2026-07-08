import { listPurchasesService, 
  getPurchaseService, 
  getPurchasesByProductService,
   createPurchaseService } from "../services/purchasesService.js";

async function listPurchasesController(req,res,next){
  const {businessId, branchId} = req.user
  const { from,to,supplier_id,page,limit } = req.query;
  const activeBranchId = branchId || req.query.branchId || null;
  try{
    const result = await listPurchasesService(businessId,{ from,to,supplier_id,page,limit, branchId: activeBranchId });
    res.status(200).json({ success: true,
       data: result.data,
        meta: result.meta });
  }catch(e){
     next(e); 
    }
}

async function getPurchaseController(req,res,next){
  const {businessId, branchId} = req.user
  const purchaseId = Number(req.params?.purchaseId);
  try{
    const purchase = await getPurchaseService(purchaseId,
      businessId, branchId);
    res.status(200).json(
      { success:true, 
        data: purchase });
  }catch(e){
     next(e); 
    }
}

async function getPurchasesByProductController(req,res,next){
  const {businessId, branchId} = req.user
  const productId = Number(req.params?.productId);
  const { page, limit } = req.query;
  const activeBranchId = branchId || req.query.branchId || null;
  try{
    const result = await getPurchasesByProductService(productId,
      businessId,{ page, limit, branchId: activeBranchId });
    res.status(200).json({
       success:true, 
       data: result.data, 
       meta: result.meta });
  }catch(e){
     next(e); 
    }
}

async function createPurchaseController(req,res,next){
  const {businessId, branchId} = req.user
  const { supplier_id, items, payment_method, date_arrived } = req.body;
  const activeBranchId = branchId || req.body.branchId || null;
  try{
    const result = await createPurchaseService(businessId,supplier_id,items,payment_method,date_arrived,activeBranchId);
    res.status(201).json({ success:true, data: result });
  }catch(e){ 
    console.error(e)
    next(e); 
  }
}

export { listPurchasesController, 
  getPurchaseController,
   getPurchasesByProductController, 
   createPurchaseController };
