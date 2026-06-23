import { query } from "../db/index.js";
import bcrypt from 'bcrypt';
import {AppError} from '../errors/AppError.js'

async function registerUserService(data){
    const {businessId,
        name,
        email,
        password,
        role} =  data;
    const existing = await query("SELECT user_id from users WHERE email= $1",[email])
    if(existing.rowCount > 0){
        throw new AppError("Email Already Exists",409);
    }

    const hashPassword = await bcrypt.hash(password,10);

    const result = await query(`
        INSERT INTO Users (
        business_id,
        name,
        email,
        password_hash,
        role)
        VALUES($1,$2,$3,$4,$5)
        RETURNING 
        user_id
        business_id,
        name,
        email,
        password_hash,
        role`,
    [
    businessId,
    name,
    email,
    hashPassword,
    role
    ])

    return result.rows[0];
    

}
export {registerUserService}