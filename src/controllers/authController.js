import { registerUserService } from "../services/authService.js";

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
export  {registerUserController};