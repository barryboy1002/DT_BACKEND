import {getStockMovementsService, getLowStockService,getOutOfStockService} from "../services/stocksServices.js" 



async function getStockMovementsController(req,res,next){
    const businessId = req.user?.businessId
    const {limit, offset} = req.query;
    try{
        const movements = await getStockMovementsService(businessId, {limit,offset});
        res.status(200).json(movements);
    }catch(error){
        next(error);
    }
}

async function getLowStockController(req,res,next){
    const businessId = req.user?.businessId
    try{
        const lowStock  = await getLowStockService(businessId);
        res.status(200).json(lowStock);
    }catch(error){
        next(error);
    }
}
async function getOutOfStockController(req,res,next){
    const businessId = req.user?.businessId
    try{
        const lowStock  = await getOutOfStockService(businessId);
        res.status(200).json(lowStock);
    }catch(error){
        next(error);
    }
}

export {getStockMovementsController,getLowStockController,getOutOfStockController}