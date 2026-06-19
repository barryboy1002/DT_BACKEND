import { listPurchasesService, getPurchaseService, getPurchasesByProductService, createPurchaseService } from "../services/purchasesService.js";

async function listPurchasesController(req,res,next){
  const businessId = req.user?.businessId;
  const { from,to,supplierId,page,limit } = req.query;
  try{
    const result = await listPurchasesService(businessId,{ from,to,supplierId,page,limit });
    res.status(200).json({ success: true, data: result.data, meta: result.meta });
  }catch(e){ next(e); }
}

async function getPurchaseController(req,res,next){
  const businessId = req.user?.businessId;
  const purchaseId = Number(req.params?.purchaseId);
  try{
    const purchase = await getPurchaseService(purchaseId,businessId);
    res.status(200).json({ success:true, data: purchase });
  }catch(e){ next(e); }
}

async function getPurchasesByProductController(req,res,next){
  const businessId = req.user?.businessId;
  const productId = Number(req.params?.productId);
  const { page, limit } = req.query;
  try{
    const result = await getPurchasesByProductService(productId,businessId,{ page, limit });
    res.status(200).json({ success:true, data: result.data, meta: result.meta });
  }catch(e){ next(e); }
}

async function createPurchaseController(req,res,next){
  const businessId = req.user?.businessId;
  const { supplierId, items, paymentMethod, dateArrived } = req.body;
  try{
    const result = await createPurchaseService(businessId,supplierId,items,paymentMethod,dateArrived);
    res.status(201).json({ success:true, data: result });
  }catch(e){ next(e); }
}

export { listPurchasesController, getPurchaseController, getPurchasesByProductController, createPurchaseController };
