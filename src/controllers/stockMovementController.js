import {getStockMovementsService, getLowStockService,getOutOfStockService} from "../services/stocksService.js" 



async function getStockMovementsController(req,res,next){
    const {businessId} = req.user
    const {limit, offset} = req.query;
    try{
        const movements = await getStockMovementsService(businessId, {limit,offset});
        res.status(200).json({ success: true, data: movements });
    }catch(error){
        next(error);
    }
}

async function getLowStockController(req,res,next){
    const {businessId} = req.user
    try{
        const lowStock  = await getLowStockService(businessId);
        res.status(200).json(lowStock);
    }catch(error){
        next(error);
    }
}
async function getOutOfStockController(req,res,next){
    const {businessId} = req.user
    try{
        const lowStock  = await getOutOfStockService(businessId);
        res.status(200).json(lowStock);
    }catch(error){
        next(error);
    }
}

export {getStockMovementsController,getLowStockController,getOutOfStockController}