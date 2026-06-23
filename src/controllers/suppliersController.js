import { listSuppliersService, getSupplierService, createSupplierService, updateSupplierService } from "../services/suppliersService.js";

async function listSuppliersController(req,res,next){
  const {businessId} = req.user;
  const { page, limit } = req.query;
  try{
    const result = await listSuppliersService(businessId,{ page, limit });
    res.status(200).json({ success:true, data: result.data, meta: result.meta });
  }catch(e){ next(e); }
}

async function getSupplierController(req,res,next){
  const {businessId} = req.user;
  const supplierId = req.params?.supplierId;
  try{
    const supplier = await getSupplierService(supplierId,businessId);
    res.status(200).json({ success:true, data: supplier });
  }catch(e){ next(e); }
}

async function createSupplierController(req,res,next){
  const {businessId} = req.user?.businessId;
  const payload = req.body;
  try{
    const supplier = await createSupplierService(businessId,payload);
    res.status(201).json({ success:true, data: supplier });
  }catch(e){ next(e); }
}

async function updateSupplierController(req,res,next){
  const {businessId }= req.user
  const supplierId = req.params?.supplierId;
  const payload = req.body;
  try{
    const supplier = await updateSupplierService(supplierId,businessId,payload);
    res.status(200).json({ success:true, data: supplier });
  }catch(e){ next(e); }
}

export { listSuppliersController, getSupplierController, createSupplierController, updateSupplierController };
