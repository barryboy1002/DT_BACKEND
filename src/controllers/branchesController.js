import {
    createBranchService,
    listBranchesService,
    getBranchService,
    updateBranchService,
    deleteBranchService
} from "../services/branchesService.js";

async function createBranchController(req, res, next) {
    try {
        const { businessId } = req.user;
        const branch = await createBranchService(businessId, req.body);
        res.status(201).json({
            success: true,
            data: branch
        });
    } catch (error) {
        next(error);
    }
}

async function listBranchesController(req, res, next) {
    try {
        const { businessId } = req.user;
        const branches = await listBranchesService(businessId);
        res.status(200).json({
            success: true,
            data: branches
        });
    } catch (error) {
        next(error);
    }
}

async function getBranchController(req, res, next) {
    try {
        const { businessId } = req.user;
        const { branchId } = req.params;
        const branch = await getBranchService(businessId, branchId);
        res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error) {
        next(error);
    }
}

async function updateBranchController(req, res, next) {
    try {
        const { businessId } = req.user;
        const { branchId } = req.params;
        const branch = await updateBranchService(businessId, branchId, req.body);
        res.status(200).json({
            success: true,
            data: branch
        });
    } catch (error) {
        next(error);
    }
}

async function deleteBranchController(req, res, next) {
    try {
        const { businessId } = req.user;
        const { branchId } = req.params;
        await deleteBranchService(businessId, branchId);
        res.status(200).json({
            success: true,
            message: "Branch deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

export {
    createBranchController,
    listBranchesController,
    getBranchController,
    updateBranchController,
    deleteBranchController
};
