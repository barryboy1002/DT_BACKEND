import { createSaleService, listSalesService, getSaleService, createRefundService } from "../services/salesServices.js";

async function createSaleController(req,res,next){
    const {businessId, branchId} = req.user;
    const {items,payment_method,customer_name} = req.body;
    const activeBranchId = branchId || req.body.branchId || null;
    try{
        const created =  await createSaleService(businessId,items,payment_method,customer_name, activeBranchId);
        res.status(201).json({success: true, data: created});
    }catch(error){
        next(error);
    }
}

async function listSalesController(req,res,next){
    const {businessId, branchId} = req.user;
    const {from,to,page,limit,payment_method,search} = req.query;
    const activeBranchId = branchId || req.query.branchId || null;
    try{
        const result = await listSalesService(businessId,{from,to,page,limit,payment_method,search, branchId: activeBranchId});
        res.status(200).json({success:true,data: result.data, meta: result.meta});
    }catch(error){
        next(error);
    }
}

async function getSaleController(req,res,next){
    const {businessId, branchId} = req.user;
    const saleId = Number(req.params?.saleId);
    try{
        const sale = await getSaleService(saleId,businessId, branchId);
        res.status(200).json({success:true,data: sale});
    }catch(error){
        next(error);
    }
}

async function createRefundController(req,res,next){
    const {businessId, branchId} = req.user;
    const saleId = Number(req.params?.saleId);
    const { reason } = req.body || {};
    try{
        const refund = await createRefundService(businessId, saleId, reason || null, branchId);
        res.status(201).json({success:true,data: refund});
    }catch(error){
        next(error);
    }
}

export {createSaleController, listSalesController, getSaleController, createRefundController}
