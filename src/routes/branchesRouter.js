import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
    createBranchController,
    listBranchesController,
    getBranchController,
    updateBranchController,
    deleteBranchController
} from "../controllers/branchesController.js";

const branchesRouter = Router();

branchesRouter.get("/", authenticate, authorize(["owner", "manager"]), listBranchesController);
branchesRouter.post("/", authenticate, authorize(["owner"]), createBranchController);
branchesRouter.get("/:branchId", authenticate, authorize(["owner", "manager"]), getBranchController);
branchesRouter.put("/:branchId", authenticate, authorize(["owner"]), updateBranchController);
branchesRouter.delete("/:branchId", authenticate, authorize(["owner"]), deleteBranchController);

export { branchesRouter };
