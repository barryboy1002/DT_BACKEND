import {getStockMovementsService, getLowStockService,getOutOfStockService} from "../services/stocksService.js" 



async function getStockMovementsController(req,res,next){
    const {businessId, branchId} = req.user
    const {limit, offset} = req.query;
    const activeBranchId = branchId || req.query.branchId || null;
    try{
        const movements = await getStockMovementsService(businessId, {limit,offset, branchId: activeBranchId});
        res.status(200).json({ success: true, data: movements });
    }catch(error){
        next(error);
    }
}

async function getLowStockController(req,res,next){
    const {businessId, branchId} = req.user
    const activeBranchId = branchId || req.query.branchId || null;
    try{
        const lowStock  = await getLowStockService(businessId, activeBranchId);
        res.status(200).json(lowStock);
    }catch(error){
        next(error);
    }
}
async function getOutOfStockController(req,res,next){
    const {businessId, branchId} = req.user
    const activeBranchId = branchId || req.query.branchId || null;
    try{
        const lowStock  = await getOutOfStockService(businessId, activeBranchId);
        res.status(200).json(lowStock);
    }catch(error){
        next(error);
    }
}

export {getStockMovementsController,getLowStockController,getOutOfStockController}