import { createSaleService, listSalesService, getSaleService } from "../services/salesServices.js";

async function createSaleController(req,res,next){
    const {businessId} = req.user
    const {items,paymentMethod,customerName} = req.body
    try{
        const created =  await createSaleService(businessId,items,paymentMethod,customerName);
        res.status(201).json({success: true, data: created});
    }catch(error){
        next(error);
    }
}

async function listSalesController(req,res,next){
    const businessId = req.user?.businessId;
    const {from,to,page,limit,payment_method} = req.query;
    try{
        const result = await listSalesService(businessId,{from,to,page,limit,payment_method});
        res.status(200).json({success:true,data: result.data, meta: result.meta});
    }catch(error){
        next(error);
    }
}

async function getSaleController(req,res,next){
    const businessId = req.user?.businessId;
    const saleId = Number(req.params?.saleId);
    try{
        const sale = await getSaleService(saleId,businessId);
        res.status(200).json({success:true,data: sale});
    }catch(error){
        next(error);
    }
}

export {createSaleController, listSalesController, getSaleController}