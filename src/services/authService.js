import { query, getClient } from "../db/index.js";
import bcrypt from 'bcrypt';
import {AppError} from '../errors/AppError.js'
import { signToken } from "../utils/jwt.js";

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
        user_id,
        business_id,
        name,
        email,
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

async function registerBusinessOwnerService(data){
    const {
    businessName,
    plan,
    phone ,
    name,
    businessEmail,
    email,
    password
    } = data;
    const client = await getClient();
    try{

        await client.query("BEGIN");
        const existingBusiness = await client.query(
        `
        SELECT user_id
        FROM users
        WHERE email = $1
        `,
        [businessEmail]
        );

        if (existingBusiness.rowCount > 0) {
            throw new AppError(
                "Email already exists",
                409
            );
        }

        const BusinessResult = await client.query(
            `INSERT INTO businesses(name,ac_status,phone,email) 
            VALUES($1,$2,$3,$4) RETURNING business_id`,[businessName,plan,phone,businessEmail]
        )
        const businessId = BusinessResult.rows[0].business_id;
        
        const existingUser = await query("SELECT user_id from users WHERE email= $1",[email])
        if(existingUser.rowCount > 0){
            throw new AppError("Email Already Exists",409);
        }

        const passwordHash = await bcrypt.hash(password,10);
        const userResult = await client.query(
            `
            INSERT INTO users(
                business_id,
                name,
                email,
                password_hash,
                role
            )
            VALUES($1,$2,$3,$4,$5)
            RETURNING
                user_id,
                business_id,
                name,
                email,
                role
            `,
            [
                businessId,
                name,
                email,
                passwordHash,
                "owner"
            ]
            );
        await client.query("COMMIT");
        return userResult.rows[0];
    }catch(error){
        await client.query('ROLLBACK');
        throw error;
    }finally{
        client.release();
    }

    

}

async function loginUserService(email, password){
    const result = await query("SELECT user_id, business_id, name, email, password_hash, role FROM users WHERE email=$1", [email]);
    if(result.rowCount  === 0){
        throw new AppError("Invalid User Credentials", 401)
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password,user.password_hash);

    if(!isMatch){
        throw new AppError("Invalid User Credentials", 401);
    }

    const token = signToken({
        userId:user.user_id,
        businessId: user.business_id,
        role:user.role
    })
    return {
        token,
        user: {
            user_id: user.user_id,
            business_id: user.business_id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };

}


async function getCurrentUserService(userId) {
    const result = await query(
        `
        SELECT
            user_id,
            business_id,
            name,
            email,
            role
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    if (result.rowCount === 0) {
        throw new NotFoundError("User not found");
    }

    return result.rows[0];
}


export {getCurrentUserService,registerUserService,registerBusinessOwnerService,loginUserService }