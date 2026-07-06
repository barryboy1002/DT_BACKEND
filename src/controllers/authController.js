import { registerUserService,registerBusinessOwnerService,loginUserService ,getCurrentUserService,listUsersService,updateUserService,deleteUserService} from "../services/authService.js";

async function registerBusinessOwnerController(req,res,next){
    try{
        const business = await registerBusinessOwnerService(req.body);

        res.status(201).json({
            success:true,
            data:business
        });


    }catch(error){
        next(error);
    }
}
async function registerUserController(req,res,next){
    try{
        const { businessId, role: creatorRole, branchId: creatorBranchId } = req.user;
        const { name, email, password, role, branchId } = req.body;

        // Managers can only create cashiers at their own branch
        if (creatorRole === "manager") {
            if (role !== "cashier") {
                return res.status(403).json({ success: false, error: "Forbidden: managers can only create cashiers" });
            }
            if (branchId !== creatorBranchId) {
                return res.status(403).json({ success: false, error: "Forbidden: managers can only create cashiers for their own branch" });
            }
        }

        const user = await registerUserService({
            businessId,
            name,
            email,
            password,
            role,
            branchId: creatorRole === "manager" ? creatorBranchId : branchId
        });

        res.status(201).json({
            success:true,
            data:user
        });

    }catch(error){
        next(error)
    }
}

async function listUsersController(req, res, next) {
    try {
        const { businessId } = req.user;
        const users = await listUsersService(businessId);
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
}

async function updateUserController(req, res, next) {
    try {
        const { businessId } = req.user;
        const { userId } = req.params;
        const user = await updateUserService(userId, businessId, req.body);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
}

async function deleteUserController(req, res, next) {
    try {
        const { businessId } = req.user;
        const { userId } = req.params;
        const deletedUser = await deleteUserService(userId, businessId);
        res.status(200).json({ success: true, data: deletedUser });
    } catch (error) {
        next(error);
    }
}

async function loginController(req, res, next) {
    try {
        const { email, password } = req.body;

        const result = await loginUserService(email, password);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        next(error);
    }
}
async function getCurrentUserController(req, res, next) {
    try {
        const { userId } = req.user;

        const user = await getCurrentUserService(userId);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

export  {registerUserController,registerBusinessOwnerController,loginController,getCurrentUserController,listUsersController,updateUserController,deleteUserController};