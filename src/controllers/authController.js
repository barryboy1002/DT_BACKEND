import { registerUserService,registerBusinessOwnerService,loginUserService ,getCurrentUserService} from "../services/authService.js";

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
        const user = await registerUserService(req.body);

        res.status(201).json({
            success:true,
            data:user
        });

    }catch(error){
        next(error)
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

export  {registerUserController,registerBusinessOwnerController,loginController,getCurrentUserController};